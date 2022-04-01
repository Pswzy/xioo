/*
 * @version: 
 * @Author: dee
 * @Date: 2021-01-20 17:17:34
 * @LastEditors: dee
 * @LastEditTime: 2021-02-06 16:53:58
 */
import * as path from 'path';
import App from 'xioo';
import redis from '@xioo/redis';
import pg from '@xioo/postgress';
import xios from '@xioo/xios';

// import User from './controllers/auth'

// new User()

console.log('我执行了')

const app = new App({ servicePlugins: { redis, pg }, appPlugins: { xios } });

app.start();

// let res = app.helper['dirTreePath'](path.join(app.projectRoot, './app/server'), ['controllers']);

// console.red(res);


// app.start(2002);