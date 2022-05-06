import { Pool, PoolConfig, PoolClient } from 'pg';
import { Helper } from 'xioo';

import Query from './query';

type ItemData = string | number;
type InsertData = { [key: string]: ItemData } | ItemData[];
type CommonObj = { [key: string]: any };

class PostgreSQL extends Query {

  /** 连接实例 */
  pool: Pool;
  /** 是否自动转下划线 */
  underline: boolean;
  /** 连接配置 */


  constructor({ launch, underline, ...config }) {
    super({ type: 'pg', underline });
    this.underline = underline;
    this.connect(config);
  }
  /**
   * 
   * {
      user: 'postgres',
      host: 'localhost',
      database: 'mytest',
      password: '123456',
      port: 5432,
    }
   */
  /** 连接 */
  private connect(config: PoolConfig) {
    this.pool = new Pool(config);
    console.log(`${config.database} 连接了 ${config.port}`);
    // console.log(this.pool);
  }

  /** 获取一个连接 */
  private getConnection(): Promise<{ client: PoolClient, done }> {
    return new Promise((resolve) => {
      this.pool.connect((err, client, done) => {
        if(err) {
          done();
          resolve({ client, done })
        }
        resolve({ client, done })
      })
    })
  }

  /** 开始事务 */
  async transaction(callback) {
    // 开始一个连接
    const { client, done } = await this.getConnection();
    return new Promise((recolve, reject) => {
      client.query('BEGIN', async err => {
        if(err) {
          console.red('pg开始事务失败');
          await this.rollback(client, done);
          return;
        }
        try {
          const res = await callback({
            query: async (sql) => this.query(sql, client),
            insert: async (table: string, data: { [key: string]: string }) => this.insert(table, data, client),
            delete: async (table: string, data: InsertData, options: CommonObj = {}) => this.delete(table, data, options, client),
            update: async (table: string, data: InsertData, options: CommonObj = {}) => this.update(table, data, options, client)
          })
          await this.commit(client, done);
          recolve(res);
        } catch (e) {
          console.red('pg事务执行失败');
          console.log(e);
          await this.rollback(client, done);
          reject(e);
        }
      })
    })
  }

  /** 事务回滚 */
  private rollback(client: PoolClient, done) {
    return new Promise((resolve) => {
      client.query('ROLLBACK', err => {
        if(err) {
          console.red('pg回滚失败');
          console.red(err.stack);
        }
        console.log('开始回滚');
        done();
        resolve('');
      })
    })
  }

  /** 提交事务 */
  async commit(client: PoolClient, done) {
    return new Promise((resolve) => {
      client.query('COMMIT', err => {
        if(err) {
          console.red('pg提交失败');
          console.red(err.stack);
        }
        console.log('开始提交');
        done();
        resolve('');
      })
    })
  }

  /** 查询 */
  query(sql: string, client?: PoolClient) {
    return new Promise((resolve, reject) => {
      if(client) {
        this.execQuery(sql, client, (err, rows) => {
          if(err) {
            reject(err);
          } else {
            resolve(rows);
          }
        })
        return;
      }

      this.pool.connect((err, client, done) => {
        if (err) throw err;
        this.execQuery(sql, client, (err, rows) => {
          done()
          if(err) {
            reject(err);
          } else {
            resolve(rows);
          }
        })
        // client.query(sql, (err, res) => {
        //   done()
        //   if (err) {
        //     reject(err);
        //   } else {
        //     let rows = res.rows;
        //     if(Array.isArray(rows) && this.underline) {
        //       rows = Helper.toHump(rows);
        //     }
        //     resolve(rows);
        //   }
        // })
      })
    })
  }

  /** 执行查询 */
  execQuery(sql, client: PoolClient, callback) {
    client.query(sql, (err, res) => {
      if (err) {
        // reject(err);
        callback && callback(err);
      } else {
        let rows = res.rows;
        if(Array.isArray(rows) && this.underline) {
          rows = Helper.toHump(rows);
        }
        // resolve(rows);
        callback && callback(null, rows);
      }
    })
  }

  async insert(table: string, data: { [key: string]: string }, client?: PoolClient) {
    return this.insertDb(table, data, this.query.bind(this), client);
  }

  async delete(table: string, data: InsertData, options: CommonObj = {}, client?: PoolClient) {
    return this.deleteDb(table, data, options, this.query.bind(this), client);
  }

  async update(table: string, data: InsertData, options: CommonObj = {}, client?: PoolClient) {
    return this.updateDb(table, data, options, this.query.bind(this), client);
  }
}

export default PostgreSQL;