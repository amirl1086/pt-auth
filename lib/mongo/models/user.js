const mongoose = require('mongoose');
const crypto = require('crypto');


const UserSchema = new mongoose.Schema({
    username: { 
        type : String, 
        required : true
    },
    email: { 
        type : String, 
        required : true
    },
    password: String,
    salt: String,
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    }]
})

UserSchema.methods.setPassword = (password) => {
    // Creating a unique salt for a particular user
    this.salt = crypto.randomBytes(16).toString('hex');
    logger.log({level: 'info', message: 'this.salt create ' + this.salt});
    // Hashing user's salt and password with 1000 iterations
    this.password = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

UserSchema.methods.isPasswordValid = (password) => {
    logger.log({level: 'info', message: 'this.salt ' + this.salt});
    const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.password === hash;
};

const User = module.exports = mongoose.model('User', UserSchema);