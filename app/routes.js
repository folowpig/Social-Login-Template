// ./app/routes.js
module.exports = function(serverApp, passport) {
    //Neo4j Configuration
    var neo4j = require('neo4j-driver').v1;
    var driver = neo4j.driver('bolt://127.0.0.1:7687', neo4j.auth.basic('neo4j', '12345'));
    var neo_session = driver.session();

    // Home Page
    serverApp.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // Login Page
    // show the login form
    serverApp.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    serverApp.post('/login', passport.authenticate('local-login', {
        successRedirect : '/movies',    //if succeed, redirect to profile page
        failureRedirect : '/login',    //if not, redirect to signup page
        failureFlash : true
    }));


    // Signup Page
    // show the signup form
    serverApp.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    serverApp.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile',    //if succeed, redirect to profile page
        failureRedirect : '/signup',    //if not, redirect to signup page
        failureFlash : true
    }));


    // Main page to show after login
    serverApp.get('/movies', isLoggedIn, function(req, res) {
        neo_session
        .run('MATCH(n:Movie) RETURN n ')
        .then(function(result){
            var movieArr = [];

            result.records.forEach(function(record){
                movieArr.push({
                    id: record._fields[0].identity.low,
                    title: record._fields[0].properties.title,
                    tagline: record._fields[0].properties.tagline
                });
            });     
            res.render('main', {
                movies: movieArr
            });
        })
        .catch(function(err){
        console.log(err)
        });
    });

    //Show user profile page with login information
    serverApp.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // Logout page 
    serverApp.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // Google Social Login
    serverApp.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}));

    // Google Social Login callback
    serverApp.get('/auth/google/callback', passport.authenticate('google', {
        successRedirect : '/movies',
        failureRedirect : '/'
    }));


    //Connect local account
    serverApp.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', {message : req.flash ('loginMessage')});
    });

    serverApp.post('/connect/local', passport.authorize('local-signup', {
        successRedirect : '/profile',
        failureRedirect : '/connect/local',
        failureFlash : true
    }));

    //Unlink Local account
    serverApp.get('/unlink/local', function(req, res) {
        const user = req.user;
        user.local.email = undefined;
        user.local.password = undefined;

        user.save(function (err) {
            res.redirect('/profile');
        });
    });

    //Connect Google account
    serverApp.get('/connect/google', passport.authorize('google', {scope : ['profile','email']}));
    
    serverApp.get('/connect/google/callback', passport.authorize('google', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));

    //Unlink Google account
    serverApp.get('/unlink/google', function(req, res) {
        const user = req.user;
        user.google.token = undefined;

        user.save(function (err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}