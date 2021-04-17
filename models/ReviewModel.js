const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
	review: {
		type: String,
		require: [true, 'Review is empty...'],
		trim: true
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		require: [true, 'User id is empty...']
	},
	tour: {
		type: mongoose.Schema.ObjectId,
		ref: 'Tour',
		require: [true, 'Tour id is empty...']
	},
	rating: {
		type: Number,
		require: [true, 'rating is empty...'],
		default: 1.0,
		min: 1.0,
		max: 5.0
	}
}, {
	timestamps: true,
	//add virtual fields
	toJSON: {virtuals: true},
	toObject: {virtuals: true}
});

// reviewSchema.pre('save', function (next) {
// 	if (!this.isModified) next();
// 	this.set('updatedAt', Date.now());
// 	next();
// });

reviewSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'user',
		select: 'name avatar'
	});
	next();
});

const ReviewModel = new mongoose.model('Review', reviewSchema);
module.exports = ReviewModel;
