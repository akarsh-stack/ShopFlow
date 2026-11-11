import { createKafkaClient } from "./client.js";

const TOPICS = [
  "user.created",
  "order.created",
  "product.created",
  "product.deleted",
  "payment.successful",
] as const;

const createTopics = async () => {
  const kafka = createKafkaClient("topic-init");
  const admin = kafka.admin();

  await admin.connect();

  const existing = await admin.listTopics();
  const missing = TOPICS.filter((topic) => !existing.includes(topic));

  if (missing.length === 0) {
    console.log("All Kafka topics already exist.");
    await admin.disconnect();
    return;
  }

  await admin.createTopics({
    topics: missing.map((topic) => ({
      topic,
      numPartitions: 3,
      replicationFactor: 3,
    })),
  });

  console.log("Created topics:", missing.join(", "));
  await admin.disconnect();
};

createTopics().catch((error) => {
  console.error("Failed to create Kafka topics:", error);
  process.exit(1);
});
