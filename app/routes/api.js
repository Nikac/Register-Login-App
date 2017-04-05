var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'harrypotter';
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

module.exports = function(router) {

	var options = {
	  auth: {
	    api_user: 'Nikac',
	    api_key: 'nikola99'
	  }
	}

	var client = nodemailer.createTransport(sgTransport(options));

	

	// user registration route
	// http:localhost:3000/api/users
	router.post('/users', function(req, res) {
		var user = new User();
		user.name = req.body.name;
		user.username = req.body.username;
		user.password = req.body.password;
		user.email = req.body.email;
		user.temporaryToken = jwt.sign({ username: user.username, email: user.email}, secret, { expiresIn: '24h' });
		
		// fill in all fields
		if(req.body.username == '' || req.body.username == null || req.body.password == '' || req.body.password == null || req.body.username == '' || req.body.username == null || req.body.name == '' || req.body.name == null) {
			res.json({ success: false, message : 'Ensure name, username, password or email.'});
		} else {
			// cant save twice same user
			user.save(function(err) {
				if(err) {
					if (err.errors != null ) {
						if (err.errors.name) {
							res.json({ success: false, message: err.errors.name.message});
						} else if (err.errors.username) {
							res.json({ success: false, message: err.errors.username.message});
						} else if (err.errors.password) {
							res.json({ success: false, message: err.errors.password.message});
						}  else if (err.errors.email) {
							res.json({ success: false, message: err.errors.email.message});
						} else {
							res.json({ success: false, message: err });
						}
					} else if (err){
							if (err.code == 11000) {
								res.json({ success: false, message: 'Username or email alredy taken.' });
							} else {
								res.json({ success: false, message: err });
							}
						}
				} else {
					// sending email
					var email = {
					  from: 'Localhost awesome@bar.com',
					  to: user.email ,
					  subject: 'Localhost Activattion link ', 
					  text: 'Hello ' + user.name + 'Please click on the link for activate your account. Link: http://localhost:3000/activate/' + user.temporaryToken ,
					  html: '<b>Hello world</b>, '+ user.name + 'Please click on the link for activate your account. Link: <a href="http://localhost:3000/activate/' + user.temporaryToken + '">http://localhost:3000/activate/</a>' 
					};

					client.sendMail(email, function(err, info){
					    if (err ){
					      console.log(err);
					    }
					    else {
					      console.log('Message sent: ' + info.response);
					    }
					});

					res.json({ success: true, message: 'Account activated. Please check your email for activation link.'});
				}
			});
		}		
	});

	// http://localhost:3000/api/checkusername
	router.post('/checkusername', function(req, res) {
		User.findOne({ username: req.body.username }).select('username').exec(function(err, user) {
			if (err)  throw err;

			if (user) {
				res.json({ success: false, message: 'The username is already taken.' });
			} else {
				res.json({ success: true, message: 'Username valid.'})
			}	
		
		});		
	});

	// http://localhost:3000/api/checkemail
	router.post('/checkemail', function(req, res) {
		User.findOne({ email: req.body.email }).select('email').exec(function(err, user) {
			if (err)  throw err;

			if (user) {
				res.json({ success: false, message: 'The email is already taken.' });
			} else {
				res.json({ success: true, message: 'E-mail valid.'})
			}	
		
		});		
	});

	// user login route
	// http://localhost:3000/api/authenticate
	router.post('/authenticate', function(req, res) {
		User.findOne({ username: req.body.username }).select('username password email active').exec(function(err, user) {
			if (err)  throw err;

			if (!user) {
				res.json({ success: false, message: 'Could not authenticate user' });
			} else if (user) {
				var validPassword = user.comparePassword(req.body.password);
				if (!validPassword) {
					res.json({ success: false, message: 'Could not authenticate the password'});
				} else if (!user.active) { 
					res.json({ success: false, message: 'Please check your e-mail for activation link', expired : true });
				}else {
					var token = jwt.sign({ username: user.username, email: user.email}, secret, { expiresIn: '24h' });
					res.json({ success: true, message: 'User authenticated', token : token});
				}
			}			
		});		
	});

	// http:localhost:3000/resend
	router.post('/resend', function(req, res) {
		User.findOne({ username: req.body.username }).select('username password active').exec(function(err, user) {
			if (err)  throw err;

			if (!user) {
				res.json({ success: false, message: 'Could not authenticate user' });
			} else if (user) {
				var validPassword = user.comparePassword(req.body.password);
				if (!validPassword) {
					res.json({ success: false, message: 'Could not authenticate the password'});
				} else if (user.active) { 
					res.json({ success: true, message: 'Account has been activated!' });
				}else {
	
					res.json({ success: true, user: user});
				}
			}
		});		
	});

	// http://localhost:3000/api/resend
	router.put('/resend', function(req, res) {
		User.findOne({ username: req.body.username }).select('username name email temporaryToken').exec(function(err, user) {
			if (err) throw err;

			user.temporaryToken = jwt.sign({ username: user.username, email: user.email}, secret, { expiresIn: '24h' });
			user.save(function(err) {
				if (err) {
					console.log(err);
				} else {
					var email = {
					  from: 'Localhost awesome@bar.com',
					  to: user.email ,
					  subject: 'Localhost Activattion link request', 
					  text: 'Hello ' + user.name + 'You recently requested new link for account. Please click on the link for activate your account. Link: http://localhost:3000/activate/' + user.temporaryToken ,
					  html: '<b>Hello world</b>, '+ user.name + 'You recently requested new link for account. Please click on the link for activate your account. Link: <a href="http://localhost:3000/activate/' + user.temporaryToken + '">http://localhost:3000/activate/</a>' 
					};

					client.sendMail(email, function(err, info){
					    if (err ){
					      console.log(error);
					    }
					    else {
					      console.log('Message sent: ' + info.response);
					    }
					});
					res.json({ success: true, message: 'Activation link has been sent to ' + user.email });
				}
			})
		});
	});

	// http://localhost:3000/activate/:token
	router.put('/activate/:token', function(req, res) {
		User.findOne({ temporaryToken: req.params.token }, function(err, user) {
			if (err) throw err;
			var token = req.params.token;

			jwt.verify(token, secret, function(err, decoded) {
				  
				if (err) {
					res.json({ success: false, message: 'Activation link has expired.'});
				} else if (!user) {
					res.json({ success: false, message: 'Activation link has expired.'});
				} else {
					user.active = true;
					user.temporaryToken = false;
					user.save(function(err) {
						if (err) {
							console.log(err);
						} else {
							var email = {
							  from: 'Localhost awesome@bar.com',
							  to: user.email ,
							  subject: 'Account activated ',
							  text: 'Hello ' + user.name + 'Your account has been activated' ,
							  html: '<b>Hello world</b>, '+ user.name + ' Your account has been activated'
							};

							client.sendMail(email, function(err, info){
							    if (err ){
							      console.log(error);
							    }
							    else {
							      console.log('Message sent: ' + info.response);
							    }
							});
							res.json({ success: true, message: 'Account activated!' });
						}
					})
				}	  
			});
			
		});		
	});

	router.get('/resetusername/:email', function(req, res) {
		User.findOne({ email: req.params.email }).select('username active email resettoken name').exec(function(err, user) {
				if (err) {
					res.json({ success: false, message: err });
				} else {
					if (!req.params.email) {
						res.json({ success: false, message: 'No e-mail was provided.' });
					} else {
					if (!user) {
						res.json({ success: false, message: 'E-mail was not found.' });
					} else {
						var email = {
						  from: 'Localhost awesome@bar.com',
						  to: user.email ,
						  subject: 'Localhost username request ',
						  text: 'Hello ' + user.name + 'You recently tequest your username. Please save it in your files: '+ user.username ,
						  html: '<b>Hello world</b>, '+ user.name + '<br/> You recently tequest your username. Please save it in your files: '+ user.username
						};

						client.sendMail(email, function(err, info){
						    if (err ){
						      console.log(error);
						    }
						    else {
						      console.log('Message sent: ' + info.response);
						    }
						});

						res.json({ success: true, message: 'Username has been sent to e-mail.' })
					}
				}
			};
		});
	});


	router.put('/resetpassword', function(req, res) {
		User.findOne({ username: req.body.username }).select('username active email resettoken name').exec(function(err, user) {
			if (err) throw err;
			if(!user) {
				res.json({ success: false, message: 'Username was not found!' });
			} else if (!user.active) {
				res.json({ success: false, message: 'Account has not been activated.'});
			} else {
				user.resettoken = jwt.sign({ username: user.username, email: user.email}, secret, { expiresIn: '24h' });
				user.save(function(err) {
					if (err) {
						res.json({ success: false, message: err });
					} else {
						var email = {
						  from: 'Localhost awesome@bar.com',
						  to: user.email ,
						  subject: 'Localhost password request ',
						  text: 'Hello ' + user.name + 'You recently request your password. Please click on the folowing link: http://localhost:3000/reset/'+ user.resettoken ,
						  html: '<b>Hello world</b>, '+ user.name + '<br/> You recently request your password. Please click on the following link: <a href="http://localhost:3000/reset/'+ user.resettoken + '">http://localhost:3000/newpassword</a>'
						};

						client.sendMail(email, function(err, info){
						    if (err ){
						      console.log(error);
						    }
						    else {
						      console.log('Message sent: ' + info.response);
						    }
						});
						res.json({ success: true, message: 'Please check your e-mail for reset password' });
					}
				});
			}
		});
	});


	router.get('/resetpassword/:token', function(req, res) {
		User.findOne({ resettoken: req.params.token }).select().exec(function(err, user) {
			if (err) throw err;
			var token = req.params.token;

			jwt.verify(token, secret, function(err, decoded) {
				  if (err) {
				  	res.json({ success: false, message: 'Pasword link has expired.'});
				  } else{
				  	if (!user) {
				  	 	res.json({ success: false, message: 'Password link has expired.' });
				  	} else {
				  		res.json({ success: true, user: user });
				  	}
				  }			  
			});		
		})
	});

	router.put('/savepassword', function(req, res) {
		User.findOne({ username: req.body.username }).select('name username password resettoken email').exec(function(err, user) {
			if (err) throw err;
			if (req.body.password == null || req.body.password == '') {
				res.json({ success: false, message: 'Password has no provided!'})
			} else {
				user.password = req.body.password;
				user.resettoken = false;
				user.save(function(err) {
					if (err) {
						res.json({ success: false, message: err})
					} else {
						var email = {
						  from: 'Localhost awesome@bar.com',
						  to: user.email ,
						  subject: 'Localhost password request ',
						  text: 'Hello ' + user.name + 'This e-mail is to notify you that your password was recently reset at localhost.com',
						  html: '<b>Hello world</b>, '+ user.name + '<br/> This e-mail is to notify you that your password was recently reset at localhost.com'
						};

						client.sendMail(email, function(err, info){
						    if (err ){
						      console.log(error);
						    }
						    else {
						      console.log('Message sent: ' + info.response);
						    }
						});

						res.json({ success: true, message: 'Password has been reset!'})
					}
				});
			}
		});
	});


	// middleware for token
	router.use(function(req, res, next) {
		var token = req.body.token || req.body.query || req.headers['x-access-token'];

		if (token) {
			jwt.verify(token, secret, function(err, decoded) {
				  if (err) {
				  	 return err;
				  } else{
				  	 req.decoded = decoded;
				  	 next();
				  }			  
			});			
		} else {
			res.json({ success: false, message: 'No token provided'});
		}
	});

	// http://loaclhost:3000/api/me
	router.post('/me', function(req, res) {
		res.send(req.decoded);
	});

	return router;
};