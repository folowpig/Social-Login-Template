var neo4j = require('neo4j-driver').v1;
var morgan = require('morgan');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var router = express.Router();
var _ = require('lodash');

const showRouter = require('./routes/movieRouter');
const searchRouter = require('./routes/movieSearch');
const descriptionRouter = require('./routes/movieDescription');
// const sqlRouter = require('./routes/sqlconnect');


const hostname = 'localhost';
var app = express();


//view Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ exteneded : false}));
app.use(express.static(path.join(__dirname, 'public')));


//Show Movies Router
app.use(showRouter)

//Search Movies Router
app.use(searchRouter)

//Descript Movie Router
app.use(descriptionRouter)

//SQL Router
// app.use(sqlRouter);


app.listen(3000);
app.use('/', router);
module.exports = app;
