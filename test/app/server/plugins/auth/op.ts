import { Plugin } from 'xioo';

export default class Time extends Plugin {
  async excute() {
    const app = this.app;
    // app.router.setRoute({method: 'get', url: '/api/auth/op', controller: (ctx, next) => {
    //   ctx.state.data = {
    //     status: 200,
    //     data: '我是auth',
    //     message: '成功了'
    //   }
    // }})
    const { service } = app;
    // let res = await service.mysql.query('select * from program_api')
    // console.log(res);
    // plugin.tap.mysql.use(() => {
    //   console.log('我是mysql后执行的插件-----')
    // })
    // let res = await service.mysql.query('select * from program_view.data_view_source');
    // console.log('我是值========》');
    // console.log(res);
    // service.createConnection('pg', 'pgtest_eus', {
    //   port: 5432,
    //   host: 'pgtest002.gz.cvte.cn',
    //   password: 'eus#pwd',
    //   user: 'eus',
    //   database: 'pgtest_eus',
    //   launch: true
    // })
  }
}