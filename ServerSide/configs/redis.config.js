const redis = require('redis');

const client = redis.createClient( {
    port: 6379,
    host: "127.0.0.1"
});

client.on('connect', () => {
    console.log("Client connected to redis-server")
});
client.on('error', (err) => {
    console.log(err.message)
});
client.on('end', () => {
    console.log("Client disconnected from redis-server")
});
process.on('SIGINT', () => {
    client.quit()
});

module.exports = client;