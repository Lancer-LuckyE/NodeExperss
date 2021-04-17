const util = require('util');
const UserModel = require('./../models/UserModel');
const appError = require('./../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailHandler');

const signJWT = (user) => {
	return jwt.sign({
		id: user._id,
		name: user.name,
		email: user.email
	}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE_IN});
};

const cookieOptions = () => {
	const cookieOptions = {
		expires: new Date(Date.now() + process.env.JWT_COOCKIE_EXPIRE_IN * 24 * 60 * 60 * 1000),
		httpOnly: true
	};
	if (process.env.NODE_ENV === 'prod') {
		cookieOptions.secure = true;
	}
	return cookieOptions;
};

// TODO: email is unique, what if I signup a user with a same email of a deleted user
exports.signup = catchAsync(async (req, res, next) => {
	const newUser = await UserModel.create(req.body);
	const token = signJWT(newUser);
	res.cookie('jwt', token, cookieOptions());
	res.status(201).json({
		status: 'success',
		token,
		data: {
			id: newUser._id,
			email: newUser.email,
			name: newUser.name
		}
	});
});

exports.login = catchAsync(async (req, res, next) => {
	const {email, password} = req.body;
	//check email && password are received
	if (!email || !password){
		return next(new appError(400, 'Email and/or password is missing'));
	}
	//validate the email exists
	const user = await UserModel.findOne({email}).select('+password');
	//validate the email and the password
	if (!user || !(await user.validatePassword(password, user.password))){
		return next(new appError(401, 'Invalid email or wrong password'));
	}
	//everything is passed then sign the token
	const token = signJWT(user);
	res.cookie('jwt', token, cookieOptions());
	res.status(200).json({
		status: 'success',
		token,
		data: {
			id: user._id
		}
	});
});

exports.protect = catchAsync(async (req, res, next) => {
	let token;
	//check if token exist
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	} else {
		next(new appError(401, 'Please login to get access...'));
	}
	//token verification
	const decoded = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);
	//check if user exist
	const currentUser = await UserModel.findById(decoded.id).select('+passwordUpdatedAt +role');
	if (!currentUser) {
		next(new appError(401, 'User does not exist...'));
	}
	//check if password changed after token is issued
	if (currentUser.hasPasswordChanged(decoded.iat)) {
		next(new appError(401, 'Password has been changed, please login to get access...'));
	}
	req.user = currentUser;
	next();
});

exports.restrictTo = (...role) => {
	return (req, res, next) => {
		if (!role.includes(req.user.role)) {
			next(new appError(403, 'You are not allow to access the resource...'));
		}
		next();
	}
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
	// verify email
	if (!req.body.email) {
		next(new appError(400, 'Email is missing...'));
	}
	const user = await UserModel.findOne({email: req.body.email}).select('+tempToken +tempTokenExp');
	if (!user) {
		next(new appError(404, 'User does not exist, please try sign-up...'));
	}
	// generate temp password
	const tempToken = user.getTempToken();
	console.log(tempToken, user.tempToken);
	await user.save({validateBeforeSave: false, timestamps: true});
	// sent token to user's email
	// const passwordResetUrl = `${req.protocol}://${req.host}:${process.env.EXPRESS_PROT}/api/v1/users/reset-password/${tempToken}`;
	const passwordResetUrl = `{{base_url}}/api/v1/users/reset-password/${tempToken}`;
	const options = {
		email: req.body.email,
		subject: 'Natour App Password Reset',
		text: `Please visit ${passwordResetUrl} to reset password. \nPlease reset the password within 10 min.`
	};
	try {
		await sendEmail(options);
		res.status(200).json({
			status: 'success',
			data: 'email sent'
		})
	} catch (err) {
		user.tempToken = undefined;
		user.tempTokenExp = undefined;
		await user.save({validateBeforeSave: false, timestamps: true});
		console.log(err);
		next(new appError(500, 'Server failed to send the email, please try again later...', false));
	}
});

