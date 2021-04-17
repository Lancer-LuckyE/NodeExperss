// The env file has to be configured before the app.
const env = require("dotenv");
const mongoose = require("mongoose");

//.env configuration
env.config({path:"./.env"});

// unhandle errors handler
process.on('unhandledRejection', err =>{
  console.error('unhandledRejection error: ', err.name, err.message);
  process.exit(1)
});
process.on('uncaughtException', err =>{
  console.error('uncaught exception: ', err.name, err.message);
  process.exit(1);
});

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
  console.log('###########################################');
  console.log('db connected...');
});

const app = require("./app");
//app running
const port = process.env.EXPRESS_PROT || 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});
