import {kafka} from 'kafkajs';

export const kafka=new kafka({
    clientId: 'kafka-service',
    brokers: ["pkc-xrnwx.asia-south2.gcp.conluent.cloud:9092"],
    ssl:true,
    sasl : {
        mechanism: "plain",
        username: process.env.KAFKA_API_KEY!,
        password: process.env.KAFKA_API_SECRET!,
    },
});

