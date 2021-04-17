const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: [true, 'User name is missing...']
	},
	email: {
		type: String,
		required: [true, 'Email is missing...'],
		trim: true,
		validate: [validator.isEmail, 'Invalid email...'],
		unique: true,
		lowercase:  true
	},
	avatar: String,
	password: {
		type: String,
		required: [true, 'User password is missing...'],
		trim: true,
		// minlength: 8
		select: false
	},
	role:{
		type: String,
		enum: ['user', 'admin', 'lead-guide', 'guide'],
		default: 'user'
	},
	active:{
		type: Boolean,
		select: false,
		default: true
	},
	tempToken:{
		type: String,
		select: false
	},
	tempTokenExp:{
		type: Date,
		select: false
	},
	passwordUpdatedAt: {
		type:Date,
		select: false
	}
},{
	timestamps: true,
	//add virtual fields
	toJSON: {virtuals: true},
	toObject: {virtuals: true}
});

userSchema.pre("save", async function (next) {
	// if the password hasn't been changed, then return
	// bcrypt needs to await
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 12);
	next();
});

// userSchema.pre('save', function (next) {
// 	if (!this.isModified()) return next();
// 	this.updatedAt = Date.now();
// 	next();
// });

userSchema.pre('save', function (next) {
	if(!this.isModified('password') || this.isNew) return next();
	this.passwordUpdatedAt = Date.now();
	next();
});

userSchema.pre(/^find/, function (next) {
	this.find({active:{$ne: false}});
	next();
});

userSchema.methods.validatePassword = async function(reqPassword, userPassword) {
	return await bcrypt.compare(reqPassword, userPassword);
};

userSchema.methods.hasPasswordChanged = function(jwtExpiredAt) {
	if(this.passwordUpdatedAt) {
		return parseInt(this.passwordUpdatedAt.getTime() / 1000, 10) > jwtExpiredAt
	}
	return false;
};

userSchema.methods.getTempToken = function() {
	// crypto generate random string token
	const token = crypto.randomBytes(32).toString('hex');
	// encrypt token
	this.tempToken = crypto.createHash('sha256')
		.update(token)
		.digest('hex');
	// set token expiry
	this.tempTokenExp = Date.now() + 10 * 60 * 1000; // now plus 10 min
	return token;
};

const UserModel = new mongoose.model('User', userSchema);
module.exports = UserModel;
