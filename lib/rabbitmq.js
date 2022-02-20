const amqp = require('amqplib');
const config = require('config');

class RabbitMQ {
    #URL = `amqp://${config.remotes.rabbitmq.host}`;
    queue = config.remotes.rabbitmq.queue;
    exchange = config.remotes.rabbitmq.exchange;
    key = config.remotes.rabbitmq.key
    connection = null;
    channel = null;


    async connect() {
        this.connection = await amqp.connect(this.#URL);
    }
    
    async createChannel() {
        this.channel = await this.connection.createChannel();
        this.exchange = await this.channel.assertExchange(
            this.exchange,
            'direct',
            { durable: true }
        ).catch(console.error);
        const queueResponse = await this.channel.assertQueue(this.queue, {durable: true});
        console.log('createChannel queueResponse: ', queueResponse);
        const bindResponse = await this.channel.bindQueue(this.queue, this.exchange, this.key);
        console.log('createChannel bindResponse: ', bindResponse);
    }
    
    async produce(data) {
        try {
            await this.connect();
            await this.createChannel();
            await this.publish(data);
            await this.close();
        } catch (err) {
            console.error(`error publishing message to ${} with id ${data.id}`)
        }
    }

    async consume() {
        // await this.channel.bindQueue(this.queue, this.exchange, this.key);
        this.channel.consume(q.queue, function(msg) {
            console.log("msg ", msg);
        }, { noAck: true });
    }

    async publish(data) {
        await this.channel.publish(
            this.exchange,
            this.queue,
            Buffer.from(data)
        );
    }

    async close() {
        await this.channel.close();
        await this.connection.close();
    }

    getURL() {
        return this.#URL;
    }
}

module.exports = RabbitMQ;
