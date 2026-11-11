import { Hono } from "hono";
import stripe from "../utils/stripe.js";
import { shouldBeUser } from "../middleware/authMiddleware.js";
import { CartItemsType } from "@shopflow/types";
import { getStripeProductPrice } from "../utils/stripeProduct.js";

const sessionRoute = new Hono();

sessionRoute.post("/create-checkout-session", shouldBeUser, async (c) => {
  const { cart }: { cart: CartItemsType } = await c.req.json();
  const userId = c.get("userId");

  const lineItems = await Promise.all(
    cart.map(async (item) => {
      const unitAmount = await getStripeProductPrice(item.id);
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: unitAmount as number,
        },
        quantity: item.quantity,
      };
    })
  );

  try {
    const clientOrigin = process.env.CLIENT_ORIGIN;
    const stripeReturn = process.env.STRIPE_RETURN_URL;
    if (!stripeReturn && !clientOrigin) {
      throw new Error("STRIPE_RETURN_URL or CLIENT_ORIGIN must be set in environment");
    }

    const returnUrl = stripeReturn || `${clientOrigin}/return?session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      client_reference_id: userId,
      mode: "payment",
      ui_mode: "custom",
      return_url: returnUrl,
    });

    // console.log(session);

    return c.json({ checkoutSessionClientSecret: session.client_secret });
  } catch (error) {
    console.log(error);
    return c.json({ error });
  }
});

sessionRoute.get("/:session_id", async (c) => {
  const { session_id } = c.req.param();
  const session = await stripe.checkout.sessions.retrieve(
    session_id as string,
    {
      expand: ["line_items"],
    }
  );

  // console.log(session);

  return c.json({
    status: session.status,
    paymentStatus: session.payment_status,
  });
});

export default sessionRoute;