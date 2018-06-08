// ./app/personSearch.js
var neo4j = require('neo4j-driver').v1;
var morgan = require('morgan');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var router = express.Router();
var _ = require('lodash');


const hostname = 'localhost';
var app = express();

//construct Decription Router 
const descriptionPersonRouter = express.Router();
descriptionPersonRouter.use(bodyParser.json()); 
descriptionPersonRouter.route('/')



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

descriptionPersonRouter.post('/movies/search/description/person', (req, res) =>{
    
    var paramName2 = req.body.searchPerson;
    

    session
   
    .run("MATCH (p:Person{name:{name}}) -->  (n:Movie)\
     return p.name, n.title, n.tagline, n.released",{name: paramName2})

    .then(function(result){

        var personN = result.records[0];
        var singleN = personN.get(0)
        var movieArr2 = [];
        
         result.records.forEach(function(record){
          
            movieArr2.push({
               
                title: record._fields[1],
                tagline: record._fields[2],
                released: record._fields[3]
              
            });
        });     
        res.render('person', {
            personDescription: movieArr2,
            personNN: singleN
        }); 
    })
  .catch(function(err){
      console.log(err)
      });
  }) 
  
module.exports = descriptionPersonRouter;
