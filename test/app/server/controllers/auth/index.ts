import { Post, Route, Controller, Get } from 'xioo'; 
import * as path from 'path';
import { Time } from 'xioo';

new RegExp(/[a-z]+\.less/)

@Route('/promise/auth')
export default class Auth extends Controller {
  @Post('/login')
  async login() {
    const { app, ctx, next } = this;
    let res = app.helper.dirTreePath(path.join(app.projectRoot, './app/pages'), [], [new RegExp(/[a-z]+\.less/)]);
    // this.app.service.User.login()
    // this.app.service.User.login();
    // this.app.service
    // console.red('我执行了')

    // console.log('我是之前的');
    // console.log(ctx.state['a'])

    // await next();
    
    let data = await this.app.xios.base.get('/promise/auth/test');
    const query = ctx.querystring;
    const query2 = ctx.query;
    console.log(data);
    // console.log('我是之后的');

    // console.log(ctx.state['a'])
    return {
      data: res,
      status: '0'
    }
    // ctx.body = {
    //   data: res,
    //   status: '0'
    // }
  }

  @Get('/test')
  async test() {
    const { app: { service: { redis }}, next } = this;
    await redis.setString('testKey', 'testKeyvalue');
    await redis.rpushKey('listKey', 'listValue1');
    const testKey = await redis.getString('testKey');
    const listKey = await redis.rpopKey('listKey');
    
    // redis.setString('testKey', 'testData');
    this.app.agant.dispatchSchedule('getData', true);
    // let res = app.helper.dirTreePath(path.join(app.projectRoot, './app/pages'), [], [new RegExp(/[a-z]+\.less/)]);
    return {
      data: {
        testKey,
        listKey
      }
    }
  }

  @Time((time, that) => { console.log(time);console.log(that.app) })
  @Get('/pg')
  async testPg() {
    const { app: { pg } } = this;
    // console.log(app);

    // let res = await pg.query<any[]>('select * from mpuser');
    // const res = 'aaaa';
    let i = 0;
    for (let index = 0; index < 10000; index++) {
      i++;
    }

    return i;
  }

  @Get('/testSql')
  async testSql() {
    const { app: { service }, ctx } = this;
    const moduleId = '234567sfdsdfsdf';
    const createUserId = '6ee40997-188f-3238-a2c4-996bd95ec847';
    const moduleName = 'test1';
    const createTime = '2021-09-07 20:59:35';
    const data = [
      {
        moduleId: 'y8iiuikjaksjd',
        createUserId,
        moduleName,
        createTime,
        moduleDesc: null
      }
    ]
    let res = await service.mysql.insert('module_view', data);
    ctx.body = {
      data: res,
      message: '成功',
      status: '0'
    }
  }

  @Get('/delete')
  async testDelete() {
    const { app: { service }, ctx } = this;
    const moduleId = '234567sfdsdfsdf';
    const createUserId = '6ee40997-188f-3238-a2c4-996bd95ec847';
    const moduleName = 'test1';
    const createTime = '2021-09-07 20:59:35';
    const data = {
      moduleId: '89e2f550-0fe6-11ec-addd-a1b070c53cd4',
      moduleName,
      createUserId,
      createTime
    }
    // const data = ['89e2f550-0fe6-11ec-addd-a1b070c53cd4'];
    let res = await service.mysql.insert('module_view', data);
    // let res = await service.mysql.delete('module_view', data, {
    //   key: 'moduleId'
    // });
    ctx.body = {
      data: res,
      message: '成功',
      status: '0'
    }
  }

  @Get('/testpgdata')
  async testPgs() {
    const { app: { service }, ctx } = this;

    let res = await service.pg.insert('eus_app', {
      appId: '89e2f550-0fe6-11ec-addd-a1b070c53cd5',
      appSecret: '89e2f550-0fe6-11ec-addd-a1b070c53cd5',
      appName: 'test1',
      createUserId: '89e2f550-0fe6-11ec-addd-a1b070c53cd4',
      createTime: '2021-09-07 20:59:35'
    })

    ctx.body = {
      message: '成功',
      data: res
    }
  }

  @Get('/testmysqldata')
  async getMysqlData() {
    const { ctx, app: { service: { mysql, mysqlGroup, createConnection } } } = this;

    // let res = await mysqlGroup.dataView.dbquery(`select * from program_view.program_api;`)
    

    // let res = await mysql.dbquery(`select * from program_view.program_api;`)

    let res = await mysql.transaction(async (conn) => {
      await conn.insert('program_dict', {
        dictId: 'abd9ae4b-6868-332a-a0ec-fe5e85fd1d6a',
        dictNo: 'test',
        dictName: '测试字典1',
      });
      await conn.insert('program_dict', {
        dictId: 'abd9ae4b-6868-332a-a0ec-fe5e85fd1d6a',
        dictNo: 'test2',
        dictName: '测试字典2',
      })
      return '1';
    })

    // console.log(res);

    return {
      status: '0',
      message: '成功',
      data: []
    }
  }

  @Get('/estest')
  async getEsTest() {
    const { app: { service: { es } } } = this;
    let res = await es.search('eus-test-log-error-2021.10.28');
    // console.log(res.body.hits);
    return {
      status: '0',
      data: res.body.hits
    }
    // es.insert('eus-test-log-error-2021.10.28', {
    //   type: 'error',
    //   timestamp: 1637635846454,
    //   datetime: '2021-11-23T02:50:46.454Z', 
    //   username: '赵秀全',
    //   account: 'zhaoxiuquan',
    //   os: 'Mac OS 10.15.7',
    //   browser: 'Chrome 95.0.4638.69',
    //   brand: '',
    //   host: 'localhost:7000',
    //   url: 'http://localhost:7000/#name',
    //   path: '/',
    //   traceId: 'c3f5c0e0-4b5c-11ec-9bb7-2521a1ad7363',
    //   pageName: 'unknown',
    //   appId: '1ghjkl',
    //   pageImageId: '',
    //   stackOrigin: '234',
    //   developer: 'zhaodeezhu',
    //   developerEmail: 'zhaodeezhu@126.com',
    //   filePath: 'app/pages/Home/views/home.tsx',
    //   code: "    throw new Error('同步错误'); /n  } /n /n  timeError = () => { /n    setTimeout(() => { /n      throw new Error('time错误'); /n    }, 20) /n",
    //   codeLocation: '34,14',
    //   stack: `[{"filename":"app/pages/Home/views/home.tsx","lineNo":34,"colNo":14,"code":"    throw new Error('同步错误'); /n  } /n /n  timeError = () => { /n    setTimeout(() => { /n      throw new Error('time错误'); /n    }, 20) /n","developerEmail":"zhaodeezhu@126.com","developer":"zhaodeezhu","commitMessage":"feat: 🚀 项目初始化\\n","commitTime":"2021-11-12T17:41:42.000+08:00","commitId":"b56b065857bbff645c9b176fe243a2149e35e839"},{"filename":"webpack://qiankun-[name]/node_modules/react-dom/cjs/react-dom.production.min.js","lineNo":52,"colNo":316},{"filename":"webpack://qiankun-[name]/node_modules/react-dom/cjs/react-dom.production.min.js","lineNo":52,"colNo":470},{"filename":"webpack://qiankun-[name]/node_modules/react-dom/cjs/react-dom.production.min.js","lineNo":53,"colNo":34},{"filename":"webpack://qiankun-[name]/node_modules/react-dom/cjs/react-dom.production.min.js","lineNo":100,"colNo":70},{"filename":"webpack://qiankun-[name]/node_modules/react-dom/cjs/react-dom.production.min.js","lineNo":101,"colNo":379},{"filename":"webpack://qiankun-[name]/node_modules/react-dom/cjs/react-dom.production.min.js","lineNo":113,"colNo":64},{"filename":"webpack://qiankun-[name]/node_modules/react-dom/cjs/react-dom.production.min.js","lineNo":292,"colNo":188},{"filename":"webpack://qiankun-[name]/node_modules/react-dom/cjs/react-dom.production.min.js","lineNo":50,"colNo":56},{"filename":"webpack://qiankun-[name]/node_modules/react-dom/cjs/react-dom.production.min.js","lineNo":105,"colNo":468}]`,
    //   extension: '12345'
    // })

    return {
      status: '0'
    }
  }

  @Get('/pgselect')
  async getPgData() {
    const { app: { service: { pg } } } = this;
    let res = await pg.query('select * from eus_app');
    return {
      status: '0',
      message: '成功',
      data: res
    }
  }
  @Get('/pginsert')
  async getPgInert() {
    const { app: { service: { pg } } } = this;
    let res = await pg.insert('xioo.program_dict', {
      dictId: `${Math.random()}`,
      dictNo: `${Math.random()}`,
      dictName: 'wip-frontend'
    });
    return {
      status: '0',
      message: '成功',
      data: res
    }
  }

  /** 删除pg测试 */
  @Get('/pgdelete')
  async getPgDelete() {
    const { app: { service: { pg } } } = this;
    let res = await pg.delete('eus_app', {
      appId: 'rtyuio',
    }, {
      key: 'appId'
    });
    return {
      status: '0',
      message: '成功',
      data: res
    }
  }

  /** 更新pg测试 */
  @Get('/pgupdate')
  async updatePg() {
    const { app: { service: { pg } } } = this;
    let res = await pg.update('eus_app', {
      appId: 'rtyuio',
      appDesc: 'zhaodeezhu'
    }, {
      key: 'appId'
    });
    return {
      status: '0',
      message: '成功',
      data: res
    }
  }

  @Get('/pgupdateog')
  async insertIntoPg() {
    const { app: { service: { pg } } } = this;
    // let res = await pg.update('eus_app', {
    //   appId: 'rtyuio',
    //   appDesc: 'zhaodeezhu'
    // }, {
    //   key: 'appId'
    // });

    const res = await pg.insert(`eus_app`, {
      appId: `abc`,
      appSecret: `''e''`,
      appName: '测试',
      appDesc: '测试2',
      gitlabProjectId: '123',
      gitlabAccessToken: '123',
      createTime: '2021-12-11',
      createUserId: '23456',
      appHost: '.gz.cvte.cn'
    })
    return {
      status: '0',
      message: '成功',
      data: res
    }
  }

  /** pg事务测试 */
  @Get('/pgtransaction')
  async pgTransaction() {
    const { app: { service: { pg } } } = this;
    const res = await pg.transaction(async (conn) => {
      await conn.insert('xioo.program_dict', {
        dictId: '1234567',
        dictNo: '9090',
        dictName: '哈哈哈'
      })
      await conn.insert('xioo.dict_value', {
        dictValueId: '1234567',
        dictValueNo: '9090',
        dictValueText: '哈哈哈',
        dictDefault: 1,
        dictNo: '9090'
      })
      return '1';
    })
    return {
      status: '0',
      data: res
    }
  }

  @Get('/getform')
  async getForm() {
    const { ctx, app: { xios } } = this;
    const res =await xios.form.requset({
      url: '/api/shop/getProduct',
      method: 'post',
      form: {
        a: 1,
        b: 2
      },
      isStatus: true,
      headers: {     
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' 
      }
    })
    console.log(res);
    return {
      status: '0',
      data: res
    }
  }

  @Get('/testredis')
  async testredis() {
    const { ctx, app: { service: { redis } } } = this;
    // redis.setString('zhaodeezhu', '123456');
    const res = await redis.getString('zhaodeezhu');
    console.log(res)
    return {
      status: '0',
      message: '12345'
    }
  }
}

// export = Auth;