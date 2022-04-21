
const config = require("config");
const mongoose = require("mongoose");
const logger = require('./../../logger').logger
mongoose.Promise = global.Promise;

process.env.MONGO_ROOT_USERNAME = 'root'
process.env.MONGO_ROOT_PASSWORD = 'root_pw'

const connect = async (dbName) => {
    const dbURL = `mongodb://${process.env.MONGO_ROOT_USERNAME}:${process.env.MONGO_ROOT_PASSWORD}@${config.remotes.mongodb.host}:${config.remotes.mongodb.port}/${dbName}`;
    console.log(`connecting to ${dbURL}`);
    logger.log({level: 'info', message: 'connecting to' + dbURL});
    await mongoose.connect(dbURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log('Successfully connected to db');
    logger.log({level: 'info', message: 'Successfully connected to db'});
}

module.exports = {
    connect
}