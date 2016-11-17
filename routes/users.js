const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

// Register
router.get('/register', (req, res) => {
	res.render('register');
});

// Login
router.get('/login', (req, res) => {
	res.render('login');
});

// Profile
router.get('/profile', (req, res) => {
	res.render('profile', {user: req.user});
});


//findfriend
router.get('/findfriend', (req, res) => {
	res.render('findfriend');
});

router.get('/friendlist', (req, res) => {
	res.render('friendlist', {list: req.user.friends} );
});


//add friendSchema
router.post('/findfriend', (req, res) => {
	console.log("Dette er bruker: " + req.user.name);
	let thisUser = req.user.name;
	let friend = req.body.friend;

	req.checkBody('friend', 'Name is required').notEmpty();

	User.getUserByUsername(friend, (err, user) => {
		if(err) throw err;

		if(user != null){
			User.addFriend(thisUser, user.username);
		}

	});
	res.redirect('/');
});


// Register User
router.post('/register', (req, res) => {
	let name = req.body.name;
	let email = req.body.email;
	let username = req.body.username;
	let phone = req.body.phone;
	let password = req.body.password;
	let password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('phone', 'Phone is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	let errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		let newUser = new User({
			name: name,
			email:email,
			username: username,
			phone: phone,
			password: password
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');

		res.redirect('/users/login');
	}
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

module.exports = router;
