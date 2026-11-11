import { createConsumer, createKafkaClient, createProducer } from "@shopflow/kafka";

const kafkaClient = createKafkaClient("product-service");

export const producer = createProducer(kafkaClient);
export const consumer = createConsumer(kafkaClient, "product-group");
