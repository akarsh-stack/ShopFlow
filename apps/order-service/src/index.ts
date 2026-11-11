import Fastify from "fastify";
import Clerk from "@clerk/fastify";
import { shouldBeUser } from "./middleware/authMiddleware.js";
import { connectOrderDB } from "@shopflow/order-db";
import { orderRoute } from "./routes/order.js";
import { consumer, producer } from "./utils/kafka.js";
import { runKafkaSubscriptions } from "./utils/subscriptions.js";

const fastify = Fastify();

fastify.register(Clerk.clerkPlugin);

fastify.get("/health", (request, reply) => {
  return reply.status(200).send({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

fastify.get("/test", { preHandler: shouldBeUser }, (request, reply) => {
  return reply.send({
    message: "Order service is authenticated!",
    userId: request.userId,
  });
});

fastify.register(orderRoute);

const start = async () => {
  try {
    // Wait for all connections to establish in parallel
    await Promise.all([
      connectOrderDB(),
      producer.connect(),
      consumer.connect(),
    ]);

    await runKafkaSubscriptions();
    const port = Number(process.env.PORT || 8001);
    const host = process.env.HOST || "0.0.0.0";

    await fastify.listen({ port, host });
    console.log(`Order service is running on ${host}:${port}`);
  } catch (err) {
    console.error("Failed to start order service:", err);
    process.exit(1);
  }
};
start();