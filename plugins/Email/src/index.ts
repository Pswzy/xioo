import nodemailer from 'nodemailer';

type IOption = {
  /** 发送方 */
  from?: string;
  /** 接收方 */
  to: string;
  /** 主题 */
  subject?: string;
  /** 邮件正文 */
  text?: string;
  /** html模板，存在html以html为准 */
  html?: string; 
}

type IConfig = {
  /** 服务, 163,qq等 */
  service: string;
  /** 是否使用安全连接，对https协议的，默认为true */
  secure: boolean;
  /** 发件人 */
  user: string;
  /** 授权码 */
  pass: string;
}

export default class Email {
  constructor(config: IConfig) {
    this.config = config;
    this.createConnection(config);
  }
  config: IConfig;
  transporter: any;

  createConnection = (config: IConfig) => {
    const { service, secure, user, pass } = config;
    this.transporter = nodemailer.createTransport({
      // host: 'smtp.163.com',,
      service, //邮箱类型 例如service:'163'
      secure, //是否使用安全连接，对https协议的
      // port: 465, //qq邮件服务所占用的端口
      auth: {
        user,//开启SMTP的邮箱，发件人
        pass// qq授权码
      }
    })
  }

  /** 发送邮件 */
  async send(options: IOption) {
    options.from = this.config.user;
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(options, (err, info) => {
        if(err) {
          reject(err);
        } else {
          resolve(info);
        }
      })
    })
  }
}
