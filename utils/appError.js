class AppError extends Error{
	constructor(statusCode, msg, isOperational = true) {
		super(msg);
		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
		this.isOperational = isOperational;
		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = AppError;
