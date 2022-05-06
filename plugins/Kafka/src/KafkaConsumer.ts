import { Consumer, KafkaClient, Producer, Offset, KafkaClientOptions } from "kafka-node";

export class KafkaConsumer {
  client: KafkaClient;
  consumer: Consumer;

  connect(clientConfig) {
    const { fetchRequests, options, ...config} = clientConfig;
    this.client = new KafkaClient(config);
    this.consumer = new Consumer(this.client, fetchRequests, options);
  }
}