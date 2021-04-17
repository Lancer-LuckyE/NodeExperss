// create a middleware for specific url param
// export to router
// the actual param value is in the val, so don't use the param name.
// to interupt the controller response, the middleware needs the return the response header.
// exports.checkId = (req, res, next, val) => {
//   const tour = findTour(val);
//   if (!tour) {
//     return res.status(404).json({
//       status: "failed",
//       msg: "Invalid id",
//     });
//   }
//   console.log('check id middleware');
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body || !req.body.name || req.body.price) {
//     return res.status(400).json({
//       status: "failed",
//       msg: "Invalid form data",
//     });
//   }
//   console.log('check body middleware');
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
	req.query.limit = 5;
	req.query.sort = "-ratingsAverage,price";
	req.query.fields = "name,price,difficulty,ratingsAverage,summary,description";
	next();
};
