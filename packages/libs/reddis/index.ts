import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_DATABSE_URL!);

export default redis;
