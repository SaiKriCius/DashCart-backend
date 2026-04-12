import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redis = new Redis(process.env.UPSTASH_REDIS_URL, {
  tls: {},
});

redis.on("error", (err) => {
  console.log("Redis error:", err.message);
});