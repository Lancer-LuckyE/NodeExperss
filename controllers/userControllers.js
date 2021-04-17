const crypto = require('crypto');
const factory = require('./utils/factory');
const appError = require('./../utils/appError');
const UserModel = require('./../models/UserModel');
const catchAsync = require('../utils/catchAsync');
const apiFeatures = require('./../utils/apiFeatures');

const reqFilter = (body, ...fields) => {
  const filteredBody = {};
  Object.keys(body).forEach(key => {
    if (fields.includes(key)) {
      filteredBody[key] = body[key];
    }
  });
  return filteredBody;
};

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const features = new apiFeatures(UserModel.find(), req.query).filter().sort().limitFields().pagination();
//   //execute the query
//   const users = await features.query;
//   res.status(200).json({
//     status: "success",
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// });

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    msg: "Function is not implemented yet.",
  });
};

// exports.getSingleUser = (req, res) => {
//   res.status(500).json({
//     status: "error",
//     msg: "Function is not implemented yet.",
//   });
// };

// updateMe
// exports.updateUser = catchAsync( async (req, res, next) => {
//   // check if password is in the body
//   if(req.body.password) return next(new appError(400, 'Please use /update-password to update password...'));
//   // check if other fixed or limited access information are in the body
//   const user = await UserModel.findOne({_id: req.params.id});
//   if (!user) return next(new appError(404, 'User does not exist...'));
//   let filteredBody;
//   if (user.role === 'admin') {
//     filteredBody = req.body;
//   } else {
//     filteredBody = reqFilter(req.body, 'name', 'email', 'avatar');
//   }
//   // TODO: send email to old email to inform the user, send email to the new email to validate the new email
//   // use updateOne to update user
//   // const updatedUser = await UserModel.findByIdAndUpdate({_id: req.params.id}, filteredBody, {
//   //   runValidators: true
//   // });
//   user.set(filteredBody);
//   const updatedUser = await user.save();
//   res.status(200).json({
//     status: 'success',
//     data: {
//       data: updatedUser
//     }
//   });
// });

exports.updatePassword = catchAsync( async (req, res, next) => {
  const {oldPassword, newPassword} = req.body;
  if (!oldPassword || !newPassword) {
    return next(new appError(400, 'Required data missing...'));
  }
  const currentUser = await UserModel.findById(req.user._id).select('+password');
  // verify password
  if (!await currentUser.validatePassword(oldPassword, currentUser.password)){
    return next(new appError(401, 'Current password is incorrect, please try again or forget password...'));
  }
  // update password
  currentUser.set({
    password: newPassword
  });
  const data = await currentUser.save();
  res.status(200).json({
    status: "success",
    data: {
      id: data._id,
      passwordUpdatedAt:data.passwordUpdatedAt
    }
  });
});

exports.deactivateUser = catchAsync(async (req, res, next) => {
  const user = await UserModel.findById(req.user.id).select('+active');
  if (!user) return next(new appError(404, 'User does not exist...'));
  user.set({active: false});
  const data = await user.save();
  res.status(204).json({
    status: 'success',
    data
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  if (!req.body.newPassword) return next(new appError(400, 'Password is missing...'));
  const hashedToken = crypto.createHash('sha256').update(req.params.tempToken).digest('hex');
  const user = await UserModel.findOne({
    tempToken: hashedToken,
    tempTokenExp: {$gt: Date.now()}
  }).select('+password');

  if (!user) return next(new appError(400, 'Invalid token or your token has been expired...'));

  user.set({
    password: req.body.newPassword,
    tempToken: undefined,
    tempTokenExp: undefined
  });
  const data = await user.save({timestamps: true});
  res.status(200).json({
    status: "success",
    data: {
      id: data._id,
      passwordUpdatedAt:data.passwordUpdatedAt
    }
  });
});

exports.filterPassword = (req, res, next) => {
  if(req.body.password) {
    return next(new appError(400, 'Please use /update-password to update password...'));
  } else {
    next();
  }
};

exports.getAllUsers = factory.getAll(UserModel);
exports.getSingleUser = factory.getOne(UserModel);
exports.updateMe = factory.updateOne(UserModel);
exports.deleteUser = factory.deleteOne(UserModel);
