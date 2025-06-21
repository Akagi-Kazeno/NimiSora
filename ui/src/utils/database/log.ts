/**
 * 写入日志到logs表
 * @param level 日志级别
 * @param event 事件名称
 * @param message 日志内容
 * @param context 上下文信息
 * @param cost_time 耗时，单位毫秒
 */
export async function insertLog(level: string, event: string, message: string, context?: string, cost_time?: number) {
  const timestamp = Math.floor(Date.now());
  return window.electron.sql(
    `INSERT INTO app_log (level, event, message, context, timestamp, cost_time)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [level, event, message, context || '', timestamp, cost_time || null]
  );
}

/**
 * 获取日志, 按等级、时间范围、event、分页过滤
 * @param filters { level?: string, event?: string, startTime?: number, endTime?: number, offset?: number, limit?: number }
 */
export async function getLogs(filters: {
  level?: string,
  event?: string,
  startTime?: number,
  endTime?: number,
  offset?: number,
  limit?: number
} = {}) {
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
  if (typeof filters.offset === 'number' && typeof filters.limit === 'number' && filters.limit !== -1) {
    sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(filters.limit, filters.offset);
  } else {
    sql += ' ORDER BY timestamp DESC';
  }
  sql += ' ORDER BY timestamp DESC';
  return window.electron.sql(sql, params);
}
