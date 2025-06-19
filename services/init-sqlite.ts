import * as path from 'path';
import {app} from 'electron';
import {DataTypes, Sequelize} from 'sequelize';

/**
 * 初始化应用数据库
 * @param sequelize Sequelize 实例
 */
export async function initDatabase(sequelize: Sequelize) {
  // app_config 表
  const AppConfig = sequelize.define('app_config', {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    key: {type: DataTypes.STRING, unique: true, allowNull: false},
    value: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING},
    created_at: {type: DataTypes.INTEGER, defaultValue: () => Math.floor(Date.now())},
    updated_at: {type: DataTypes.INTEGER, defaultValue: () => Math.floor(Date.now())},
  }, {timestamps: false, freezeTableName: true});

  // logs 表
  const Logs = sequelize.define('logs', {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    level: {type: DataTypes.STRING, allowNull: false},
    event: {type: DataTypes.STRING, allowNull: false},
    message: {type: DataTypes.STRING, allowNull: false},
    context: {type: DataTypes.STRING},
    timestamp: {type: DataTypes.INTEGER, defaultValue: () => Math.floor(Date.now())},
    cost_time: {type: DataTypes.NUMBER},
  }, {timestamps: false, freezeTableName: true});

  await sequelize.sync();

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  const logDir = (isDev ? path.join(process.cwd(), 'data') : path.join(app.getPath('userData'), 'logs')).replace(/'/g, "''");
  const tempDir = (isDev ? path.join(process.cwd(), 'temp') : path.join(app.getPath('userData'), 'temp')).replace(/'/g, "''");


  // 默认配置
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
