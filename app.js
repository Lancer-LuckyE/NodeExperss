const { json } = require("express");
const express = require("express");
const morgan = require("morgan");
// security related
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitizer = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
// routers and utils
const tourRouters = require("./routers/tourRouters");
const userRouters = require("./routers/userRouters");
const reviewRouters = require('./routers/reviewRouters');
const appError = require("./utils/appError");
const errorHandler = require("./utils/middlewares/ErrorHandlerMiddleware");
const app = express();

// request is being processed by the middleware stack before it create a response
// middleware stack is in the order of they define
// the middleware stack is over when invoke res.send

// global middleware
// security http headers
app.use(helmet());
// rate limit
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, Please try again later...'
});
app.use('/api', limiter);
// body request parser
app.use(express.json({limit: '10kb'}));
// request sanitizer: noSQL query injection
app.use(sanitizer());
// xss protection: cross-site scripting attack
app.use(xss());
// http params pollution prevention: whitelist allow certain duplicate fields in the http url params
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}));
// serving static files
app.use(express.static(`${__dirname}/public`));
// dev log
if (process.env.NODE_ENV === 'dev') {
  app.use(morgan("dev"));
}
// test middleware
app.use((req, res, next) => {
  req.requestAt = new Date().toLocaleString("en-CA");
  console.log(req.requestAt);
  next();
});
// #####################################################################
// self-defined middleware have to call next() to continue the server!!!
// #####################################################################

app.use("/api/v1/tours", tourRouters);
app.use("/api/v1/users", userRouters);
app.use("/api/v1/reviews", reviewRouters);

app.all("*", (req, res, next) => {
  next(new appError(404, `site_url/${req.originalUrl} is not found...`));
});

app.use(errorHandler.globalErrorHandler);

module.exports = app;
