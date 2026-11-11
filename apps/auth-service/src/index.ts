import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { shouldBeAdmin } from "./middleware/authMiddleware.js";
import userRoute from "./routes/user.route";
import { producer } from "./utils/kafka.js";

const app = express();
const corsOrigins = [process.env.CLIENT_ORIGIN, process.env.ADMIN_ORIGIN].filter(Boolean) as string[];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(clerkMiddleware());

app.get("/health", (req: Request, res: Response) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.use("/users", shouldBeAdmin, userRoute);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return res
    .status(err.status || 500)
    .json({ message: err.message || "Inter Server Error!" });
});

const start = async () => {
  try {
    const port = Number(process.env.PORT);
    const host = process.env.HOST;
    if (!port) throw new Error("PORT must be set in environment for auth-service");
    if (!host) throw new Error("HOST must be set in environment for auth-service");

    await producer.connect();
    app.listen(port, host, () => {
      console.log(`Auth service is running on ${host}:${port}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
