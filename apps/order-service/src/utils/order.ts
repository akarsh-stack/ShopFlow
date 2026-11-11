import { Order } from "@shopflow/order-db";
import { OrderType } from "@shopflow/types";
import { producer } from "./kafka";

export const createOrder = async (order: OrderType) => {
  const newOrder = new Order(order);

  try {
    const savedOrder = await newOrder.save();
    producer.send("order.created", {
      value: {
        email: savedOrder.email,
        amount: savedOrder.amount,
        status: savedOrder.status,
      },
    });
    return savedOrder;
  } catch (error) {
    console.error("Failed to create order:", error);
    throw error;
  }
};