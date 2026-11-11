import { consumer } from "./kafka";
import { createOrder } from "./order";

export const runKafkaSubscriptions = async () => {

  consumer.subscribe([
    {
      topicName: "payment.successful",
      topicHandler: async (message) => {
        try {
          const order = message.value;
          await createOrder(order);
          console.log(`Order created successfully for user: ${order.userId}`);
        } catch (error) {
          console.error("Failed to process order creation:", error);
          // Re-throw to let the consumer know processing failed
          // This will cause the message to be retried (depending on your Kafka config)
          throw error;
        }
      },
    },
  ]);
};