const { Queue } = require("bullmq");
const connection = require("../config/bullmqRedis");

const redisQueue = new Queue("resume-analysis", {
    connection
});

module.exports = redisQueue;