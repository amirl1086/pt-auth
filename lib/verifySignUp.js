const config = require("config");

const models = require("./mongo/models");
const User = models.User


const checkDuplicateUsernameOrEmail = async (req, res, next) => {
    console.log('checkDuplicateUsernameOrEmail');
    const username = req.body.username;
    const email = req.body.email;
    let user = null;
    try {
        user = await User.findOne({ $or: [{ username }, { email }] });
        console.log('user: ', user);
        if (user) {
            console.warn(`user with name ${username} or ${email} already in use`);
            return next({statusCode: 409, message: 'User name or Email address already exists', stack: 'checkDuplicateUsernameOrEmail'});
        }
        console.log('checkDuplicateUsernameOrEmail calling next');
        next();
    } catch (err) {
        console.error(`error checking for duplicate users, ${err}`);
        next({statusCode: 500, message: 'Internal server error'});
    }
};

const checkRolesExisted = (req, res, next) => {
    console.log('checkRolesExisted');
    for (const reqRole of req.body.roles) {
        if (!config.auth.roles.includes(reqRole)) {
            console.warn(`requested role ${reqRole} does not exist`);
            return next({statusCode: 404, message: 'User role does not exists'})
        }
    }
    console.log('checkRolesExisted calling next');
    next();
};

module.exports = {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted
};

