
const config = require("config");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

process.env.MONGO_ROOT_USERNAME = 'root'
process.env.MONGO_ROOT_PASSWORD = 'root_pw'

const connect = async (req, res, next) => {
    const dbURL = `mongodb://${process.env.MONGO_ROOT_USERNAME}:${process.env.MONGO_ROOT_PASSWORD}@${config.remotes.mongodb.host}:${config.remotes.mongodb.port}/${dbName}`;
    console.log(`connecting to ${dbURL}`);
    await mongoose.connect(dbURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log('Successfully connected to db');
    next();
}

module.exports = {
    connect
}