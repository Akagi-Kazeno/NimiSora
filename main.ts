import {app, BrowserWindow, ipcMain} from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import {LoggerService, SQLiteService} from './services';
import {initDatabase} from './services/init-sqlite';
import shell = Electron.shell;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  // Load the Angular application
  const angularIndexPath = path.join(process.cwd(), 'ui', 'dist', 'ui', 'browser', 'index.html');
  win.loadFile(angularIndexPath);
  // Hide the menu bar
  win.setMenu(null);
  // DevTools
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' && input.type === 'keyDown') {
      if (win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools();
      } else {
        win.webContents.openDevTools();
      }
    }
  });
}

app.whenReady().then(async () => {
  // 判断环境
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  // 日志和数据库路径
  const logDir = isDev ? path.join(process.cwd(), 'logs') : path.join(app.getPath('userData'), 'logs');
  const dataDir = isDev ? path.join(process.cwd(), 'data') : path.join(app.getPath('userData'), 'data');
  // 确保目录存在
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, {recursive: true});
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, {recursive: true});

  const dbPath = path.join(dataDir, 'NimiSora.db');
  const sqliteService = new SQLiteService(dbPath);
  await initDatabase(sqliteService['sequelize']);
  // 数据库结构自动同步
  await sqliteService['sequelize'].sync({alter: true});
  const logger = new LoggerService(undefined, sqliteService);
  logger.info('App started');

  // 读取主题配置并通过IPC发送到渲染进程
  const themeRow = await sqliteService.query("SELECT value FROM app_config WHERE key='theme' LIMIT 1");
  if (themeRow && themeRow[0] && themeRow[0].value) {
    const theme = themeRow[0].value;
    // 发送主题到所有窗口
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('set-theme', theme);
    });
  }

  // --- 通用 SQL IPC ---
  ipcMain.handle('sql', async (_event, sql: string, params?: any[]) => {
    try {
      // 只允许 select/insert/update/delete 语句
      const lower = sql.trim().toLowerCase();
      if (lower.startsWith('select')) {
        return await sqliteService.query(sql, params);
      } else {
        return await sqliteService.run(sql, params);
      }
    } catch (e) {
      logger.error(`SQL run failed: ${sql},error: ${JSON.stringify(e)}`);
      return {error: e + ''};
    }
  });

  // --- 保存文件IPC ---
  ipcMain.handle('saveFile', async (_event, filepath: string, filename: string, content: string) => {
    try {
      if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath, {recursive: true});
      }

      const filePath = path.join(filepath, filename);
      fs.writeFileSync(filePath, content, 'utf8');
      logger.info(`File saved: ${filePath}`);
      return {success: true, filePath};
    } catch (e) {
      logger.error(`File save failed: ${e}`);
      return {success: false, error: e + ''};
    }
  });

  // --- 打开目录IPC ---
  ipcMain.handle('openDirectory', async (_event, dirPath: string) => {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true});
      }
      await shell.openPath(dirPath);
      logger.info(`Directory opened: ${dirPath}`);
      return {success: true, dirPath};
    } catch (e) {
      logger.error(`Failed open directory: ${e}`);
      return {success: false, error: e + ''};
    }
  });

  // --- 移动目录IPC ---
  ipcMain.handle('moveDirectory', async (_event, oldPath: string, newPath: string) => {
    try {
      if (!oldPath || !newPath) {
        return {success: false, error: 'Source and destination paths cannot be empty.'};
      }
      if (!fs.existsSync(oldPath)) {
        return {success: false, error: `Source directory does not exist: ${oldPath}`};
      }
      if (path.resolve(oldPath) === path.resolve(newPath)) {
        return {success: false, error: 'Source and destination paths are the same.'};
      }
      const targetParent = path.dirname(newPath);
      if (!fs.existsSync(targetParent)) {
        fs.mkdirSync(targetParent, {recursive: true});
      }
      // 如果目标目录已存在，合并内容
      if (fs.existsSync(newPath)) {
        logger.info(`Directory already exists, merging: ${oldPath} -> ${newPath}`);
        // 如果目标目录已存在，递归复制内容
        const copyRecursive = (src: string, dest: string) => {
          const stat = fs.statSync(src);
          if (stat.isDirectory()) {
            if (!fs.existsSync(dest)) {
              fs.mkdirSync(dest, {recursive: true});
            }
            const files = fs.readdirSync(src);
            for (const file of files) {
              copyRecursive(path.join(src, file), path.join(dest, file));
            }
          } else {
            fs.copyFileSync(src, dest);
          }
        };
        // copy all files from oldPath to newPath
        const files = fs.readdirSync(oldPath);
        for (const file of files) {
          const srcFile = path.join(oldPath, file);
          const destFile = path.join(newPath, file);
          copyRecursive(srcFile, destFile);
        }
        // 删除源目录
        fs.rmSync(oldPath, {recursive: true, force: true});
      } else {
        // 直接移动目录
        fs.renameSync(oldPath, newPath);
      }
      logger.info(`Directory moved from ${oldPath} to ${newPath}`);
      return {success: true, oldPath, newPath};
    } catch (e) {
      logger.error(`Failed move directory: ${e}`);
      return {success: false, error: e + ''};
    }
  });

  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
