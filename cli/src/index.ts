#!/usr/bin/env node

import program from 'commander';
import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';
// import pa from './package.json'
// 执行命令的根目录
const rootDir = process.cwd();

program.version('1.0.1', '-v, --version');

class Release {

  /** 
   * 获取某个目录下的所有文件路径，只要遇到exclude中的目录名，将会过滤到此目录所有一下的
   * @param { string } rootDir 要遍历的目录
   * @param { string[] } exclude 要排除的目录名
   * @param { string[] } includeFiles 指定的文件名，可以使用正则
   * @return { Object } 映射目录
   */
  dirTreePath(rootDir: string, exclude: string[] = [], includeFiles = [], include = [], isFirst = true) {
    // 定义所有的目录映射
    const pathMap: { [key: string]: string } = {};
    // 判断目录是否存在，不存在直接返回空对象{}
    const isExists = fs.existsSync(rootDir);
    if (!isExists) return {};

    function getData(nd: string, frontFileName: string, isFile = true) {
      fs.readdirSync(nd).forEach(p => {
        // 如果当当前遍历到目录名，剧排除掉
        if (exclude.includes(p)) return;
        if (fs.statSync(path.join(nd, p)).isDirectory()) {
          let myFile = true;
          // 适配只遍历响应的目录下的文件
          if (include.length > 0) {
            if (include.includes(p)) {
              myFile = true;
            } else {
              myFile = false;
            }
          }
          getData(path.join(nd, p), path.join(nd, p), myFile);
        } else {
          if (includeFiles.length > 0) {
            const fileName = includeFiles.find(filePath => {
              // 如果是正则校验p文件是否是满足
              if (filePath instanceof RegExp) {
                return filePath.test(p);
              } else {
                // 不是正则就要判断相等
                return filePath === p;
              }
            });
            // 不正确就直接返回了
            if (!fileName) return;
          }
          if (include.length > 0) {
            // 如果是不想遍历的目录则直接返回
            if (!isFile) {
              return;
            }
          }
          const f = p.split('.');
          const key = path.join(frontFileName, f[0]);
          pathMap[key] = path.join(nd, p);
        }
      })
    }

    getData(rootDir, '', isFirst);

    return pathMap;
  }

  /** 构建 */
  build() {
    const dirs = fs.readdirSync(path.join(rootDir, './plugins'));
    dirs.forEach((key) => {
      childProcess.exec(`tsc -b ./plugins/${key}`, {
        cwd: rootDir
      }, (error) => {
        if (error) {
          console.log(error);
          return;
        }
        console.log(`success: ${key}`)
      })
    })
  }

  /** 发布 */
  publish(all) {
    const dirs = fs.readdirSync(path.join(rootDir, './plugins'));
    dirs.forEach(key => {
      childProcess.exec('npm publish', {
        cwd: path.join(rootDir, `./plugins/${key}`)
      }, (error) => {
        if (error) {
          console.log(error);
          return;
        }
        console.log(`success: published ${key}`);
      })
    })
    if(all) {
      childProcess.exec('npm publish', {
        cwd: rootDir
      }, (error) => {
        if (error) {
          console.log(error);
          return;
        }
        console.log(`success: published xioo`);
      })
    }
  }

  /** 升级版本 */
  updateVersion(recordVersion?: string) {
    const values = this.dirTreePath(path.join(rootDir, './plugins'), ['node_modules'], ['package.json']);
    Object.keys(values).forEach((contentPath) => {
      const finalePath = values[contentPath];
      const content = fs.readFileSync(finalePath, 'utf-8');
      const versionsArr = content.match(/\"version\"\: \"(\d+\.\d+\.\d+)"/)
      const versions = versionsArr[1];
      let finalVersion;
      if (!recordVersion) {
        const arr = versions.split('.');
        arr[2] = (Number(arr[2]) + 1).toString();
        finalVersion = arr.join('.');
      } else {
        finalVersion = recordVersion;
      }
      const finalValue = content.replace(versions, finalVersion);
      fs.writeFileSync(finalePath, finalValue);

      // 解析名称
      const names = content.match(/\"name\"\: \"(\@xioo\/[a-zA-z]+)\"/);
      console.log(`${names[1]} update v${finalVersion}`)
    })
  }

  /** 映射软连接 */
  link() {
    const dirs = fs.readdirSync(path.join(rootDir, './plugins'));
    childProcess.exec('npm link', {
      cwd: rootDir
    }, (error) => {
      if (error) {
        console.log(error);
        return;
      }
      console.log(`success: link xioo`);
    })
    dirs.forEach(key => {
      childProcess.exec('npm link', {
        cwd: path.join(rootDir, `./plugins/${key}`)
      }, (error) => {
        if (error) {
          console.log(error);
          return;
        }
        console.log(`success: link ${key}`);
      })
    })
  }
}

program
  .command('release [version]')
  .description('升级插件版本')
  .action((version) => {
    const rel = new Release();
    rel.updateVersion(version);
  })

program
  .command('build')
  .description('批量构建插件')
  .action(() => {
    new Release().build();
  })

program
  .command('publish [all]')
  .description('发布插件')
  .action((all) => {
    const rel = new Release();
    rel.publish(all);
  })

program
  .command('link')
  .description('映射到全局')
  .action(() => {
    const rel = new Release();
    rel.link();
  })

program.parse(process.argv);