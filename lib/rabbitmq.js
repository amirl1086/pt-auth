const amqp = require('amqplib');
const config = require('config');
const logger = require('./../logger')

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

    async directPublish(data) {
        await this.setupChannel();
        this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(data)))
    }

    close() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.connection.close();
                logger.info('closed rabbitmq connection');
                resolve();
            }, 500);
        })
    }
}

module.exports = RabbitMQ;
