// ./app/movieSearch.js
var neo4j = require('neo4j-driver').v1;
var morgan = require('morgan');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var router = express.Router();
var _ = require('lodash');

var app = express();

const searchRouter = express.Router();

searchRouter.use(bodyParser.json()); 

searchRouter.route('/')


//view Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ exteneded : false}));
app.use(express.static(path.join(__dirname, 'public')));

//connect Neo4j with node.js
var driver = neo4j.driver('bolt://127.0.0.1:7687', neo4j.auth.basic('neo4j', '12345'));
var session = driver.session();


searchRouter.post('/movies/search', (req, res) =>{
    var paramName = req.body.searchMovie;
    session
    
    .run("MATCH (n:Movie) WHERE n.title =~ {title} return n ", 
     {title: '(?i).*' + paramName + '.*'})
    
    .then(function(result){
    
    var movieArr = [];
     result.records.forEach(function(record){
        movieArr.push({
          id:record._fields[0].identity.low,        
          released: record._fields[0].properties.released,
          tagline: record._fields[0].properties.tagline,
          title: record._fields[0].properties.title
        });
    });     
    res.render('search', {
        moviesearch: movieArr
    }); 
  })
  .catch(function(err){
    console.log(err)
    });
}); 
module.exports = searchRouter;
