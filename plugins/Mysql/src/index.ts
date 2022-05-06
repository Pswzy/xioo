/*
 * @version: 
 * @Author: dee
 * @Date: 2021-01-23 11:00:05
 * @LastEditors: dee
 * @LastEditTime: 2021-01-25 11:05:49
 */
import mysql from 'mysql';
import QueryDB from './query';

interface IMySQL {
  /** 端口号 默认80 */
  port?: number;
  /** 地址 */
  host: string;
  /** 密码 */
  password?: string;
  /** 数据库 */
  database?: string;
  /** 用户名 */
  user: string;
}
type ItemData = string | number;
type InsertData = { [key: string]: ItemData } | ItemData[];
type CommonObj = { [key: string]: any };

class MysqlDB extends QueryDB {

  dbnet: mysql.Pool;
  config: IMySQL;

  constructor(config: IMySQL) {
    super({ type: 'mysql' });
    this.config = config;
    this.dbconnect();
  }

  /** 数据库连接 */
  dbconnect() {
    // const connection = mysql.createConnection(this.config);

    // connection.connect(err => {
    //   if (err) {
    //     console.log('连接出错了');
    //     console.log(err);
    //   } else {
    //     this.dbnet = connection;
    //     console.log('mysql成功连接！')
    //   }
    // })
    this.dbnet = mysql.createPool(this.config);
    // success && success();

    console.log(`mysql: ${this.config.host} ${this.config.database} 连接了`)
  }

  /** 获取一个连接池 */
  async getConnection(): Promise<mysql.PoolConnection> {
    return new Promise((resolve, reject) => {
      this.dbnet.getConnection((err, connection) => {
        if(err) {
          reject(err);
        } else {
          resolve(connection);
        }
      })
    })
  }

  /** 执行事务 */
  async transaction(callback) {
    const connection = await this.getConnection();
    return new Promise((resolve, reject) => {
      connection.beginTransaction(async err => {
        if(err) {
          return '开启事务失败';
        }
        try {
          const res = await callback({
            query: async (sql) => this.dbquery(sql, connection),
            insert: async (table: string, data: { [key: string]: string }) => this.insert(table, data, connection),
            delete: async (table: string, data: InsertData, options: CommonObj = {}) => this.delete(table, data, options, connection),
            update: async (table: string, data: InsertData, options: CommonObj = {}) => this.update(table, data, options, connection)
          });
          await this.commit(connection);
          connection.release();
          resolve(res);
        } catch(e) {
          console.log('事务执行失败')
          console.log(e);
          await this.rollback(connection);
          connection.release();
          reject(e);
        }
      })
    });
    
  }

  /** 事务回滚 */
  async rollback(connection: mysql.PoolConnection) {
    return new Promise((resolve) => {
      connection.rollback(() => {
        console.log('开始回滚');
        resolve('');
        connection.destroy();
      })
    })
  }

  /** 事务提交 */
  async commit(connection: mysql.PoolConnection) {
    return new Promise((resolve, reject) => {
      connection.commit((err) => {
        if(err) {
          reject();
        } else {
          resolve('');
        }
        connection.destroy();
      })
      
    })
  }
  

  /** 终极查询语句 */
  dbquery(sql: string, connection?: mysql.PoolConnection): Promise<any> {
    return new Promise((resolve, reject) => {
      const net = connection ? connection : this.dbnet;
      net.query(sql, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(JSON.stringify(data)));
        }
      })
    })
  }

  async query(sql: string, connection?: mysql.PoolConnection): Promise<any> {
    return this.dbquery(sql, connection);
  }

  async insert(table: string, data: { [key: string]: string }, connection?: mysql.PoolConnection) {
    return this.insertDb(table, data, this.query.bind(this), connection);
  }

  async delete(table: string, data: InsertData, options: CommonObj = {}, connection?: mysql.PoolConnection) {
    return this.deleteDb(table, data, options, this.query.bind(this), connection);
  }

  async update(table: string, data: InsertData, options: CommonObj = {}, connection?: mysql.PoolConnection) {
    return this.updateDb(table, data, options, this.query.bind(this), connection);
  }
}

export = MysqlDB;