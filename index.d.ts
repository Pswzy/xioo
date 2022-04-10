declare module 'xioo' {
  import Koa from 'koa';
  import cornApp from 'node-cron';
  // import { Producer, Consumer } from 'kafka-node';
  import { Server as SocketServer } from 'socket.io';
  global {
    export interface Console {
      /** 绿色 */
      green: (value: any) => void;
      /** 红色 */
      red: (value: any) => void;
    }
  }

  export namespace XiooConfig {
    /** 数据服务的基础配置 */
    interface IModelSQL {
      /** 端口号 默认80 */
      port?: number | string;
      /** 地址 */
      host: string;
      /** 密码 */
      password?: string;
      /** 是否启动 */
      launch?: boolean;
      /** 数据库中时候下划线 */
      underline?: boolean;
    }

    interface ApiKeyAuth {
      apiKey:
        | string
        | {
            id: string;
            api_key: string;
          };
    }

    interface BasicAuth {
      username: string;
      password: string;
    }

    /** Redis */
    export interface IRedis extends IModelSQL {
      /** 数据库号 */
      db?: number | string;
    }

    /** MySQL */
    export interface IMySQL extends IModelSQL {
      user: string;
      database?: string;
    }

    /** pg */
    export interface IPgSQL extends IModelSQL {
      /** 用户 */
      user: string;
      /** 数据库 */
      database: string;
      /** 最大空闲时间 ms */
      idleTimeoutMillis?: number | string;
      /** 连接池最大连接数, 默认10 */
      max?: number | string;
      /** 连接超时时间 ms */
      connectionTimeoutMillis?: number | string;
    }

    /** http服务配置 */
    export interface IHtppServer {
      port: number | string;
    }

    /** Socket配置 */
    export interface ISocket {
      redis: IRedis;
      [key: string]: any;
    }

    interface XiosOptions {
      /** 请求基础路径 */
      baseUrl: string;
      /** 通用请求头 */
      headers?: any;
    }
    /** xios配置 */
    export interface IXios {
      [key: string]: XiosOptions;
    }
    /** es配置 */
    export interface IEs {
      /** 地址 */
      host: string;
      /** 端口 */
      port: number | string;
      /** 鉴权 */
      auth?: ApiKeyAuth | BasicAuth;
      /** 是否启动 */
      launch?: boolean;
    }

    export interface IKafkaProducer {
      [key: string]: any;
    }

    export interface IKafkaConsumer {
      [key: string]: any;
    }

    /** kafka配置 */
    export interface IKafka {
      /** 生产者配置 */
      kafkaProducer?: ISource<IKafkaProducer>;
      /** 消费者配置 */
      kafkaConsumer?: ISource<IKafkaConsumer>;
    }

    export interface IOpenResourceConfig {
      /** 开放目录, 如果存在则环境配置将失效 */
      openPath?: string;
      /** 全局的options */
      options?: IOpenOption;
    }

    export interface IOpenOption {
      /** 只写一个缓存,其他可以参考koa-static的配置 */
      maxAge?: number | string;
      /** 其他配置 */
      [key: string]: any;
    }

    export interface IOpenResourceItem extends IOpenResourceConfig {
      /** 可以根据环境变量READ_ENV的值取配置 */
      dev?: IOpenResourceConfig;
      fat?: IOpenResourceConfig;
      uat?: IOpenResourceConfig;
      prod?: IOpenResourceConfig;
      test?: IOpenResourceConfig;
      pro?: IOpenResourceConfig;
    }
  }

  /** redis连接 */
  interface IRedis {
    /** 设置字符串 */
    setString: (key: string, data: string, time?: number) => void;
    /** 获取字符串 */
    getString: (key: string) => Promise<string>;
    /** 追加字符数据 */
    appendString: (key: string, data: string, time?: number) => void;
    /** 从列表左侧插入数据 */
    lpushKey: (key: string, data: string) => void;
    /** 从列表右侧插入数据 */
    rpushKey: (key: string, data: string) => void;
    /** 从列表左侧弹出单个key */
    lpopKey: (key: string) => Promise<string>;
    /** 从列表右侧弹出单个key */
    rpopKey: (key: string) => Promise<string>;
    /** 删除单个数据 */
    delKey: (key: string) => void;
    /** 删除多个数据 */
    delKeys: (keys: Array<string>) => void;
  }

  type IConditions = {
    /** 字段名称 */
    field?: string;
    /** 值 */
    value?: string | any[] | number;
    /** 选项连接符 */
    option?: string;
    /** 类型 */
    type?: 'string' | 'number' | 'datetime';
    /** 连接符 */
    conn?: 'or' | 'and';
  };

  type QueryItem = {
    conn?: 'and' | 'or';
    conditions?: IConditions[];
    query?: QueryItem[];
    qConn?: 'and' | 'or';
  };

  type IQuerys = QueryItem[];

  /** mysql连接 */
  interface IMySQL {
    /** 查询 */
    dbquery: (sql: string) => Promise<any[]>;
    /** 查询 */
    query: (sql: string) => Promise<any[]>;
    /** 插入 */
    insert: (table: string, data: any) => Promise<any>;
    /** 删除 */
    delete: (table: string, data: any, options?: any) => Promise<any>;
    /** update */
    update: (table: string, data: any, options?: any) => Promise<any>;
    /** 获取高级查询条件拼接 */
    selectWhere: (querys: IQuerys) => string;
    /** 执行事务 */
    transaction: (callback: (conn: IMySQL) => any) => Promise<any>;
  }

  interface IPgSQL {
    /** 查询 */
    query: <T>(sql: string) => Promise<T>;
    /** 插入 */
    insert: (table: string, data: any) => Promise<any>;
    /** 删除 */
    delete: (table: string, data: any, options?: any) => Promise<any>;
    /** update */
    update: (table: string, data: any, options?: any) => Promise<any>;
    /** 获取高级查询条件拼接 */
    selectWhere: (querys: IQuerys) => string;
    /** 执行事务 */
    transaction: (callback: (conn: IPgSQL) => any) => Promise<any>;
  }

  interface IElasticSearch {
    /** 插入 */
    insert: (index, data, patch?: boolean) => void;
    /** 搜索 */
    search: (index, data?: any) => Promise<any>;
  }

  type CostomC = {
    state: {
      /** 响应数据 */
      data: any;
    };
    request: {
      /** 请求体 */
      body: any;
    };
  };
  type CostomCtx = Koa.DefaultContext & CostomC;

  export interface IService {
    app: App;
    ctx: CostomCtx;
    // PromiseValue: any;
  }

  interface ISource<T> {
    [key: string]: T;
  }

  interface IEmail {
    send: (options: IEmailOption) => any;
  }

  type IEmailOption = {
    /** 接收方 */
    to: string;
    /** 主题 */
    subject?: string;
    /** 邮件正文 */
    text?: string;
    /** html模板，存在html以html为准 */
    html?: string; 
  }

  /** service管理器 */
  interface IServiceManager extends IService {
    /** redis连接组 */
    redisGroup: ISource<IRedis>;
    /** mysql连接组 */
    mysqlGroup: ISource<IMySQL>;
    /** pg连接组 */
    pgGroup: ISource<IPgSQL>;
    /** es连接组 */
    esGroup: ISource<IElasticSearch>;
    /** email连接组 */
    emailGroup: ISource<IEmail>;
    /** 第一个redis连接 */
    redis: IRedis;
    /** 第一个mysql连接 */
    mysql: IMySQL;
    /** 第一个pg */
    pg: IPgSQL;
    /** 第一个es */
    es: IElasticSearch;
    /** 第一个email */
    email: IEmail;
    /** kafka */
    kafka: {
      producer: any;
      consumer: any;
    };
    /** 创建连接 */
    createConnection: (
      modelName: 'redis' | 'mysql' | 'pg',
      name: string,
      config
    ) => void;
  }

  interface IHelper {
    /** 获取某个目录下的所有文件路径映射 */
    dirTreePath(
      rootDir: string,
      exclude?: string[],
      includeFiles?: { [key: number]: string | RegExp }
    ): { [key: string]: string };
    /** 获取某个目录的所有文件资源映射 */
    dirTreeSource(rootDir: string, exclude?: string[]): { [key: string]: any };
  }

  interface ITask {
    status: boolean;
    task: cornApp.ScheduledTask;
  }

  interface ISchedules {
    [key: string]: ITask;
  }

  interface IRegisterProps {
    /** corn表达式 */
    corn: string;
    /** 任务名称 */
    name: string;
    /** 任务体 */
    handler: () => any;
    /** 是否启用 */
    status?: boolean;
    worker?: 'all' | 'worker' | string;
    /** 动态注册的状态 */
    dynamicStatus?: boolean;
  }

  interface IScheduleManager {
    /** 任务列表 */
    tasks: ISchedules;
    /** 启动任务 */
    start(name: string): void;
    /** 停止任务 */
    stop(name: string): void;
    /** 注册任务 */
    registerTask(
      props: IRegisterProps[],
      calllback?: (item: IRegisterProps) => void
    ): void;
  }

  interface IPluginManager {
    /** 注册插件 */
    registerPlugin: (plugins: any) => void;
    /** 插件列表 */
    plugins: IPlugin;
    /** 事件中心 */
    tap: any;
  }

  export interface IPlugin {}

  export class Plugin {
    app: App;
  }

  interface IXiooProps {
    baseUrl?: string;
    headers?: any;
  }

  interface IOption {
    /** 请求路径 */
    url?: string;
    /** 请求方法 */
    method?: 'get' | 'post' | 'delete' | 'option' | 'patch' | 'put' | 'head';
    /** 请求头 */
    headers?: { [key: string]: any };
    /** 请求体 */
    data?: { [key: string]: any };
    /** 获取的数据类型 默认utf-8 */
    encoding?: string;
    /** 路径参数 */
    params?: { [key: string]: any };
    /** 是否执行JSON.stringify，默认为true */
    stringifyData?: boolean;
    /** form适配 application/x-www-form-urlencoded */
    form?: any;
    /** 是否返回状态码,默认不返回 */
    isStatus?: boolean;
  }

  export class Xioos {
    constructor({ baseUrl, headers }: IXiooProps);
    get: <T>(url: string, options?: IOption) => Promise<T>;
    /** post请求方法 */
    post: <T>(url: string, options?: IOption) => Promise<T>;
    /** 通用请求方法 */
    requset: <T>(options: IOption) => Promise<T>;
    /** 上传文件方法 */
    upload: <T>(url: string, file: any, options?: IOption) => Promise<T>;
  }

  export const Agant;

  class App {
    // static Controller: any;
    // static Route: any;
    // static Post: any;
    constructor(options?: any)
    /** 帮助函数库 */
    helper: IHelper;
    /** 当前的启动目录 */
    projectRoot: string;
    /** 基础配置 */
    config: any;
    /** 请求器 */
    xios: { [key: string]: Xioos };
    /** 控制器 */
    controller: ControllerManager;
    /** 服务器 */
    service: IServiceManager;
    /** 定时任务 */
    schedule: IScheduleManager;
    /** 第一个redis连接 */
    redis: IRedis;
    /** 第一个mysql连接 */
    mysql: IMySQL;
    /** 第一pg连接 */
    pg: IPgSQL;
    /** 插件 */
    plugin: IPluginManager;
    /** 进程控制器 */
    agant: any;
    /** 动态设置请求对象 */
    setXioosByConfig: (xioosConfig: any) => void;
    /** 路由 */
    router: RouterManager;
    /** 实时通信, 只有开启了socket连接才可使用 */
    socket: SocketManger;

    /** 启动 */
    start(port?: number)
  }

  class SocketManger {
    io: SocketServer
  }

  class RouterManager {
    setRoute: (routes: IRoutes) => void;
  }

  interface IRoutes {
    /** 请求路径 */
    url: string;
    /** 请求方法 */
    method: 'get' | 'post' | 'delete' | 'option' | 'patch' | 'put' | 'head';
    /** controller */
    controller: (ctx: CostomCtx, next: () => void) => any;
  }

  interface ITaskProps {
    /** 任务名称，如果名称不存在将以方法名命名 */
    name?: string;
    /** corn表达式 */
    corn: string;
    /** 是否启用, 如果不存在以全局状态为准 */
    status?: boolean;
  }

  export class Schedule {
    static ScheduleComponent(status: boolean): (constrcutor: any) => void;
    static Task(
      props: ITaskProps
    ): (target: any, controllerName: string, descriptor: any) => void;

    app: App;
  }

  export class Controller {
    app: App;
    ctx: CostomCtx;
    next: any;
  }

  /** 服务配置 */
  export interface IServerConfig {
    /** redis配置 */
    redis?: ISource<XiooConfig.IRedis>;
    /** mysql配置 */
    mysql?: ISource<XiooConfig.IMySQL>;
    /** pg数据库配置 */
    pg?: ISource<XiooConfig.IPgSQL>;
    /** es数据库配置 */
    es?: ISource<XiooConfig.IEs>;
    /** http-server配置 */
    httpServer?: XiooConfig.IHtppServer;
    /** socket配置 */
    socket?: XiooConfig.ISocket;
    /** 请求配置 */
    xios?: XiooConfig.IXios;
    /** kafka配置 */
    kafka?: XiooConfig.IKafka;
    /** 启用的cpu核数，默认为全核数的一半 */
    startCpuAmount?: number;
    /** 开放静态资源 */
    openResource?:
      | string
      | string[]
      | XiooConfig.IOpenResourceConfig
      | XiooConfig.IOpenResourceItem
      | XiooConfig.IOpenResourceItem[];
    /** 其他的配置 */
    [key: string]: any;
  }

  export class ControllerManager extends Controller {
    /** controller组 */
    group: { [key: string]: any };
    /** 注册路由类 */
    registerController: (name: string, CntrollerInstance: any) => void;
  }

  export const Route;

  export const Post;

  export const Get;

  export const Delete;

  export const Patch;

  export const Helper;

  export const Time;

  export class Middleware {
    app: App;
    ctx: CostomCtx;
    next: any;
  }

  export const MiddleClass;
  export const Middle;

  export class Service {
    app: App;
    ctx: CostomCtx;
  }

  export const Socket;

  export default App;
}
