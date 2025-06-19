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
}
