// ./config/passport.js

// Load local, facebook, and google authentication strategies

var localSt = require('passport-local').Strategy;
var googleSt = require('passport-google-oauth').OAuth2Strategy;

// Load user model
var Users = require('../app/models/users');

// load the auth variables
var auth = require('./auth');

module.exports = function(passport) {
    //serialize the user
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    //deserialize the user
    passport.deserializeUser(function(id, done) {
        Users.findById(id, function(err, user) {
            done(err, user);
        });
    });

    //Passport uses username and password as default
    //In this case, username is overridden by email

    passport.use('local-signup', new localSt ({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    
    function(req, email, password, done) {
        process.nextTick(function () {
            if (!req.user) {
                //Check if the user who is trying to login exist on the db
                Users.findOne({ 'local.email' : email}, function(err, user) {
                    if (err) { return done(err);}

                    //Check if there is a user with the same email
                    if (user) {
                        return done(null, false, req.flash('signupMessage','This email is already taken by someone.'));
                    } else { //if there is no user with the same email
                        const newUser = new Users();

                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);

                        newUser.save (function(err) {
                            if(err) { throw err;}
                            return done(null, newUser);
                        });
                    }
                });
            } else {
                const user = req.user;

                user.local.email = email;
                user.local.password = user.generateHash(password);

                user.save (function (err) {
                    if (err) { throw err; }
                    return done (null, user);
                });
            }
        });
    }));

    passport.use('local-login', new localSt({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },

    function(req, email, password, done) {
        Users.findOne({'local.email' : email}, function(err, user){
            if(err) {return done(err);}     //if there is any error return

            if(!user) {return done(null, false, req.flash('loginMessage', 'No users are found'));}

            if(!user.validPassword(password)) {return done(null, false, req.flash('loginMessage', 'Wrong password is entered'));}

            return done(null, user);
        });
    }));

    //Google social login

    passport.use(new googleSt( {
        clientID: auth.googleAuth.clientID,
        clientSecret: auth.googleAuth.clientSecret,
        callbackURL: auth.googleAuth.callbackURL,
        passReqToCallback: true
    },

    function(req, token, refreshToken, profile, done) {
        process.nextTick(function() {
            //check if the user is already loggin in
            if (!req.user) {
                Users.findOne({'google.id': profile.id}, function(err, user) {
                    if(err) {return doen(err);}

                    if(user) {
                        // if the account was linked at one point and removed, save its token, name and email only.
                        if (!user.google.token) {
                            user.google.token = token;
                            user.google.name = profile.displayName;
                            user.google.email = profile.emails[0].value;

                            user.save(function(err) {
                                if (err) { throw err; }
                                return done (null, user);
                            });
                        }
                        return done(null, user);
                    } else {
                        const newUser = new Users();

                        newUser.google.id = profile.id;
                        newUser.google.token = token;
                        newUser.google.name = profile.displayName;
                        newUser.google.email = profile.emails[0].value;

                        newUser.save(function(err) {
                            if (err) { throw err; }
                            return done(null, newUser);
                        });
                    }
                });
            } else {
                const user = req.user;

                user.google.id = profile.id;
                user.google.token = token;
                user.google.name = profile.displayName;
                user.google.email = profile.emails[0].value;

                user.save(function(err) {
                    if (err) { throw err; }
                    return done (null, user);
                });
            }
        });
    }));
};