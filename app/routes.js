// ./app/routes.js
module.exports = function(serverApp, passport) {

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
        successRedirect : '/profile',    //if succeed, redirect to profile page
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
        successRedirect : '/profile',
        failureRedirect : '/'
    }));
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}