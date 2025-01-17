/**
 * 读取用户的配置信息
 * @version: 0.0.1
 * @Author: dee
 * @Date: 2021-01-19 20:01:32
 * @LastEditors: dee
 * @LastEditTime: 2021-01-19 20:01:56
 */

import * as path from 'path';
import App from '../App';

/** Redis */
interface IRedis {
  /** 端口号 默认80 */
  port?: number;
  /** 地址 */
  host: string;
  /** 密码 */
  password?: string;
  /** 是否启动 */
  launch?: boolean;
}

interface IHtppServer {
  port: number;
}

interface IMySQL {
  /** 端口号 默认80 */
  port?: number;
  /** 地址 */
  host: string;
  /** 密码 */
  password?: string;
  /** 用户名 */
  user: string;
  /** 是否启动连接 */
  launch?: boolean;
}

interface IPgSQL {
  /** 端口号 默认80 */
  port?: number;
  /** 地址 */
  host: string;
  /** 密码 */
  password?: string;
  /** 用户名 */
  user: string;
  /** 最大空闲时间 ms */
  idleTimeoutMillis?: number;
  /** 连接池最大连接数, 默认10 */
  max?: number;
  /** 连接超时时间 ms */
  connectionTimeoutMillis?: number;
  /** 是否启动连接 */
  launch?: boolean;
}

interface ISocket {
  redis: IRedis;
  [key: string]: any;
}

interface ISource<T> {
  [key: string]: T
}

class Config {
  /** 全局app上下文 */
  app: App;
  redis: ISource<IRedis>;
  http: IHtppServer;
  mysql: ISource<IMySQL>;
  /** pg配置 */
  pg: ISource<IPgSQL>;
  socketConfig: ISocket;
  xios: any;
  es: any;
  /** email配置 */
  email: any;
  /** kafka生产者配置 */
  kafkaProducer: any;
  /** kafka消费者配置 */
  kafkaConsumer: any;
  /** 其他的配置 */
  rests: { [key: string]: any };

  constructor(app: App) {
    this.app = app;
    this.readAllConfig();
  }

  /** 读取config文件下的内容 */
  readAllConfig() {
    this.app.projectRoot;
    const ServerConfigSource = this.app.helper.getDirToFileSource(path.join(this.app.readRoot, './config'));
    // 服务端的配置
    const ServerConfig = new ServerConfigSource.server();

    const { redis = {}, httpServer, mysql = {}, pg = {}, socket = {}, xios = {}, es = {}, kafka = {}, email, ...props } = ServerConfig;
    const { kafkaProducer = {}, kafkaConsumer = {} } = kafka;
    this.redis = redis;
    this.mysql = mysql;
    this.pg = pg;
    // this.redis = redis.filter(item => item.launch);
    this.http = httpServer;
    // this.mysql = mysql.filter(item => item.launch);
    // this.pg = pg.filter(item => item.launch);
    this.socketConfig = socket;
    // 读取kafka配置
    this.kafkaProducer = kafkaProducer;
    this.kafkaConsumer = kafkaConsumer;
    // 读取xioos配置数据
    this.xios = xios;
    this.rests = props;
    this.es = es;
    this.email = email;
  }
}

export = Config;