const express = require('express');
const router = express.Router();

const verifySignUp = require("./verifySignUp");
const auth = require("./auth");
const authJwt = require("./authJWT");
const mongodb = require('./mongo/db')

router.post("/auth/signup", [mongodb.connect, verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted], auth.signup);
router.post("/auth/signin", auth.signin);

router.get("/test/all", auth.allAccess);
router.get("/test/user", [authJwt.verifyToken], auth.userBoard);
router.get("/test/mod",[authJwt.verifyToken, authJwt.isModerator], auth.moderatorBoard);
router.get("/test/admin",[authJwt.verifyToken, authJwt.isAdmin], auth.adminBoard);

module.exports = router;
