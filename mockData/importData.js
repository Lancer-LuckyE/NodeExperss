const env = require("dotenv");
const mongoose = require("mongoose");
const fs = require("fs");
const TourModel = require("./../models/TourModel");

//.env configuration
env.config({path:"./.env"});


//db connection
const db = process.env.DB.replace(
	'<DB_PASSWORD>', process.env.DB_PASSWORD).replace(
	'<DB_NAME>', process.env.DB_NAME);
//mongos.connect returns a promise of db connection
mongoose.connect(db,{
	useCreateIndex:true,
	useNewUrlParser:true,
	useFindAndModify:false
}).then(conn => {
	// console.log(conn.connections);
	console.log('db connected...');
});


//import data
const importData = async (fileName) => {
	try {
		const toursData = JSON.parse(fs.readFileSync(`${__dirname}/${fileName}`, "utf-8"));
		const tours = await TourModel.create(toursData);
		console.log(tours);
		console.log("Dev data are imported...");
	} catch (err) {
		console.error(err);
	} finally {
		process.exit();
	}
};


//delete data
const deleteData = async () => {
	try {
		await TourModel.deleteMany();
		console.log("All data are deleted...");
	} catch (err) {
		console.error(err);
	} finally {
		process.exit();
	}
};


//run node command
if (process.argv.length < 3) {
	console.error("please try again and specify your operation...");
	process.exit();
}
if (process.argv[2] === "--import") {
	if (process.argv.length !== 4) {
		console.error("please try again and specify your operation...");
		process.exit();
	}
	importData(process.argv[3]);
} else if (process.argv[2] === "--delete") {
	if (process.argv.length !== 3) {
		console.error("please try again and specify your operation...");
		process.exit();
	}
	deleteData();
}
console.log(process.argv);
