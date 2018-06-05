// ./server.js
//Required modules
const express = require('express'),
      serverApp = express(),
      mongoose = require('mongoose'),
      passport = require('passport'),
      flash = require('connect-flash'),
      morgan = require('morgan'),
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser'),
      session = require('express-session'),
      http = require('http'),
      neo4j = require('neo4j-driver').v1,
      path = require('path'),
      _ = require('lodash'),

      DBconfig = require('./config/database.js'),
      port = 3000,
      hostname = 'localhost';
var router = express.Router();

const searchRouter = require('./app/movieSearch');
const descriptionRouter = require('./app/movieDescription');

//DB configuration
mongoose.connect(DBconfig.url); //connect to the mongoDB
require('./config/passport.js')(passport);  //passport configuration

//Neo4j configuration
var driver = neo4j.driver('bolt://127.0.0.1:7687', neo4j.auth.basic('neo4j', '12345'));
var neo_session = driver.session();


//Express application setup
serverApp.use(morgan('dev'));
serverApp.use(cookieParser());
serverApp.use(bodyParser());
serverApp.use(bodyParser.urlencoded({extended : false}));

//Set view engine to ejs
serverApp.set('view engine','ejs');

//Required elements for passport module
serverApp.use(session({secret: 'ilovescotchscotchy'}));
serverApp.use(passport.initialize());
serverApp.use(passport.session());
serverApp.use(flash());

//Routes
require('./app/routes.js')(serverApp, passport);
serverApp.use(searchRouter);
serverApp.use(descriptionRouter);

const server = http.createServer(serverApp);
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});
//serverApp.use('/', router);
module.exports = serverApp;
