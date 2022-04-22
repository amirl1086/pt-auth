const jwtConfig = require('../config/auth');
const config = require('config');
var jwt = require('jsonwebtoken');

const { User, Role } = require('./mongo/models');
const RabbitMQ = require('./rabbitmq');


const signup = async (req, res, next) => {
    try {
        const newUser = {
            username: req.body.username,
            email: req.body.email
        }
        const roles = req.body.roles;
        console.log('roles ', roles)
        if (Array.isArray(roles)) {
            const dbRoles = await Role.find({ name: { $in: roles } });
            console.log('dbRoles ', dbRoles)
            newUser.roles = dbRoles.map(role => role._id);
        } else {
            console.error('invalid user roles: ', roles)
            next({ statusCode: 404, message: 'Invalid user roles', stack: 'signup' });

            // insert default value in case not exists?
            // const role = await Role.findOne({ name: 'user' })
            // user.roles = [role._id]
        }
        const user = new User(newUser);
        user.setPassword(req.body.password);
        await user.save();
        console.log('signup user ', user._id);

        const rabbitmqClient = new RabbitMQ();
        await rabbitmqClient.connect();
        const functionName = `${config.remotes.rabbitmq.exchangeStrategy}Publish`
        await rabbitmqClient[functionName](user);

        JWT_signIn(res, user);
    } catch (err) {
        console.error(`error signing up, ${err}`);
        next({ statusCode: 500, message: 'Internal server error', stack: err.stack });
    }
};

const signin = async (req, res, next) => {
    let user = null, isPasswordValid = true, token = '';
    try {
        user = await User.findOne({ username: req.body?.username }).populate('roles', '-__v').exec();
        console.log('signin user ', user);
        isPasswordValid = user.isPasswordValid(req.body?.password);
        if (!user || !isPasswordValid) {
            console.warn(`failed to login with user ${req.body?.username}, password validity is ${isPasswordValid}`);
            return next({ statusCode: 404, message: 'Wrong user name or password', stack: 'signin' });
        }

        JWT_signIn(res, user);
    } catch (err) {
        console.error(`error finding user and compare password, ${err}`);
        return next({ statusCode: 500, message: 'Internal server error', stack: err.stack })
    }
};

const JWT_signIn = (res, user) => {
    res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        accessToken: jwt.sign({ id: user._id }, jwtConfig.secret, { expiresIn: config.jwt.timeout })
    });
}

const allAccess = (req, res) => {
    res.status(200).send('Public Content.');
};

const userBoard = (req, res) => {
    res.status(200).send('User Content.');
};

const adminBoard = (req, res) => {
    res.status(200).send('Admin Content.');
};

const moderatorBoard = (req, res) => {
    res.status(200).send('Moderator Content.');
};

module.exports = {
    signup,
    signin,
    allAccess,
    userBoard,
    adminBoard,
    moderatorBoard
}