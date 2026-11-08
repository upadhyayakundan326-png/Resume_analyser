const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis(
    process.env.REDIS_URL ,
    {
        maxRetriesPerRequest: null
    }
);

const redisQueue = new Queue("resume-analysis", {
    connection
    
});
console.log("connection ready")

module.exports = redisQueue;