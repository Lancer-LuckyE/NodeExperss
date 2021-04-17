class APIFeatures {
	constructor(query, requestQuery) {
		this.query = query;
		this.requestQuery = requestQuery;
	}

	filter() {
		// 1A) filter
		// create a hard copy of the req query
		const queryObj = {...this.requestQuery};
		// exclude page, limit, sort, fields
		const excludedFields = ['sort', 'limit', 'page', 'fields'];
		excludedFields.forEach( el => {
			delete queryObj[el];
		});

		// 1B) filter
		// regex to add $ before gte, gt, lte, lt
		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(/\bgte|gt|lte|lt\b/g, match => {return `$${match}`});
		// get the searching results
		this.query = this.query.find(JSON.parse(queryStr));
		return this;
	}

	sort() {
		// 2) sorting
		if(this.requestQuery.sort) {
			const sortBy = this.requestQuery.sort.split(',').join(' ');
			this.query = this.query.sort(sortBy);
		} else {
			this.query = this.query.sort('-createdAt');
		}
		return this;
	}

	limitFields() {
		// 3) limiting response fields
		if(this.requestQuery.fields) {
			const fields = this.requestQuery.fields.split(',').join(' ');
			this.query = this.query.select(fields);
		} else {
			this.query = this.query.select('-__v');
		}
		return this;
	}

	pagination() {
		//4) pagination
		const limit = this.requestQuery.limit * 1 || 100;
		const page = this.requestQuery.page * 1 || 1;
		const skip = (page - 1) * limit;
		this.query = this.query.skip(skip).limit(limit);
		// if (this.requestQuery.page) {
		// 	const numOfResults = await TourModel.countDocuments();
		// 	if (skip >= numOfResults) {
		// 		// TODO: error msg is not showing on client side
		// 		throw new Error("Page does not exist...");
		// 	}
		// }
		return this;
	}
}

module.exports = APIFeatures;
