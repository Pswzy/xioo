/**
 * redis连接
 * @version: 
 * @Author: dee
 * @Date: 2021-01-17 15:32:39
 * @LastEditors: dee
 * @LastEditTime: 2021-01-19 21:19:17
 */
import { createClient } from 'redis';

/** Redis */
interface IRedis {
  /** 端口号 默认80 */
  port?: number;
  /** 地址 */
  host: string;
  /** 密码 */
  password?: string;
  /** 数据库号 */
  db?: number;
}


class Redis {

  dbnet;
  /** 端口号 */
  port = 6379;
  /** 地址 */
  host = '127.0.0.1';
  /** 密码 */
  password = '';
  /** 数据库号 */
  db?: number;
  constructor({
    port,
    host,
    password,
    db
  }: IRedis) {
    this.port = port;
    this.host = host;
    this.password = password;
    this.db = db;
    this.connect();
  }

  /** 连接 */
  connect() {
    if (!this.dbnet) {
      const connection = createClient({
        // port: this.port,
        url: `redis://${this.host}:${this.port}`,
        // host: this.host,
        password: this.password,
        database: this.db
      });
      this.dbnet = connection;
      connection.on('connect', () => {
        console.log('Redis client connected' + this.host + ':' + this.port);
        // this.dbnet = connection;
      });
      connection.on('error', (error) => {
        console.log('Redis client error');
        console.log(error);
      });
      connection.connect();
    }
  }

  /** 设置字符数据 */
  setString(key: string, data: string, time?: number) {
    this.dbnet.set(key, data);
    if (time) {
      this.dbnet.expire(key, time);
    }
  }

  /** 追加字符数据 */
  appendString(key: string, data: string) {
    this.dbnet.append(key, data);
  }

  /** 从列表左侧插入数据 */
  lpushKey(key: string, data: string) {
    return this.dbnet.lpush(key, data);
  }
  /** 从列表右侧插入数据 */
  rpushKey(key: string, data: string) {
    return this.dbnet.rpush(key, data);
  }
  /** 从列表左侧弹出单个key */
  lpopKey(key: string) {
    return this.dbnet.lpop(key);
  }
  /** 从列表右侧弹出单个key */
  rpopKey(key: string) {
    return this.dbnet.rpop(key);
  }
  /** 删除单个数据 */
  delKey(key: string) {
    this.dbnet.del(key);
  }

  /** 删除多个数据 */
  delKeys(keys: Array<string>) {
    this.dbnet.del(...keys);
  }

  /** 获取字符数据 */
  getString(key: string) {
    return this.dbnet.get(key);
  }
}

export = Redis;