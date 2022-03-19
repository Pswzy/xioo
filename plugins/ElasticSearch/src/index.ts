import { Client } from '@elastic/elasticsearch';

export default class ElasticSearch {
  constructor(config) {
    this.createConnection(config);
  }

  dbnet: Client

  /** 创建连接 */
  createConnection(config) {
    const node = `${config.host}:${config.port}`;
    const auth = config.auth || {};
    this.dbnet = new Client({ node, auth });
    console.log(`es: ${node} 已经连接`);
  }

  /** 插入数据 */
  async insert(index, data, patch = false) {
    if(patch) {
      for (let i = 0; index < data.length; i++) {
        await this.dbnet.index({
          index,
          body: data[i]
        })
      }
    } else {
      await this.dbnet.index({
        index,
        body: data
      })
    }
    // 强制刷新索引
    this.dbnet.indices.refresh({ index });
  }

  /** 查询 */
  async search(index, data?: any) {
    return this.dbnet.search({
      index,
      body: data
    })
  }
}