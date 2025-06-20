// SQLite 服务层
import {QueryTypes, Sequelize} from 'sequelize';

export class SQLiteService {
  private sequelize: Sequelize;

  constructor(dbPath: string) {
    this.sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: dbPath,
      logging: (...msg) => console.log(msg)
    });
  }

  async query(sql: string, params?: any[]): Promise<any> {
    return this.sequelize.query(sql, {
      replacements: params,
      type: QueryTypes.SELECT
    });
  }

  async run(sql: string, params?: any[]): Promise<any> {
    return this.sequelize.query(sql, {
      replacements: params,
      type: QueryTypes.RAW
    });
  }

  async close() {
    await this.sequelize.close();
  }

  // region log actions
  /**
   * 写入日志到logs表
   * @param level 日志级别
   * @param event 事件名称
   * @param message 日志内容
   * @param context 上下文信息
   * @param cost_time 耗时，单位毫秒
   */
  async insertLog(level: string, event: string, message: string, context?: string, cost_time?: number) {
    const timestamp = Math.floor(Date.now());
    return this.run(
      `INSERT INTO app_log (level, event, message, context, timestamp, cost_time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [level, event, message, context || '', timestamp, cost_time || null]
    );
  }

  /**
   * 获取日志, 按等级、时间范围、event过滤
   * @param filters { level?: string, event?: string, startTime?: number, endTime?: number }
   */
  async getLogs(filters: { level?: string, event?: string, startTime?: number, endTime?: number } = {}) {
    let sql = 'SELECT * FROM app_log WHERE 1=1';
    const params: any[] = [];
    if (filters.level) {
      sql += ' AND level = ?';
      params.push(filters.level);
    }
    if (filters.event) {
      sql += ' AND event LIKE ?';
      params.push(`%${filters.event}%`);
    }
    if (filters.startTime) {
      sql += ' AND timestamp >= ?';
      params.push(filters.startTime);
    }
    if (filters.endTime) {
      sql += ' AND timestamp <= ?';
      params.push(filters.endTime);
    }
    sql += ' ORDER BY timestamp DESC';
    return this.query(sql, params);
  }

  // endregion

  // region app config actions
  /**
   * 更新应用配置
   * @param key 配置键
   * @param value 配置值
   * @param description 描述
   */
  async updateAppConfig(key: string, value: string, description?: string) {
    const timestamp = Math.floor(Date.now());
    // 检查是否存在该配置
    const existing = await this.query("SELECT * FROM app_config WHERE key = ? LIMIT 1", [key]);
    if (existing.length > 0) {
      // 更新现有配置
      return this.run(
        `UPDATE app_config
         SET value       = ?,
             description = ?,
             updated_at  = ?
         WHERE key = ?`,
        [value, description || '', timestamp, key]
      );
    } else {
      throw new Error(`Configuration with key '${key}' does not exist.`);
    }
  }

  /**
   * 获取应用配置
   * @param key
   */
  async getAppConfig(key?: string) {
    let sql = 'SELECT * FROM app_config WHERE 1=1';
    const params: any[] = [];
    if (key) {
      sql += ' WHERE key LIKE ?';
      params.push(`%${key}%`);
    }
    sql += ' ORDER BY id DESC';
    return this.query(sql, params);
  }

  // endregion
}
