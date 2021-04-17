const catchAsync = require('./../../utils/catchAsync');
const appError = require('./../../utils/appError');
const apiFeatures = require('./../../utils/apiFeatures');

exports.deleteOne = model => catchAsync(async (req, res, next) => {
	if (!req.params.id) {
		return next(new appError(400, 'Document id is not defined...'));
	}
	const doc = await model.findByIdAndDelete(req.params.id);
	if (!doc) {
		return next(new appError(404, `The document is not found: ${req.params.id}`));
	}
	res.status(204).json({
		status: "success",
		data: null
	});
});

exports.updateOne = (model) => catchAsync(async (req, res, next) => {
	const updatedDoc = await model.findByIdAndUpdate(req.params.id,
		{$set: req.body},
		{
			new: true,
			runValidators: true
		});
	if (!updatedDoc) {
		return next(new appError(404, `The document is not found: ${req.params.id}`));
	}
	res.status(200).json({
		status: "success",
		data: updatedDoc
	});
});

exports.saveOne = (model) => catchAsync(async (req, res, next) => {
	if (!req.params.id) {
		return next(new appError(400, 'Document id is not defined...'));
	}
	const doc = await model.findById(req.params.id);
	if (!doc) {
		return next(new appError(404, `The document is not found: ${req.params.id}`));
	}
	doc.set(req.body);
	const updatedDoc = await doc.save({timestamps: true});
	res.status(200).json({
		status: "success",
		data: updatedDoc,
	});
});

exports.createOne = model => catchAsync(async (req, res, next) => {
	const newDoc = (await model.create(req.body)).toObject();
	// TODO: exclude fields from create/save
	delete newDoc.createdAt;
	delete newDoc.updatedAt;
	delete newDoc.__v;
	console.log(newDoc);
	res.status(201).json({
		status: "success",
		data: newDoc
	});
});

exports.getOne = (model, popOptions=null) => catchAsync(async (req, res, next) => {
	let query = model.findById(req.params.id).select('-createdAt -updatedAt -__v');
	if (popOptions) query = query.populate(popOptions);
	const doc = await query;
	if (!doc) {
		return next(new appError(404, `The tour is not found: TourId-${req.params.id}`));
	}
	res.status(200).json({
		status: "success",
		data: doc,
	});
});

exports.getAll = model => catchAsync(async (req, res, next) => {
	const filter = req.params.tourId ? {tour: req.params.tourId} : {};

	const features = new apiFeatures(model.find(filter), req.query).filter().sort().limitFields().pagination();
	const docs = await features.query.select('-createdAt -updatedAt -__v');
	res.status(200).json({
		status: 'success',
		results: docs.length,
		data: {
			docs
		}
	});
});
