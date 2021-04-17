const factory = require('./utils/factory');
const ReviewModel = require('./../models/ReviewModel');
const appError = require('./../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.setReviewReqBody = (req, res, next) => {
	if (!req.body.tour && req.params.id) req.body.tour = req.params.id;
	if (!req.body.user && req.user) req.body.user = req.user.id;
	next()
};

exports.getAllReviews = factory.getAll(ReviewModel);
exports.deleteReview = factory.deleteOne(ReviewModel);
exports.updateReview = factory.updateOne(ReviewModel);
exports.createReview = factory.createOne(ReviewModel);
exports.getSingleReview = factory.getOne(ReviewModel);
