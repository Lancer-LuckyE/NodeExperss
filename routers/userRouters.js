const userControllers = require("../controllers/userControllers");
const authControllers = require("../controllers/authControllers");
const reqFilter = require('./../utils/middlewares/RequestFilter');
const express = require("express");
const router = express.Router();

router
	.route("/signup")
	.post(authControllers.signup);

router
	.route('/login')
	.post(authControllers.login);

router
	.route('/forget-password')
	.post(authControllers.forgetPassword);

router
  .route("/")
  .get(authControllers.protect,
	  userControllers.getAllUsers)
  .post(userControllers.createUser)
	.delete(
		authControllers.protect,
		authControllers.restrictTo('admin'),
		userControllers.deleteUser
	);
router
  .route("/:id")
  .get(authControllers.protect,
	  userControllers.getSingleUser)
  .patch(authControllers.protect,
	  userControllers.filterPassword,
	  reqFilter('name', 'email', 'avatar'),
	  userControllers.updateMe)
  .delete(authControllers.protect,
	  userControllers.deactivateUser);
router
	.route("/:id/update-password")
	.patch(authControllers.protect,
		userControllers.updatePassword);

router
	.route("/reset-password/:tempToken")
	.patch(userControllers.resetPassword);

module.exports = router;
