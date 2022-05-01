// import Helper from './helper';
import { Helper } from 'xioo';
type ItemData = string | number;
type InsertData = { [key: string]: ItemData } | ItemData[];
type CommonObj = { [key: string]: any };

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
  conn?: 'or' | 'and'
}

type QueryItem = {
  conn?: 'and' | 'or';
  conditions?: IConditions[];
  query?: QueryItem[];
  qConn?: 'and' | 'or';
}

type IQuerys = QueryItem[];

const optionMap = {
  /** 等于 */
  eq: '=',
  /** 不等于 */
  ne: '<>',
  /** 大于 */
  gt: '>',
  /** 小于 */
  lt: '<',
  /** 大于等于 */
  ge: '>=',
  /** 小于等于 */
  le: '<=',
  /** 排除多值 */
  ni: 'not in',
  /** 空值查询 */
  nu: () => {
    return 'is null';
  },
  /** 非空值查询 */
  nn: () => {
    return 'is not null';
  },
  /** 最左匹配 */
  ll: (value) => {
    return `like '%${value}'`;
  },
  /** 最右匹配 */
  rl: (value) => {
    return `like '${value}%'`;
  },
  /** 模糊匹配 */
  al: (value) => {
    return `like '%${value}%'`;
  },
  /** 最左不匹配 */
  nl: (value) => {
    return `not like '%${value}'`;
  },
  /** 最右不匹配 */
  nr: (value) => {
    return `not like '${value}%'`;
  },
  /** 不包含 */
  na: (value) => {
    return `not like '%${value}%'`;
  },
}
class Query {
  // query: any;
  type = 'mysql';
  underline = false;
  constructor(props) {
    this.type = props.type;
    this.underline = props.underline;
  }
  /** 单表插入 */
  async insertDb(table: string, data: { [key: string]: string }, query, connection?: any) {
    if(this.underline) {
      data = Helper.toUline(data);
    }
    const columns = await this.queryColumnInfo(table, query);
    const fields = this.jointDataField(columns, data);
    const values = this.jointDataSql(data, columns);
    const sql = `insert into ${table}${fields} values ${values};`
    console.log(sql)
    const rows = await query(sql, connection);
    return rows;
  }

  /** 删除 */
  async deleteDb(table: string, data: InsertData, options: CommonObj = {}, query, connection?: any) {
    let filter = '';
    let { key = 'id' } = options;
    if(this.underline) {
      data = Helper.toUline(data);
      key = Helper.toUline(key);
    }
    
    if (Array.isArray(data)) {
      const item = data[0];
      filter = `${key} in `;
      let mind = '';
      if (typeof item === 'object') {
        data.forEach((item, index) => {
          const value = item[key];
          if (index === 0) {
            mind += `'${value}'`
          } else {
            mind += `,'${value}'`
          }
        })
      } else {
        data.forEach((item, index) => {
          const value = item;
          if (index === 0) {
            mind += `'${value}'`
          } else {
            mind += `,'${value}'`
          }
        })
      }

      mind = `(${mind})`;
      filter += mind;
    } else {
      Object.keys(data).forEach((key, index) => {
        if (index === 0) {
          filter += `${key} = '${data[key]}'`
        } else {
          filter += ` & ${key} = '${data[key]}'`
        }
      })
    }
    const sql = `delete from ${table} where ${filter}`;
    console.log(sql)
    const res = await query(sql, connection);
    return res;
  }

  /** 更新 */
  async updateDb(table: string, data: InsertData, options: CommonObj = {}, query, connection?: any) {
    let { key: mainkey = 'id' } = options;
    if(this.underline) {
      data = Helper.toUline(data);
      mainkey = Helper.toUline(mainkey);
    }
    const columns = await this.queryColumnInfo(table, query);
    // 处理id
    let ids = '';
    const idsArr = [];
    const arr = [];
    let sql = '';
    let finalData: any[] = [];
    if (Array.isArray(data)) {
      finalData = this.getExistData(data, columns);
    } else {
      finalData = this.getExistData([data], columns);
    }
    finalData.forEach((item, i) => {
      if (i === 0) {
        ids = `'${item[mainkey]}'`
      } else {
        ids += ',' + `'${item[mainkey]}'`
      }
      idsArr.push(item[mainkey])
    })

    Object.keys(finalData[0]).forEach((key) => {
      if (key === mainkey) return false
      const middleArr = []
      middleArr.push(key)
      finalData.forEach(item => {
        middleArr.push(item[key])
      })
      arr.push(middleArr)
    })

    // 处理sql
    arr.forEach((item, i) => {
      if (i === 0) {
        sql += `update ${table}
                  set ${item[0]} = case ${mainkey}`
        item.forEach((word, index) => {
          const finalWord = word === null || typeof word === 'boolean' || typeof word === 'number' ? word : `'${word}'`
          if (index === 0) return false
          sql += ` when '${idsArr[index - 1]}' then ${finalWord}`
        })
        sql += ` end`;
      } else {
        sql += `,${item[0]} = case ${mainkey}`;
        item.forEach((word, index) => {
          const finalWord = word === null || typeof word === 'boolean' || typeof word === 'number' ? word : `'${word}'`
          if (index === 0) return false
          sql += ` when '${idsArr[index - 1]}' then ${finalWord}`
        })
        sql += ` end`
      }
    })
    sql += ` where ${mainkey} in(${ids})`;
    console.log(sql)
    const res = await query(sql, connection);
    return res;
  }

  /** 拼接查询条件语句 */
  selectWhere(querys: IQuerys) {
    let whereSql = '';
    const recursion = (querys: IQuerys, conn?: 'and' | 'or') => {
      let querySql = '';
      querys.forEach((queryItem, index) => {
        const { conditions = [], conn = 'and', query, qConn = 'and' } = queryItem;
        let conSql = '';
        conditions.forEach((item, i) => {
          const { option = '=', type = 'string', field, value, conn = 'and' } = item;
          const finalValue = this.resultByOption({ option, type, field, value });
          conSql += this.connByIndex(conn, finalValue, i);
        })
        if (query && Array.isArray(query)) {

          if (qConn) {
            conSql += ` ${qConn} ${recursion(query)}`;
          } else {
            conSql += recursion(query);
          }
        }
        if (conSql) {
          querySql += this.connByIndex(conn, conSql, index);
        }
      })
      return querySql;
      // whereSql += `(${querySql})`;
      if (querySql) {
        if (conn) {
          whereSql += `(${querySql}) ${conn} `;
          // whereSql = `(${whereSql}) ${conn} ${querySql}`
        } else {

          whereSql += `(${querySql})`;
          // whereSql = `(${querySql})`
        }
      }
    }
    whereSql = recursion(querys);
    return whereSql;
  }

  /** 判断是否加conn */
  connByIndex(conn, value, index) {
    if (index === 0) {
      return `(${value})`;
    } else {
      return ` ${conn} (${value})`;
    }
  }

  /** 根据 type 和 option 给出最后的接口 */
  resultByOption({ option, type, value, field }) {
    if (option === 'in' || option === 'ni') {
      if (Array.isArray(value)) {
        let result = '';
        value.forEach(v => {
          result += this.quotationByType(type, v);
        })
        return `${field} ${option} (${result})`;
      } else {
        return `${field} ${option} (${this.quotationByType(type, value)})`;
      }
    } else {
      return `${field} ${this.getOptionValue(option, type, value)}`;
    }
  }

  /** 获取连接符以及值 */
  getOptionValue(option, type, value) {
    const finnalOption = optionMap[option];
    if (typeof finnalOption === 'string') {
      return `${finnalOption} ${this.quotationByType(type, value)}`
    } else {
      return `${finnalOption(value)}`;
    }
  }

  /** 根据type判断 值是否加 ' */
  quotationByType(type, value) {
    if (type === 'string' || type === 'datetime') {
      return `'${value}'`;
    } else {
      return value;
    }
  }

  /** 将数据过滤成有列的数据 */
  getExistData(data: any[], columns: CommonObj) {
    return data.map(item => {
      const obj: CommonObj = {};
      Object.keys(item).forEach(key => {
        if (columns[key]) {
          obj[key] = item[key]
        }
      })
      return obj;
    })
  }

  /** 查询列信息 */
  async queryColumnInfo(table: string, query): Promise<{ [key: string]: string }> {
    // 先将列信息查出
    let columnInfoSql = '';
    if (this.type === 'mysql') {
      columnInfoSql = `select column_name, column_comment from information_schema.COLUMNS where TABLE_NAME = '${table}';`;
    } else {

      const schemas = table.split('.');
      let tablename = '';
      let schema = '';
      let whereSchemaSql = '';
      if(schemas.length === 1) {
        tablename = schemas[0]
      } else if (schemas.length === 2) {
        schema = schemas[0];
        tablename = schemas[1];
      } else {
        tablename = table;
      }

      if(schemas.length === 2) {
        whereSchemaSql = ` schemaname = '${schema}' and `
      }

      columnInfoSql = `
        select
          a.attname column_name,
          d.description column_comment,
          concat_ws (
            '',
            t.typname,
            SUBSTRING (
              format_type (a.atttypid, a.atttypmod)
              from
                '\(.*\)'
            )
          ) as column_type
        from
          pg_class c,
          pg_attribute a,
          pg_type t,
          pg_description d
        where
          a.attnum > 0
          and a.attrelid = c.oid
          and a.atttypid = t.oid
          and d.objoid = a.attrelid
          and d.objsubid = a.attnum
          and c.relname in (
          select
            tablename
          from
            pg_tables
          where
            ${whereSchemaSql}
            position ('_2' in tablename) = 0
        ) and c.relname = '${tablename}'
        order by
          c.relname,
          a.attnum;
      `
    }
    let columnInfo: any[] = await query(columnInfoSql);
    if(this.underline) {
      columnInfo = Helper.toUline(columnInfo);
    }
    // console.log(columnInfo);
    // 将列信息整理成对象
    const columns: { [key: string]: string } = {};
    columnInfo.forEach(item => {
      const key = item.column_name || item.columnName;
      const value = item.column_comment || item.columnComment;
      columns[key] = value;
    });

    console.log(columns);

    return columns;
  }

  /** 拼接字段 */
  private jointDataField(columns, data) {
    let fields = '';
    let item = data;
    let index = 0;
    if (Array.isArray(data)) {
      item = data[0];
    }

    Object.keys(item).forEach(key => {
      if (columns[key]) {
        if (index === 0) {
          if (this.type === 'pg') {
            fields += `"${key}"`;
          } else {
            fields += `${key}`;
          }
          index++;
        } else {
          if (this.type === 'pg') {
            fields += `,"${key}"`;
          } else {
            fields += `,${key}`;
          }
        }
      }
    })
    return `(${fields})`;
  }

  /** 数据插入 */
  private jointDataSql(data: any, columns) {
    let values = '';
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (index === 0) {
          values += this.jointDataItemSql(item, columns);
        } else {
          values += `,${this.jointDataItemSql(item, columns)}`;
        }
      })
    } else {
      values = this.jointDataItemSql(data, columns);
    }

    return values;
  }

  /** 对象插入 */
  private jointDataItemSql(item, columns) {
    let values = '';
    let index = 0;
    const keys = Object.keys(item);
    keys.forEach(key => {
      if (!columns[key]) return;
      const finalKey = Helper.toUline(key);
      let value = item[key] || item[finalKey];
      if (typeof value === 'string') {
        value = `'${value.replace(/\'/g, '\'\'')}'`;
      } else if (value === null) {
        value = value;
      } else if (typeof value === 'object') {
        value = `'${JSON.stringify(value).replace(/\'/g, '\'\'')}'`;
      } else {
        value = value;
      }

      if (index === 0) {
        index++;
        values += `${value}`;
      } else {
        values += `,${value}`
      }
    })
    values = `(${values})`;
    return values;
  }
}

export = Query;
