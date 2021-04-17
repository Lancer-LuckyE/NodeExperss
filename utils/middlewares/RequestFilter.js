reqFilter = (...fields) => {
	return (req, res, next) => {
		if (req.user && req.user.role === 'admin') {
			next();
		}
		const filteredBody = {};
		console.log(req.body);
		Object.keys(req.body).forEach(key => {
			if (fields.includes(key)) {
				filteredBody[key] = req.body[key];
			}
		});
		req.body = filteredBody;
		next();
	}
};
module.exports = reqFilter;
