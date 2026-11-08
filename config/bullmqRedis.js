const IORedis = require("ioredis");
console.log("REDIS URL EXISTS:", !!process.env.REDIS_URL);

const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null
});

module.exports = connection;