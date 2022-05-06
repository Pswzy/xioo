import cluster from 'cluster';
(async () => {
  if (cluster.isMaster) {
    console.log('我是主进程-------->')
    process.env['test_prod'] = 'zhaodeezhu';
  }
  console.log(process.env['test_prod']);
  require('xioo/build/Agant/start');
})()

