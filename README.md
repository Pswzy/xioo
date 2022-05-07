# xioo 晓

![https://www.npmjs.com/package/xioo](https://img.shields.io/badge/npm-xioo-orange) ![](https://img.shields.io/badge/version-v1.1.0-blue) ![https://github.com/zhaodeezhu/xioo](https://img.shields.io/badge/github-xioo-yellowgreen) ![](https://img.shields.io/badge/95%25-typescript-green)

我给他起了一个名字，"晓"。

致力于打造成node中最便捷的服务框架。

## Plugins

| Name                | Description   | Register                                         | Version                                                      |
| ------------------- | ------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| @xioo/redis         | Redis连接插件 | redis                                            | [![redis](https://img.shields.io/badge/npm-v1.4.5-orange)](https://www.npmjs.com/package/@xioo/redis) ![https://github.com/zhaodeezhu/xioo/tree/master/plugins/Redis](https://img.shields.io/badge/github-%40xioo%2Fredis-yellowgreen) |
| @xioo/postgress     | PG连接插件    | pg                                               | [![redis](https://img.shields.io/badge/npm-v1.4.5-orange)](https://www.npmjs.com/package/@xioo/postgress) ![https://github.com/zhaodeezhu/xioo/tree/master/plugins/Postgress](https://img.shields.io/badge/github-%40xioo%2Fpostgress-yellowgreen) |
| @xioo/kafka         | Kafka连接插件 | 生产者：kafkaProducer<br />消费者：kafkaConsumer | ![https://www.npmjs.com/package/@xioo/kafka](https://img.shields.io/badge/npm-v1.4.5-orange) ![https://github.com/zhaodeezhu/xioo/tree/master/plugins/Kafka](https://img.shields.io/badge/github-%40xioo%2Fkafka-yellowgreen) |
| @xioo/mysql         | Mysql连接插件 | mysql                                            | ![https://www.npmjs.com/package/@xioo/mysql](https://img.shields.io/badge/npm-v1.4.5-orange) ![https://github.com/zhaodeezhu/xioo/tree/master/plugins/Mysql](https://img.shields.io/badge/github-%40xioo%2Fmysql-yellowgreen) |
| @xioo/elasticsearch | ES连接插件    | es                                               | ![https://www.npmjs.com/package/@xioo/elasticsearch](https://img.shields.io/badge/npm-v1.4.5-orange) ![https://github.com/zhaodeezhu/xioo/tree/master/plugins/ElasticSearch](https://img.shields.io/badge/github-%40xioo%2Felasticsearch-yellowgreen) |
| @xioo/cli           | 脚手架工具    |                                                  | ![[@xioo/cli](https://www.npmjs.com/package/@xioo/cli)](https://img.shields.io/badge/npm-v1.1.0-orange) ![https://github.com/zhaodeezhu/xioo/tree/master/cli](https://img.shields.io/badge/github-%40xioo%2Fcli-yellowgreen) |
| @xioo/email         | 发送邮件服务  | email                                            | [![redis](https://img.shields.io/badge/npm-v1.4.5-orange)](https://www.npmjs.com/package/@xioo/email) ![@xioo/email](https://img.shields.io/badge/github-%40xioo%2Femail-yellowgreen) |
| @xioo/xios          | http请求工具  | xios                                             | [![xios](https://img.shields.io/badge/npm-v1.4.5-orange)](https://www.npmjs.com/package/@xioo/xios) ![https://github.com/zhaodeezhu/xioo/tree/master/plugins/Xios](https://img.shields.io/badge/github-%40xioo%2Fxios-yellowgreen) |

## 开始

要启动一个服务很简单。

### 安装

```shell
npm i xioo
```

### 启动服务

```typescript
import Xioo from 'xioo';
const app = new Xioo();

app.start();
```

### 使用插件

使用redis为例

#### 安装插件

```shell
npm i --save @xioo/redis @xioo/xios
```

#### 注册插件

```typescript
import Xioo from 'xioo';
import redis from '@xioo/redis';
import xios from '@xioo/xios';

const app = new Xioo({servicePlugins: { redis }, appPlugins: { xios }});

app.start();
```

