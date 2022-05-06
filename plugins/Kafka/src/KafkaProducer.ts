import { KafkaClient, Producer, KafkaClientOptions } from "kafka-node";

export class KafkaProducer {
  client: KafkaClient;
  producer: Producer;

  constructor(clientConfig: KafkaClientOptions) {
    this.connect(clientConfig);
  }

  connect(clientConfig: KafkaClientOptions) {
    this.client = new KafkaClient(clientConfig);
    this.producer = new Producer(this.client);
    this.producer.on('ready', () => {
      console.log(`kafak: ${clientConfig.kafkaHost}已经连接了`);
    })
    this.producer.on("error", (e) => {
      console.log('kafka报错了----->');
      console.log(e)
    });
  }
}