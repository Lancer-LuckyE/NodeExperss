const factory = require('./utils/factory');
const TourModel = require('./../models/TourModel');
const apiFeatures = require('./../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const appError = require('./../utils/appError');
// const fs = require("fs");
//
// const mockData = JSON.parse(
//   fs.readFileSync(`${__dirname}/../courseFiles/mockData/tours-simple.json`)
// );

// const findTour = (id) => {
//   return (tour = mockData.find((el) => {
//     return el.id === id * 1;
//   }));
// };

// exports.getAllTours = catchAsync(async (req, res, next) => {
// 	const features = new apiFeatures(TourModel.find(), req.query).filter().sort().limitFields().pagination();
// 	//execute the query
// 	const tours = await features.query;
// 	res.status(200).json({
// 		status: "success",
// 		results: tours.length,
// 		data: {
// 			tours,
// 		},
// 	});
// });

// exports.getSingleTour = catchAsync(async (req, res, next) => {
// 	// Array.prototype.find(callBack)
// 	// the call back function takes an element parameter, and find the element when the function return true
// 	const tour = await TourModel.findById(req.params.id).populate('reviews').select('-tour');
// 	if (!tour) {
// 		return next(new appError(404, `The tour is not found: TourId-${req.params.id}`));
// 	}
// 	res.status(200).json({
// 		status: "success",
// 		data: {
// 			tour,
// 		},
// 	});
// });

// exports.updateTour = catchAsync(async (req, res, next) => {
// 	// TODO：change to save() and use the pre save middleware to set the updateAt
// 	// req.body.updatedAt = Date.now();
// 	const tour = await TourModel.findByIdAndUpdate(req.params.id, req.body, {
// 		new: true,
// 		runValidators: true
// 	});
// 	// const tour = await TourModel.findById(req.params.id);
// 	if (!tour) {
// 		return next(new appError(404, `The tour is not found: TourId-${req.params.id}`));
// 	}
// 	// tour.set(req.body);
// 	// const data = await tour.save();
// 	res.status(200).json({
// 		status: "success",
// 		data: tour
//
// 	});
// });
//
// exports.deleteTour = catchAsync(async (req, res, next) => {
// 	const tour = await TourModel.findByIdAndDelete(req.params.id);
// 	if (!tour) {
// 		return next(new appError(404, `The tour is not found: TourId-${req.params.id}`));
// 	}
// 	res.status(204).json({
// 		status: "success",
// 		data: null
// 	});
// });


// exports.createTour = catchAsync(async (req, res, next) => {
// 	const newTour = await TourModel.create(req.body);
// 	res.status(201).json({
// 		status: "success",
// 		data: newTour
// 	});
// });

exports.getAllTours = factory.getAll(TourModel);
exports.getSingleTour = factory.getOne(TourModel, {path: 'reviews', select: '-tour'});
exports.createTour = factory.createOne(TourModel);
exports.updateTour = factory.updateOne(TourModel);
exports.deleteTour = factory.deleteOne(TourModel);

exports.getTourStats = catchAsync(async (req, res, next) => {
	const stats = await TourModel.aggregate([
		{$match: {ratingsAverage: {$gte: 4.5}}},
		{
			$group: {
				_id: '$difficulty',
				numTours: {$sum: 1},
				tours: {$push: '$name'},
				numRatings: {$sum: '$ratingsQuantity'},
				avgRating: {$avg: '$ratingsAverage'},
				avgPrice: {$avg: '$price'},
				minPrice: {$min: '$price'},
				maxPrice: {$max: '$price'}
			}
		},
		{$sort: {numTours: 1}},
		// {$match: {_id: {$ne: 4.5}}}
	]);
	res.status(200).json({
		status: "success",
		data: {
			stats,
		},
	});
});

exports.monthlyPlans = catchAsync(async (req, res, next) => {
	const year = req.params.year * 1;
	const plans = await TourModel.aggregate([
		{
			$unwind: '$startDates'
		},
		{
			$match: {
				startDates: {
					$gte: new Date(`${year}-01-01`),
					$lte: new Date(`${year}-12-01`)
				}
			}
		},
		{
			$group: {
				_id: {$month: '$startDates'},
				tourCount: {$sum: 1},
				tours: {$push: '$name'}
			}
		},
		{
			$addFields: {
				month: '$_id'
			}
		},
		{
			$project: {
				_id: 0
			}
		},
		{
			$sort: {
				tourCount: -1
			}
		}
	]);
	if (plans.length < 1) {
		return next(new appError(404, `The plan is not found: year-${req.params.year}`));
	}
	res.status(200).json({
		status: "success",
		data: {
			plans
		}
	})
});
