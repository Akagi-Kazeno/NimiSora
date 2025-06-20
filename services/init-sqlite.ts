import * as path from 'path';
import {app} from 'electron';
import {DataTypes, QueryTypes, Sequelize} from 'sequelize';
import {LoggerService} from "./logger.service";

/**
 * 初始化应用数据库
 * @param sequelize Sequelize 实例
 */
export async function initDatabase(sequelize: Sequelize) {
  /**
   * 应用配置表
   * id: 主键，自增
   * key: 配置项键，唯一
   * value: 配置项值
   * description: 配置项描述
   * created_at: 创建时间戳
   * updated_at: 更新时间戳
   */
  const AppConfig = sequelize.define('app_config', {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    key: {type: DataTypes.STRING, unique: true, allowNull: false},
    value: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING},
    created_at: {type: DataTypes.INTEGER, defaultValue: () => Math.floor(Date.now())},
    updated_at: {type: DataTypes.INTEGER, defaultValue: () => Math.floor(Date.now())},
  }, {timestamps: false, freezeTableName: true});

  /**
   * 日志表
   * id: 主键，自增
   * level: 日志级别(DEBUG, INFO, WARN, ERROR, CRITICAL)
   * event: 事件名称
   * message: 日志消息
   * context: 上下文信息
   * timestamp: 时间戳
   * cost_time: 处理时间(毫秒)
   */
  const Logs = sequelize.define('app_log', {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    level: {type: DataTypes.STRING, allowNull: false},
    event: {type: DataTypes.STRING, allowNull: false},
    message: {type: DataTypes.STRING, allowNull: false},
    context: {type: DataTypes.STRING},
    timestamp: {type: DataTypes.INTEGER, defaultValue: () => Math.floor(Date.now())},
    cost_time: {type: DataTypes.NUMBER},
  }, {timestamps: false, freezeTableName: true});

  await sequelize.sync();

  // 日志清理
  const maxNumRow = await AppConfig.findOne({where: {key: 'max_database_log_num'}});
  const autoClearRow = await AppConfig.findOne({where: {key: 'database_log_auto_clear'}});
  const clearDaysRow = await AppConfig.findOne({where: {key: 'database_log_clear_days'}});
  const maxNum = maxNumRow ? Number(maxNumRow.get('value') as string) : 10000;
  const autoClear = autoClearRow ? (autoClearRow.get('value') as string) === 'true' : true;
  const clearDays = clearDaysRow ? Number(clearDaysRow.get('value') as string) : 30;
  let clearedNum = 0, clearedDays = 0;
  if (autoClear) {
    // 超过最大数量，清理最旧日志
    const logCountResult = await sequelize.query('SELECT COUNT(*) as cnt FROM app_log', {type: QueryTypes.SELECT});
    const logCount = logCountResult && logCountResult[0] && typeof (logCountResult[0] as any).cnt !== 'undefined' ? Number((logCountResult[0] as any).cnt) : 0;
    if (logCount > maxNum) {
      const toDelete = logCount - maxNum;
      await sequelize.query('DELETE FROM app_log WHERE id IN (SELECT id FROM app_log ORDER BY timestamp ASC LIMIT ?)', {replacements: [toDelete]});
      clearedNum = toDelete;
    }
    // 超过最大天数，清理过期日志
    const expireTime = Math.floor(Date.now() / 1000) - clearDays * 24 * 3600;
    const [oldLogs] = await sequelize.query('SELECT COUNT(*) as cnt FROM app_log WHERE timestamp < ?', {
      replacements: [expireTime],
      type: QueryTypes.SELECT
    });
    const oldCount = oldLogs && (oldLogs as any).cnt ? Number((oldLogs as any).cnt) : 0;
    if (oldCount > 0) {
      await sequelize.query('DELETE FROM app_log WHERE timestamp < ?', {replacements: [expireTime]});
      clearedDays = oldCount;
    }
  }
  // 记录本地日志
  if (clearedNum > 0 || clearedDays > 0) {
    const logger = new LoggerService();
    if (clearedNum > 0) logger.info(`数据库日志超出最大数量，已清理最旧日志${clearedNum}条。`);
    if (clearedDays > 0) logger.info(`数据库日志超出最大保存天数，已清理过期日志${clearedDays}条。`);
  }

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  const logDir = (isDev ? path.join(process.cwd(), 'logs') : path.join(app.getPath('userData'), 'logs')).replace(/'/g, "''");
  const tempDir = (isDev ? path.join(process.cwd(), 'temp') : path.join(app.getPath('userData'), 'temp')).replace(/'/g, "''");

  /**
   * 默认应用配置
   * app_name: 应用名称
   * app_version: 应用版本
   * theme: 默认主题
   * temp_file_path: 默认临时文件路径
   * max_log_size: 最大日志文件大小(默认10MB)
   * max_log_files: 最大日志文件数量(默认10个)
   * log_level: 默认日志等级
   * log_path: 默认日志文件路径
   * max_database_log_num: 数据库日志最大数量(默认10000条)
   * database_log_auto_clear: 是否自动清理数据库日志(默认true)
   * database_log_clear_days: 数据库日志保留天数(默认30天)
   */
  const configDefaults = [
    {key: 'app_name', value: 'NimiSora', description: 'application name'},
    {key: 'app_version', value: '1.0.0', description: 'application version'},
    {key: 'theme', value: 'system', description: 'default theme'},
    {key: 'temp_file_path', value: tempDir, description: 'default temporary file path'},
    {key: 'max_log_size', value: '10485760', description: 'maximum log file size in bytes (default 10MB)'},
    {key: 'max_log_files', value: '10', description: 'maximum number of log files to keep (default 10)'},
    {key: 'log_level', value: 'INFO', description: 'default log level'},
    {key: 'log_path', value: logDir, description: 'default log file path'},
    {
      key: 'max_database_log_num',
      value: '10000',
      description: 'maximum number of logs to keep in the database (default 10000)'
    },
    {
      key: 'database_log_auto_clear',
      value: 'true',
      description: 'whether to automatically clear old logs in the database (default true)'
    },
    {
      key: 'database_log_clear_days',
      value: '30',
      description: 'number of days to keep logs in the database before clearing (default 30)'
    },
  ];
  for (const item of configDefaults) {
    await AppConfig.findOrCreate({where: {key: item.key}, defaults: item});
  }
}
