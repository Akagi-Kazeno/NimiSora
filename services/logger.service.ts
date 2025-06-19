import * as fs from 'fs';
import * as path from 'path';
import type {LogLevel} from './types/level';
import type {SQLiteService} from './sqlite.service';

// 日志服务层
export class LoggerService {
  private static levelOrder: Record<LogLevel, number> = {
    'DEBUG': 0,
    'INFO': 1,
    'WARN': 2,
    'ERROR': 3,
    'CRITICAL': 4
  };
  private currentLevel: LogLevel = 'INFO';
  private logFile: string;
  private readonly sqliteService?: SQLiteService;
  private maxSize: number = 10 * 1024 * 1024; // 默认最大日志文件大小10MB
  private maxFiles: number = 10; // 默认最多10个日志文件

  constructor(logFilePath?: string, sqliteService?: any) {
    this.sqliteService = sqliteService;
    // 日志文件名添加当前日期
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    this.logFile = (logFilePath || path.join(process.cwd(), 'logs', `app_${dateStr}.log`));
    // 确保目录存在
    const dir = path.dirname(this.logFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
    if (sqliteService) {
      this.loadConfigFromDb();
    }
  }

  setLevel(level: LogLevel) {
    this.currentLevel = level;
  }

  getTimestamp(): string {
    return new Date().toISOString();
  }

  info(message: string) {
    if (this.shouldLog('INFO')) {
      this.writeLog('INFO', message);
      this.rotateLogs();
    }
  }

  error(message: string) {
    if (this.shouldLog('ERROR')) {
      this.writeLog('ERROR', message);
      this.rotateLogs();
    }
  }

  warn(message: string) {
    if (this.shouldLog('WARN')) {
      this.writeLog('WARN', message);
      this.rotateLogs();
    }
  }

  debug(message: string) {
    if (this.shouldLog('DEBUG')) {
      this.writeLog('DEBUG', message);
      this.rotateLogs();
    }
  }

  critical(message: string) {
    if (this.shouldLog('CRITICAL')) {
      this.writeLog('CRITICAL', message);
      this.rotateLogs();
    }
  }

  private async loadConfigFromDb() {
    if (!this.sqliteService) return;
    try {
      // 日志等级
      const levelRow = await this.sqliteService.query("SELECT value FROM app_config WHERE key='log_level' LIMIT 1");
      if (levelRow && levelRow[0] && levelRow[0].value) {
        this.currentLevel = levelRow[0].value;
      }
      // 日志文件路径
      const pathRow = await this.sqliteService.query("SELECT value FROM app_config WHERE key='log_path' LIMIT 1");
      if (pathRow && pathRow[0] && pathRow[0].value) {
        this.logFile = pathRow[0].value;
        const dir = path.dirname(this.logFile);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
      }
      // 最大日志大小
      const sizeRow = await this.sqliteService.query("SELECT value FROM app_config WHERE key='max_log_size' LIMIT 1");
      if (sizeRow && sizeRow[0] && sizeRow[0].value) {
        this.maxSize = parseInt(sizeRow[0].value, 10);
      }
      // 最大日志文件数量
      const filesRow = await this.sqliteService.query("SELECT value FROM app_config WHERE key='max_log_files' LIMIT 1");
      if (filesRow && filesRow[0] && filesRow[0].value) {
        this.maxFiles = parseInt(filesRow[0].value, 10);
      }
    } catch (e) {/* 忽略异常 */
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LoggerService.levelOrder[level] >= LoggerService.levelOrder[this.currentLevel];
  }

  private writeLog(level: LogLevel, message: string) {
    const logLine = `[${level}] ${message}, Timestamp: ${this.getTimestamp()}\n`;
    fs.appendFileSync(this.logFile, logLine);
  }

  private rotateLogs() {
    // 检查当前日志文件大小，超出则新建新日志文件
    if (fs.existsSync(this.logFile) && fs.statSync(this.logFile).size > this.maxSize) {
      const dir = path.dirname(this.logFile);
      const base = path.basename(this.logFile, '.log');
      // 查找所有同前缀日志文件(升序，最旧在前)
      const files = fs.readdirSync(dir)
        .filter(f => f.startsWith(base) && f.endsWith('.log'))
        .map(f => ({f, t: fs.statSync(path.join(dir, f)).mtime.getTime()}))
        .sort((a, b) => a.t - b.t); //
      let newIndex = 1;
      if (files.length > 0) {
        // 找到最大索引
        const last = files[files.length - 1].f.match(/\.(\d+)\.log$/);
        newIndex = last ? parseInt(last[1], 10) + 1 : files.length + 1;
      }
      const newLogFile = this.logFile.replace(/\.log$/, `.${newIndex}.log`);
      fs.renameSync(this.logFile, newLogFile);
      // 超出最大数量则覆盖最旧的日志文件
      const allLogs = fs.readdirSync(dir)
        .filter(f => f.startsWith(base) && f.endsWith('.log'))
        .map(f => ({f, t: fs.statSync(path.join(dir, f)).mtime.getTime()}))
        .sort((a, b) => a.t - b.t);
      if (allLogs.length > this.maxFiles) {
        // 覆盖最旧的日志文件
        fs.unlinkSync(path.join(dir, allLogs[0].f));
      }
    }
  }
}
