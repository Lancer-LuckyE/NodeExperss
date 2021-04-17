const authController = require('../controllers/authControllers');
const tourControllers = require("../controllers/tourControllers");
const tourMiddlewares = require('./../utils/middlewares/TourMiddlewares');
// const reviewControllers = require('./../controllers/reviewControllers');
const reviewRouter = require('./reviewRouters');
const express = require("express");

const router = express.Router();
// router.param("id", tourControllers.checkId);

router.use('/:tourId/reviews',reviewRouter);

router
	.route("/top-five-tours")
	.get(tourMiddlewares.aliasTopTours, tourControllers.getAllTours);
router
	.route("/get-tour-stats")
	.get(tourControllers.getTourStats);
router
	.route("/monthly-plans/:year")
	.get(tourControllers.monthlyPlans);
router
  .route("/")
  .get(tourControllers.getAllTours)
  .post(authController.protect,
	  authController.restrictTo('admin', 'lead-guide'),
	  tourControllers.createTour);
router
  .route("/:id")
  .get(tourControllers.getSingleTour)
  .patch(authController.protect,
	  authController.restrictTo('admin', 'lead-guide'),
	  tourControllers.updateTour)
  .delete(authController.protect,
	  authController.restrictTo('admin', 'lead-guide'),
	  tourControllers.deleteTour);
// router
// 	.route('/:id/reviews')
// 	.post(authController.protect,
// 		authController.restrictTo('user', 'admin'),
// 		reviewControllers.createReview);


module.exports = router;
