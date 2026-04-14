import Redis from "ioredis";

const rawRedisHost = process.env.REDIS_HOST || "127.0.0.1";
const normalizedRedisHost = rawRedisHost
  .replace(/^redis:\/\//, "")
  .replace(/^rediss:\/\//, "")
  .replace(/^https?:\/\//, "")
  .split("/")[0];
const shouldUseTls =
  /^(rediss|https):\/\//.test(rawRedisHost) ||
  normalizedRedisHost.includes("upstash.io");

const redis = new Redis({
  host: normalizedRedisHost,
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  ...(shouldUseTls ? { tls: {} } : {}),
});

export default redis;
