const express = require('express');
const reviewControllers = require('./../controllers/reviewControllers');
const authControllers = require('./../controllers/authControllers');
const reqFilter = require('./../utils/middlewares/RequestFilter');

const router = express.Router({mergeParams: true});
router
	.route('/')
	.get(reviewControllers.getAllReviews)
	.post(authControllers.protect,
		authControllers.restrictTo('user', 'admin'),
		reviewControllers.setReviewReqBody,
		reviewControllers.createReview);

router
	.route('/:id')
	.delete(authControllers.protect,
		authControllers.restrictTo('admin'),
		reviewControllers.deleteReview)
	.patch(authControllers.protect,
		reqFilter('review', 'rating'),
		reviewControllers.updateReview);

module.exports = router;
