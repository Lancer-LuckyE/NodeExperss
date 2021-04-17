const mongoose = require("mongoose");
//const UserModel = require('./UserModel');
const slugify = require("slugify");

const tourSchema = new mongoose.Schema({
	name:{
		type: String,
		required: [true, 'Tour name is missing...'],
		trim:true,
		unique: true
	},
	slug: String,
	duration:{
		type: Number,
		required: [true, 'Tour duration is missing...'],
	},
	maxGroupSize:{
		type: Number,
		required: [true, 'Tour max group size is missing...'],
	},
	difficulty:{
		type: String,
		enum: ['easy', 'medium', 'hard'],
		required: [true, 'Tour difficulty is missing...'],
	},
	ratingsAverage:{
		type: Number,
		max: 5.0,
		min: 1.0,
		default:1.0
	},
	ratingsQuantity:{
		type: Number,
		min: 0,
		default: 0
	},
	price:{
		type:Number,
		required: [true, 'Tour price is missing...']
	},
	priceDiscount:{
		type:Number,
		validate: {
			// if using this keyword, the this points to the current document on NEW DOCUMENT creation.
			validator: function (discount) {
				return 0.0 <= discount && discount <= 1.0;
			},
			message: 'Tour discount({VALUE}) must be in the interval of 0.0 to 1.0 ...'
		}
	},
	summary:{
		type:String,
		trim: true,
		required: [true, 'Tour summary is missing...'],

	},
	description:{
		type:String,
		trim: true,
	},
	imageCover:{
		type:String,
		default:'default-cover.jpg',
	},
	images:[String],
	secret: Boolean,
	startDates:[Date],
	startLocation: {
		type: {
			type: String,
			enum: ['Point'],
			default: 'Point'
		},
		address: String,
		coordinates: [Number],
		description: String
	},
	locations: [
		{
			type: {
				type: String,
				enum: ['Point'],
				default: 'Point'
			},
			coordinates: [Number],
			description: String,
			day: Number
		}
	],
	guides: [{
		type: mongoose.Schema.ObjectId,
		ref: 'User'
	}]
}, {
	//setup timestamps
	timestamps: true,
	//add virtual fields
	toJSON: {virtuals: true},
	toObject: {virtuals: true}
});

// create virtual fields
tourSchema.virtual('durationInWeek').get(function () {
	return this.duration / 7;
});

tourSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'tour',
	localField: '_id'
});

// Create middleware
// Only work in create() and save() not update()
// tourSchema.pre('save', function (next) {
// 	if (!this.isModified()) return next();
// 	this.updatedAt = Date.now();
// 	next();
// });

tourSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

tourSchema.pre('save', function (next) {
	console.log(`document "${this.name}" is ready to save...`);
	next();
});

// tourSchema.pre(/update|Update/, function (next) {
// 	const isModified = this.getUpdate().$set;
// 	if (!isModified) next();
// 	isModified.updateAt = Date.now();
// 	next();
// });

// use populate to fill the guides field
tourSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'guides',
		select: '-__v'
	});
	next();
});

// relate user as embedded document
// tourSchema.pre('save', async function (next) {
// 	const guidePromises = this.guides.map(async (id) => {
// 		await UserModel.findById(id);
// 	});
// 	this.guides = Promise.all(guidePromises);
// 	next();
// });

tourSchema.post('save', function (doc, next) {
	console.log(`document "${doc.name}" is saved...`);
	next();
});

// Read middleware (including readAndUpdate, readAndDelete)
tourSchema.pre(/^find/, function (next) {
	this.find({secret: { $ne: true} });
	this.start = Date.now();
	next();
});

tourSchema.post(/^find/, function (docs, next) {
	console.log(`execution time: ${Date.now() - this.start} ms`);
	next();
});

// Aggregation middleware
tourSchema.pre('aggregate', function (next) {
	this.pipeline().unshift({$match: {secret: {$ne: true} }});
	next();
});

const TourModel = new mongoose.model('Tour', tourSchema);
module.exports = TourModel;
