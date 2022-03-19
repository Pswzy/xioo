/**
 * 构造服务连接
 * @version: 
 * @Author: dee
 * @Date: 2021-01-17 15:32:39
 * @LastEditors: dee
 * @LastEditTime: 2021-01-19 21:19:47
 */
import * as path from 'path';
import App from  '../App';
// import Redis from './Redis';
// import Mysql from './MySQL';
// import PostgreSQL from './PostgreSQL';
// import ElasticSearch from './ElasticSearch';
// import KafkaProducer from './Kafka/KafkaProducer';
// import KafkaConsumer from './Kafka/KafkaConsumer';
import Service from './index';

const ModelLsit = {
  redis: {
    group: 'redisGroup',
    // TypeModel: Redis,
  },
  mysql: {
    group: 'mysqlGroup',
    // TypeModel: Mysql,
  },
  pg: {
    group: 'pgGroup',
    // TypeModel: PostgreSQL,
  },
  es: {
    group: 'esGroup',
    // TypeModel: ElasticSearch,
  },
  kafkaProducer: {
    group: 'kafkaProducerGroup',
    // TypeModel: KafkaProducer
  },
  kafkaConsumer: {
    group: 'kafkaConsumerGroup',
    // TypeModel: KafkaConsumer
  }
}

interface ISource<T> {
  [key: string]: T
}

type IModelname = 'redis' | 'mysql' | 'pg' | 'es' | 'kafkaProducer' | 'kafkaConsumer';

class ServiceConstructor extends Service {
  /** redis连接组 */
  redisGroup: ISource<any> = {};
  /** mysql连接组 */
  mysqlGroup: ISource<any> = {};
  /** pg连接组 */
  pgGroup: ISource<any> = {};
  /** es连接组 */
  esGroup: ISource<any> = {};
  /** kafka生产者组 */
  kafkaProducerGroup: ISource<any> = {};
  /** kafka消费者组 */
  kafkaConsumerGroup: ISource<any> = {};

  /** 第一个redis */
  redis: any;
  /** 第一个mysql */
  mysql: any;
  /** 第一个pg */
  pg: any;
  /** 第一个es */
  es: any;
  /** 第一个kafka生产者连接 */
  kafkaProducer: any;
  /** 第一个kafka消费者连接 */
  kafkaConsumer: any;
  /** kafka */
  kafka: { producer: any, consumer: any } = {
    producer: null,
    consumer: null
  }

  constructor(app: App) {
    super(app);

    // /** 创建mysql连接 */
    // this.createConnectGroup<Mysql>('mysql');
    // /** 创建redis连接 */
    // this.createConnectGroup<Redis>('redis');
    // /** 创建pg连接 */
    // this.createConnectGroup<PostgreSQL>('pg');
    // /** 创建es连接 */
    // this.createConnectGroup<PostgreSQL>('es');
    // /** 创建kafka生产者连接 */
    // this.createConnectGroup<KafkaProducer>('kafkaProducer');
    // /** 创建kafka消费者连接 */
    // this.createConnectGroup<KafkaConsumer>('kafkaConsumer');
    // this.makeKafka();
    /** 读取service信息 */
    this.readService();
  }

  // 初始化服务连接
  initServicePlugins() {
    /** 创建mysql连接 */
    this.createConnectGroup<any>('mysql');
    /** 创建redis连接 */
    this.createConnectGroup<any>('redis');
    /** 创建pg连接 */
    this.createConnectGroup<any>('pg');
    /** 创建es连接 */
    this.createConnectGroup<any>('es');
    /** 创建kafka生产者连接 */
    this.createConnectGroup<any>('kafkaProducer');
    /** 创建kafka消费者连接 */
    this.createConnectGroup<any>('kafkaConsumer');
    this.makeKafka();
  }

  /** 创建连接分组 */
  private createConnectGroup<T>(modelName: IModelname) {
    let index = 0;
    console.red(this.app.servicePlugins);
    if(!this.app.servicePlugins[modelName]) return;
    Object.keys(this.app.config[modelName]).forEach(key => {
      const item = this.app.config[modelName][key];
      const { launch, ...config } = item;
      if(launch) {
        // const SourceConnect = new ModelLsit[modelName].TypeModel(config as any);
        const SourceConnect = new this.app.servicePlugins[modelName](config);
        this[ModelLsit[modelName].group][key] = SourceConnect;
        if(index === 0) {
          this[modelName] = SourceConnect as any;
          index++;
        }
      }
    })
    // this[ModelLsit[modelName].group] = (this.app.config[modelName] as any[]).map(item => {
    //   return new ModelLsit[modelName].TypeModel(item);
    // });
    // const ModelTypeGroup:T[] = this[ModelLsit[modelName].group];
    // if(ModelTypeGroup.length > 0) {
    //   this[modelName] = ModelTypeGroup[0] as any;
    // }
  }
  /** 包装kafka */
  makeKafka() {
    if(this.kafkaProducer) {
      this.kafka.producer = this.kafkaProducer.producer;
    }
    if(this.kafkaConsumer) {
      this.kafka.consumer = this.kafkaConsumer.consumer;
    }
  }

  /** 创建连接 */
  createConnection(modelName: IModelname, name: string, config) {
    const ServicePlugin = this.app.servicePlugins[modelName];
    if(!this.app.servicePlugins[modelName]) return;
    
    const Mode = ModelLsit[modelName];
    const SourceConnect = new ServicePlugin[modelName](config as any);
    if(!this[Mode.group][name])  {
      this[Mode.group][name] = SourceConnect;
    } else {
      throw new Error(`${name} 连接已存在`);
    }
  }

  /** 创建service */
  readService() {
    let res = this.app.helper.getDirToFileSource(path.join(this.app.readRoot, './server/service'));
    const modules = this.app.helper.dirTreeSource(path.join(this.app.readRoot, './pages'), [], [], ['service'], false);
    res = {
      ...res,
      ...modules
    }
    /** 动态给对象添加值 */ 
    Object.keys(res).forEach(key => {
      const ServiceClass = res[key];
      const instanceService = new ServiceClass(this.app);
      const serviceName = instanceService.constructor.name;
      this[serviceName] = instanceService;
    });
  }
}

export = ServiceConstructor;