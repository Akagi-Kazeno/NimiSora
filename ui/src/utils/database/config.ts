/**
 * 更新应用配置
 * @param key 配置键
 * @param value 配置值
 * @param description 描述
 */
export async function updateAppConfig(key: string, value: string, description?: string) {
  const timestamp = Math.floor(Date.now());
  // 检查是否存在该配置
  const existing = await window.electron.sql("SELECT * FROM app_config WHERE key = ? LIMIT 1", [key]);
  if (existing.length > 0) {
    // 更新现有配置
    return window.electron.sql(
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
export async function getAppConfig(key?: string) {
  let sql = 'SELECT * FROM app_config WHERE 1=1';
  const params: any[] = [];
  if (key) {
    sql += ' WHERE key LIKE ?';
    params.push(`%${key}%`);
  }
  sql += ' ORDER BY id DESC';
  return window.electron.sql(sql, params);
}

/**
 * 获取应用配置总数
 * @param key
 */
export async function getAppConfigCount(key?: string): Promise<number> {
  let sql = 'SELECT COUNT(*) as count FROM app_config WHERE 1=1';
  const params: any[] = [];
  if (key) {
    sql += ' AND key LIKE ?';
    params.push(`%${key}%`);
  }
  const result = await window.electron.sql(sql, params);
  return result[0].count || 0;
}
