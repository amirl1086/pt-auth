const amqp = require('amqplib');
const config = require('config');

class RabbitMQ {
    constructor() {
        this.URL = `amqp://${config.remotes.rabbitmq.username}:${config.remotes.rabbitmq.password}@${config.remotes.rabbitmq.host}`;
        this.queueName = config.remotes.rabbitmq.queueName;
        this.exchangeName = config.remotes.rabbitmq.exchangeName;
        this.key = config.remotes.rabbitmq.key;
        this.consumerTag = config.remotes.rabbitmq.consumerTag;
        this.connection = null;
        this.channel = null;
    }

    async connect() {
        this.connection = await amqp.connect(this.URL);
    }

    async setupChannel () {
        this.channel = await this.connection.createChannel(); 
        await this.channel.assertExchange(this.exchangeName, config.remotes.rabbitmq.exchangeStrategy);
        await this.channel.assertQueue(this.queueName);
        this.channel.bindQueue(this.queueName, this.exchangeName, this.key);
    }

    async fanoutPublish(data) {
        this.channel = await this.connection.createChannel();
        this.exchange = this.channel.assertExchange(this.exchangeName, config.remotes.rabbitmq.exchangeStrategy, {durable: false});
        this.channel.publish(this.exchangeName, this.queueName, Buffer.from(JSON.stringify(data)));
    }

    async fanoutConsume() {
        this.setupChannel();
        this.channel.consume(rabbitQueue.queue, function(data) {
            console.log("data: ", data);
        }, { noAck: true, consumerTag: config.remotes.rabbitmq.consumerTag });
    }

    async directPublish(data) {
        this.setupChannel();
        this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(data)))
    }

    async directConsume() {
        this.channel = await this.connection.createChannel(); 
        await this.channel.assertExchange(this.exchangeName, config.remotes.rabbitmq.exchangeStrategy);
        await this.channel.assertQueue(this.queueName);
        this.channel.bindQueue(this.queueName, this.exchangeName, this.key);
        this.channel.consume(this.queueName, (message)=>{
            const data = JSON.parse(message.content);
            console.log('data: ', data);
            this.channel.ack(message);
        })
    }

    close() {
        setTimeout(() => {
            this.connection.close();
            console.log('closed rabbitmq connection');
        }, 500);
    }
}

module.exports = RabbitMQ;
