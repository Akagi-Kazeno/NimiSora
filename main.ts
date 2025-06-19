import {app, BrowserWindow} from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import {LoggerService, SQLiteService} from './services';
import {initDatabase} from './services/init-sqlite';

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
  const isDbExists = fs.existsSync(dbPath);
  const sqliteService = new SQLiteService(dbPath);
  if (!isDbExists) {
    await initDatabase(sqliteService['sequelize']);
  }
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

  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
