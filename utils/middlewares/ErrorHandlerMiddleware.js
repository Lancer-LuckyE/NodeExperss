const appError = require('./../appError');
const validator = require('validator');

const sendDevError = (err, res) => {
	console.error(err);
	res.status(err.statusCode).json({
		status: err.status,
		errors: err,
		msg: validator.isJSON(err.message) ? JSON.parse(err.message) : err.message,
		stack: err.stack
	});
};

const sendProdError = (err, res) => {
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			msg: validator.isJSON(err.message) ? JSON.parse(err.message) : err.message
		});
	} else {
		console.error(err);
		res.status(500).json({
			status: 'error',
			msg: 'Internal server error, please try again later...'
		});
	}
};

const castErrorHandler = (mongooseError) => {
	return new appError(400, `Invalid ${mongooseError.path}: ${mongooseError.value}`);
};

const duplicateFieldErrorHandler = (mongooseError) => {
	return new appError(400, `Duplicate field: ${mongooseError.keyValue.name ? mongooseError.keyValue.name : Object.keys(mongooseError.keyValue)[0]}`);
};

const validationErrorHandler = (mongooseError) => {
	const errors = {};
	for (const error in mongooseError.errors) {
		errors[error] = mongooseError.errors[error].message;
	}
	const msg = JSON.stringify(errors);
	return new appError(400, msg);
};

const jwtErrorHandler = (jwtError) => {
	return new appError(401, 'Invalid token, please login to get access...');
};

const jwtExpireHandler = (jwtError) => {
	return new appError(401, 'Token expires, please login to get access...');
}

exports.globalErrorHandler = (err, req, res, next) => {
	err.status = err.status || 'error';
	err.statusCode = err.statusCode || 500;

	let error = { ...err };
	console.log(error);
	error.message = err.message;
	error.stack = err.stack;
	if (err.name === 'CastError') error = castErrorHandler(err);
	if (err.code === 11000) error = duplicateFieldErrorHandler(err);
	if (err.name === 'ValidationError') error = validationErrorHandler(err);
	if (err.name === 'JsonWebTokenError') error = jwtErrorHandler(err);
	if (err.name === 'TokenExpiredError') error = jwtExpireHandler(err);

	if (process.env.NODE_ENV === 'dev') {
		sendDevError(error, res);
	} else if (process.env.NODE_ENV === 'prod') {
		sendProdError(error, res);
	}
	next();
};
