import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { clerkMiddleware } from "@hono/clerk-auth";
import sessionRoute from "./routes/session.route.js";
import { cors } from "hono/cors";
import { consumer, producer } from "./utils/kafka.js";
import { runKafkaSubscriptions } from "./utils/subscriptions.js";
import webhookRoute from "./routes/webhooks.route.js";

const app = new Hono();
const rawOrigins = process.env.CLIENT_ORIGIN ?? "";
const corsOrigins = rawOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean) as string[];

app.use("*", clerkMiddleware());
app.use(
  "*",
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.route("/sessions", sessionRoute);
app.route("/webhooks", webhookRoute);

// app.post("/create-stripe-product", async (c) => {
//   const res = await stripe.products.create({
//     id: "123",
//     name: "Test Product",
//     default_price_data: {
//       currency: "usd",
//       unit_amount: 10 * 100,
//     },
//   });

//   return c.json(res);
// });

// app.get("/stripe-product-price", async (c) => {
//   const res = await stripe.prices.list({
//     product: "123",
//   });

//   return c.json(res);
// });

const start = async () => {
  try {
    await Promise.all([
      producer.connect(),
      consumer.connect(),
    ]);
    await runKafkaSubscriptions();
    const port = Number(process.env.PORT);
    const host = process.env.HOST;
    if (!port) throw new Error("PORT must be set in environment for payment-service");
    if (!host) throw new Error("HOST must be set in environment for payment-service");

    serve(
      {
        fetch: app.fetch,
        port,
        hostname: host,
      },
      () => {
        console.log(`Payment service is running on ${host}:${port}`);
      }
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
start();