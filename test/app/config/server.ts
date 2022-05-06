/**
 * xioo服务配置
 * @version: 0.0.1
 * @Author: dee
 * @Date: 2021-01-19 19:40:17
 * @LastEditors: dee
 * @LastEditTime: 2021-01-19 19:51:46
 */
import { XiooConfig } from 'xioo';

interface ISource<T> {
  [key: string]: T
}

export default class Config {
  redis: ISource<XiooConfig.IRedis> = {
    one: {
      port: 6379,
      host: '127.0.0.1',
      db: 8,
      password: '',
      launch: false
    }
  }
  mysql: ISource<XiooConfig.IMySQL> = {
    dataView: {
      port: 3306,
      host: '127.0.0.1',
      user: 'root',
      password: '123456',
      database: 'program_view',
      launch: true
    }
  }
  httpServer: XiooConfig.IHtppServer = {
    port: 2001
  };
  /** socket配置 */
  socket: XiooConfig.ISocket =  {
    redis: {
      port: 6379,
      host: '127.0.0.1',
      password: '123456',
      db: 2
    },
    launch: false
  };
  /** 请求实例列表 */
  xios: XiooConfig.IXios  = {
    wx: {
      baseUrl: 'https://api.weixin.qq.com'
    },
    base: {
      baseUrl: 'http://127.0.0.1:2001'
    },
    form: {
      baseUrl: 'http://127.0.0.1:2002'
    }
  };

  pg: ISource<XiooConfig.IPgSQL> = {
    test: {
      port: 5432,
      host: '127.0.0.1',
      password: '123456',
      user: 'postgres',
      database: 'eus',
      launch: false,
      underline: true
    }
  };

  es = {
    test: {
      host: 'http://localhost',
      port: '9200',
      launch: true
    }
  }

  email = {
    test: {
      service: '163',
      secure: true,
      // 发送邮箱需要配置自己的
      user: 'xiooshow@163.com',
      // 此处状态码已混淆处理，需要配置自己的
      pass: '1234567',
      launch: true
    }
  }

  kafka = {
    kafkaProducer: {
      eus_test: {
        launch: false,
        kafkaHost: "localhost:9092",
        requestTimeout: 30000
      }
    }
  }

  /** 
   * 开放的静态资源目录 使用的是koa-static 根目录当前项目的运行目录
   * 数据格式可以为:
   * 字符串 只开放一个目录
   * 数组 开放多个目录
   */
  openResource = [
    {
      openPath: 'app/pages',
      options: {
        maxAge: 60 * 60 * 1000 * 2 
      }
    }
  ]

  startCpuAmount = 1
};
