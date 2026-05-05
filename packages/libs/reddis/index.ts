import Redis from "ioredis";

const redisUrl =
  process.env.REDIS_DATABASE_URL ?? process.env.REDIS_DATABSE_URL;

if (!redisUrl) {
  throw new Error(
    "Missing Redis URL. Set REDIS_DATABASE_URL (preferred) or REDIS_DATABSE_URL.",
  );
}

const redis = new Redis(redisUrl);

export default redis;
