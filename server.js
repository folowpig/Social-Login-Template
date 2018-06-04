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

      DBconfig = require('./config/database.js'),
      port = 3000,
      hostname = 'localhost';

//DB configuration
mongoose.connect(DBconfig.url); //connect to the mongoDB
require('./config/passport.js')(passport);  //passport configuration

//Express application setup
serverApp.use(morgan('dev'));
serverApp.use(cookieParser());
serverApp.use(bodyParser());

//Set view engine to ejs
serverApp.set('view engine','ejs');

//Required elements for passport module
serverApp.use(session({secret: 'ilovescotchscotchyscotchscotch'}));
serverApp.use(passport.initialize());
serverApp.use(passport.session());
serverApp.use(flash());

//Routes
require('./app/routes.js')(serverApp, passport);

const server = http.createServer(serverApp);
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});
//serverApp.use('/', router);
module.exports = serverApp;
