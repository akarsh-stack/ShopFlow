import { Hono } from "hono";
import Stripe from "stripe";
import stripe from "../utils/stripe.js";
import { producer } from "../utils/kafka.js";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const webhookRoute = new Hono();

webhookRoute.get("/", (c) => {
  return c.json({
    status: "ok webhook",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});


webhookRoute.post("/stripe", async (c) => {
  const body = await c.req.text();
  const sig = c.req.header("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (error) {
    console.log("Webhook verification failed!");
    return c.json({ error: "Webhook verification failed!" }, 400);
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;

      // Validate required session fields
      if (!session.client_reference_id) {
        console.log("Missing client_reference_id in session");
        return c.json({ error: "Invalid session: missing customer reference" }, 400);
      }

      // Get customer email - fallback to retrieving customer object if needed
      let customerEmail = session.customer_details?.email;
      if (!customerEmail && session.customer) {
        try {
          // session.customer can be a string ID or an expanded Customer object
          const customerId =
            typeof session.customer === "string"
              ? session.customer
              : session.customer.id;

          const customer = await stripe.customers.retrieve(customerId);

          // Stripe returns DeletedCustomer if the customer was deleted - it has no email
          if (!customer.deleted) {
            customerEmail = customer.email;
          }
        } catch (customerError) {
          console.log("Failed to retrieve customer:", customerError);
        }
      }

      if (!customerEmail) {
        console.log("Unable to determine customer email for session:", session.id);
        return c.json({ error: "Cannot determine customer email" }, 400);
      }

      // Get line items and validate they have prices
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

      // Filter to only include line items with valid prices (type predicate narrows the type)
      const validLineItems = lineItems.data.filter(
        (item): item is typeof item & { price: Stripe.Price } =>
          !!item.price &&
          typeof item.price.unit_amount === "number" &&
          !isNaN(item.price.unit_amount)
      );

      if (validLineItems.length === 0) {
        console.log("No valid price-based line items found in session:", session.id);
        return c.json({ error: "No valid products found in session" }, 400);
      }

      // Send validated data to order service
      try {
        producer.send("payment.successful", {
          value: {
            userId: session.client_reference_id,
            email: customerEmail,
            amount: session.amount_total,
            status: session.payment_status === "paid" ? "success" : "failed",
            products: validLineItems.map((item) => ({
              name: item.description || `Product ${item.price.product || "Unknown"}`,
              quantity: item.quantity,
              price: item.price.unit_amount,
            })),
          },
        });
      } catch (sendError) {
        console.error("Failed to send payment.successful event:", sendError);
        // Return 500 so Stripe will retry the webhook
        return c.json({ error: "Internal server error" }, 500);
      }

      break;

    default:
      break;
  }
  return c.json({ received: true });
});

export default webhookRoute;