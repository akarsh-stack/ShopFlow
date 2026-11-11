import { Kafka } from "kafkajs";

export const createKafkaClient = (service: string) => {
  const brokersEnv = process.env.KAFKA_BROKERS;
  if (!brokersEnv) {
    throw new Error("KAFKA_BROKERS environment variable is required (comma-separated brokers)");
  }

  const brokers = brokersEnv.split(",").map((b) => b.trim()).filter(Boolean);

  return new Kafka({
    clientId: service,
    brokers,
  });
};
