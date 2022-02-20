const jwt = require("jsonwebtoken");
const config = require("../config/auth.js");

const verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
    if (!token) {
        console.error('no token provided');
        return next({ statusCode: 403, message: "Authentication information missing", stack: 'verifyToken'});
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Authentication failed" });
        }
        req.userId = decoded.id;
        next();
    });
};

const isAdmin = async (req, res, next) => {
    const user = await User.findById(req.userId).exec();
    const userRoles = await Role.find({_id: { $in: user.roles }});

    for (const role of userRoles) {
        if (role.name === "admin") {
            next();
            return;
        }
        throw new Error({type: 'authorization'});
    }
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "admin") {
                        next();
                        return;
                    }
                }
                res.status(403).send({ message: "Require Admin Role!" });
                return;
            }
        );
    });
};

isModerator = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "moderator") {
                        next();
                        return;
                    }
                }
                res.status(403).send({ message: "Require Moderator Role!" });
                return;
            }
        );
    });
};

module.exports = {
    verifyToken,
    isAdmin,
    isModerator
};

