var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cookiesession = require('cookie-session');
var bodyParser = require('body-parser');
var sql = require('mysql');
var app = express();
var bcrypt = require('bcrypt-nodejs');
var fsExtra = require('fs-extra');
var fs = require('fs');
var multiparty = require('multiparty');
var util = require('util');
var async = require('async');
var router = require('./router.js');
var db = require('./database.js');
// var content = require('./content.js');
var favicon = require('serve-favicon');
var connection = db.getConnection();

function upvote (req, res) {
	if (req.session.user == null || req.session.user == undefined) return;

	var id = req.body.id;
	var query =  "SELECT rated FROM tracks where id=" + id + ";";

	connection.query(query, function (err, result) {
		if (err) throw err;
		result = JSON.parse(result[0]['rated']);
		if (result.indexOf(req.session.user) < 0) {
			result.push(req.session.user);
			result = JSON.stringify(result);
			console.log(result);
			var update = "UPDATE tracks SET rating= rating + 1, rated='" + result + "' WHERE id=" + id + ";";
			console.log(update);
			connection.query(update, function (err, result2) {
				if (err)  throw err;
				return res.send(result2);	
			});
		}
		else {
			return res.send(undefined);
		}
	
	})
}
module.exports.upvote = upvote;


function projUpvote(req, res) {
	var id = req.body.id;
	var query =  "SELECT rated FROM projects where id=" + id + ";";

	connection.query(query, function (err, result) {
		if (err) throw err;
		result = JSON.parse(result[0]['rated']);
		if (result.indexOf(req.session.user) < 0) {
			result.push(req.session.user);
			result = JSON.stringify(result);
			console.log(result);
			var update = "UPDATE projects SET rating= rating + 1, rated='" + result + "' WHERE id=" + id + ";";
			console.log(update);
			connection.query(update, function (err, result2) {
				if (err)  throw err;
				return res.send(result2);	
			});
		}
		else {
			return res.send(undefined);
		}
	
	})
}
module.exports.projUpvote = projUpvote;

function follow(req, res) {
	if (req.session.user == undefined || req.session.user == null) return;
	var id = req.body.id;

	async.parallel([
		function (cb) {
			var query = "SELECT following FROM users WHERE user = '" + req.session.user + "';";
			connection.query(query, function (err, result) {
				if (err) throw err;

				result = result[0].following;
				// console.log(result);
				result = JSON.parse(result);
				// console.log(result);
				if (result.indexOf(id) < 0) {
					result.push(id);
				}
				else {
					result.pop(id);
				}
				// console.log(result);
				result = JSON.stringify(result);
				var newQuery = "UPDATE users SET following='" + result + "' WHERE user='" + req.session.user + "';";
				console.log(newQuery);

				connection.query(newQuery, function(err, result) {
					if (err) res.send(err);

					return cb(err, result);
				}); 
			});

		},
		function (cb) {
			var query = "SELECT followers FROM users WHERE user='" + id + "';";
			connection.query(query, function(err, result) {
				if (err) throw err;

				result = result[0].followers;
				result = JSON.parse(result);

				if (result.indexOf(req.session.user) < 0) {
					result.push(req.session.user);
				}
				else {
					result.pop(req.session.user);
				}

				result = JSON.stringify(result);
				var newQuery = "UPDATE users SET followers='" + result + "' WHERE user='" + id + "';";
				console.log(newQuery);
				connection.query(newQuery, function(err, result) {
					if (err) res.send(err);

					return cb(err, result);
				});
			});
		}
	],
	function (err, result) {
		if (err) throw err;

		res.send(result);
	});

	
}
module.exports.follow = follow;

function loginCheck(req, res) {
	var post = req.body;
	post.username = post.username.toLowerCase();

	console.log("hello");
	var query = "SELECT * FROM users WHERE user='" + post.username + "';";
	console.log(query);

	async.parallel([
		function (cb) {
				
			connection.query(query, function (err, result) {
				console.log("done");

				if (err) {					
					return res.send(err);
				}

				result = result[0];
				if (!result) {
					
					return cb (null, false);
				}
				
				bcrypt.compare(post.password, String(result.hashed_password), function (err, answer) {
					
					return cb (null, answer);
				});
			});
			
		}
		],
		function (err, result) {
			var answer = result[0];
			
			if (answer) {
				req.session.user = post.username;
				console.log("success");
				return res.redirect("/" + post.username + "/feed");
				}
			else {
				return router.route(req, res, "splash", undefined);
			}
		}
	);	
}
module.exports.loginCheck = loginCheck;

function addUser(req, res) {

	var post = req.body;

	if (post.password != post.confirm) {
		res.send("err:" + post.password + " " + post.confirm);
		return;
	}

	var hash_err = false;
	var hash = undefined;
	var query = "";
	async.series([
		function (cb) {

			bcrypt.hash(post.password, null, null, function (err, hashp) {

				hash_err = err;
				hash = hashp;
				console.log(hash_err);
				console.log(hash_err);

				return cb(hash_err, hash);

			});
		},
		function (cb) {
			if (!hash_err) {
				post.first = post.first.charAt(0).toUpperCase() + post.first.slice(1); //CAPITALIZE;
				post.last = post.last.charAt(0).toUpperCase() + post.last.slice(1); //CAPITALIZE;
				post.username = post.username.toLowerCase();
				query = "INSERT INTO users (user, email, first, last, genre, pic, hashed_password, following, followers) " + 
					"VALUES ('" + 
					post.username + "', '" + 
					post.email + "', '" + 
					post.first  +"', '" + 
					post.last + "', '" + 
					post.genre + "', '" +
					"/content/common/download.png" + "', '" +  
					hash + "', '" + 
					"[] " + "', '" +
					"[] " +
					"');";		
				console.log(query);		
			}		
			return cb(hash_err, undefined);
		},
		function (cb) {
			connection.query(query, function (err, result) {
				cb(err, result);

				
			});			
		}
	],
	function (error, result) {
		if (error && error.code == 'ER_DUP_ENTRY') {
			router.route(req, res, "error");
			return;
		}
		else if (error) throw error;

		req.session.user = post.username;

		return res.redirect("/");
	});
}
module.exports.addUser = addUser;