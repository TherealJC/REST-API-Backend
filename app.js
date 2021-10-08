// * Run the app with 'nodemon app.js' for live updates, or node app.js (will have to be reset if changes are made)
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const createError = require('http-errors');
require('./ServerSide/configs/redis.config'); // import redis client config
require('dotenv').config(); // allow acces to environment variables

// * Use mongoose.config file to initialize the apps connection to the database
require("./ServerSide/configs/mongoose.config");

// * Initiate the express app
const app = express();
app.use(morgan('dev')); // Logs requests in the console

// * Parse the JSON data from the body and attach it to the req/res so that we can use it.
app.use(bodyParser.json());

// * Initialize Routes
// any request using '/admin' (eg: localhost:4000/admin/'whatever'), then use the router module located at requested file (for route handling).
app.use('/admin', require('./ServerSide/routes/admin.routes')); // Admin routes
app.use('/customer', require('./ServerSide/routes/customer.routes')); //Customer routes

// * Views setup
// Set the apps template engine to pug (express loads the module internally).
app.set('view engine', 'pug');

// Set the default views environment var to = the directory name provided (add location of dir to views directory). Will get failed to lookup error without this
app.set('views', __dirname);

// Requests to the default website path will respond with the index.pug file with these set values (title, message)
app.get('/', function (req, res) { // on the default path e.g localhost:4000/
  res.render('./ServerSide/views/index', { title: 'Welcome', message: 'This is from pug!' })
});

// * Error handling
app.use(async (req, res, next) => { // Respond to incorrect routes/paths that don't exist with error.
  next(createError.NotFound())
});

app.use((err, req, res, next) => { // Catch all error handler
  res.status(err.status || 500) // Use status code coming from error, if not present, use generic error code
  res.send({
    error: {
      status: err.status || 500,
      message: err.message, 
    },
  })
});

// * Start the server 
//Will listen for a specific port from a hosting service (environment var) OR Make the app listen for requests on the requested port, then perform function.
app.listen(process.env.port || 4000, function(){
  console.log('App listening for requests at localhost:4000'); //Ready to recieve requests
});

// Export the app as a module for use in other files
module.exports = app;