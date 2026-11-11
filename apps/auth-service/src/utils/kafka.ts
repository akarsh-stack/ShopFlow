import { createKafkaClient, createProducer } from "@shopflow/kafka";

const kafka = createKafkaClient("email-service");
export const producer = createProducer(kafka);