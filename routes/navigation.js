var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cookiesession = require('cookie-session');
var bodyParser = require('body-parser');
var sql = require('mysql');
var app = express();
var bcrypt = require('bcrypt');
var fsExtra = require('fs-extra');
var fs = require('fs');
var multiparty = require('multiparty');
var util = require('util');
var async = require('async');
var router = require('./router.js');
var db = require('./database.js');
// var content = require('./content.js');
// var user = require('./user.js');
var favicon = require('serve-favicon');
var connection = db.getConnection();

function home(req, res) {
	if (req.session.user) {
		return res.redirect("/" + req.session.user);
	}
	return router.route(req, res, "splash", undefined);
}
module.exports.home = home;

function logout (req, res) {
	req.session.user = undefined;
	return res.redirect("/");
}
module.exports.logout = logout;

function login (req, res) {	
	router.route(req, res, "login", {
										"page": "login"
									}
	);
}
module.exports.login = login;

function getUser (req, res) {

	var usersQuery = "SELECT user,following FROM users WHERE user ='" + req.params.user + "';";
	var myQuery = "SELECT user,following FROM users WHERE user ='" + req.session.user + "';";
	var tracksQuery = "SELECT * FROM tracks WHERE artist='" + req.params.user + "';";
	var userQuery = "SELECT * FROM users;";
	var followQuery = "SELECT following FROM users WHERE user='" + req.params.user + "';";

	async.parallel([
		function (cb) { // 0
			connection.query(usersQuery, function (err, result) {

				if (err) throw err;

				if (result.length == 0) {
					return cb (true, result);
				} 
				else  {
					return cb (null, result);
					console.log(result);
				}

				
			});
		},
		function (cb) { // 1
			connection.query(tracksQuery, function (err, result) {
				if (err) throw err;
				return cb (null, result);

				
			});
		},
		function (cb) { // 2
			connection.query(userQuery, function (err, result) {
				return cb (null, result);
			});
		},
		function (cb) { // 3
			connection.query(myQuery, function (err, result) {
				return cb (null, result);
			});
		},
		function (cb) { // 4
			connection.query(followQuery, function (err, result) {
				if (err) return cb(err, null);
				var following = JSON.parse(result[0].following);
				console.log("following");
				console.log(following.length);
				if (following.length == 0) return cb(null, []);
				
				var followedTracksQuery = "SELECT * FROM tracks WHERE visibility=1 AND 	";
				for (var index in following) {
					console.log(index);
					followedTracksQuery += (index == following.length - 1) ? "artist='" + following[index] + "'" : " artist='" + following + "' OR ";
				}
				followedTracksQuery += " LIMIT 20;";

				console.log(followedTracksQuery);

				connection.query(followedTracksQuery, function (err, result) {
					if (err) throw err;
					return cb(null, result);
				});

			});
		}
	],
	function (err, result) {
		// connection.close();
		if (err) {
			router.route(req, res, "error", undefined);
		}

		var following_var = result[0][0] == undefined ? [] : result[0][0].following;
		var my_following = result[3][0] == undefined ? [] : result[3][0].following;

		return router.route(req, res, "profile", {	
													liUser: req.session.user,
													"mine": (req.session.user && req.session.user == req.params.user),     
													"muser": req.params.user,
													"loggedin": !(req.session.user == undefined),
													"tracks": result[4], 
													"users": result[2], 
													"following": following_var,
													"myFollowing" : my_following,
													"page": "user",
													"account": "hello",
													"dup": req.query.dup
												}
		);
	});
}
module.exports.getUser = getUser;

function discoverTracks(req, res) {
	var query  = 	"SELECT * from tracks LIMIT 50;";
	var aquery = 	"SELECT id, album FROM tracks GROUP BY album;";
	var gquery =  	"SELECT id, genre FROM tracks GROUP BY genre;";
	var pquery = 	"SELECT id, creator, title, rated, rating from projects;"
	
	async.parallel([
		function (cb) {
			connection.query(query, function (err, result) {
				return cb (err, result);
			});
		},
		function (cb) {
			connection.query(aquery, function (err, result) {
				return cb (err, result);
			});
		},
		function (cb) {
			connection.query(gquery, function (err, result) {
				return cb (err, result);
			});
		},
		function (cb) {
			connection.query(pquery, function (err, result) {
				return cb (err, result);
			});
		}
	],
	function (err, result) {
		if (err) throw err;
		console.log("results: " + JSON);
		return router.route(req, res, "discover",	{ 	
														liUser: req.session.user,
														mine: (req.params.user == req.session.user),
														muser: req.params.user,
														"loggedin": (req.session.user != undefined),
														page: "discover",
														tracks: result[0],
														albums: result[1],
														genres: result[2],
														projects: result[3]
													}
		);
	});
}
module.exports.discoverTracks = discoverTracks;

function getTracks(req, res) {
	var query  = 	"SELECT * from tracks where artist='" + req.params.user + "';";
	var aquery = 	"SELECT id, album FROM tracks where artist='" + req.params.user + "' GROUP BY album;";
	var gquery =  	"SELECT id, genre FROM tracks where artist='" + req.params.user + "' GROUP BY genre;";
	
	async.parallel([
		function (cb) {
			connection.query(query, function (err, result) {
				return cb (err, result);
			});
		},
		function (cb) {
			connection.query(aquery, function (err, result) {
				return cb (err, result);
			});
		},
		function (cb) {
			connection.query(gquery, function (err, result) {
				return cb (err, result);
			});
		}
	],
	function (err, result) {
		if (err) throw err;
		console.log("results: " + JSON);
		return router.route(req, res, "tracks",	{ 	
													liUser: req.session.user,
													mine: (req.params.user == req.session.user),
													muser: req.params.user,
													"loggedin": (req.session.user != undefined),
													page: "tracks",
													tracks: result[0],
													albums: result[1],
													genres: result[2]
												}
		);
	});
}
module.exports.getTracks = getTracks;

function getGenre (req, res) {
	var query = "SELECT * FROM tracks WHERE genre='" + req.params.genre + "';";
	console.log(query);
	connection.query(query, function (err, result) {
		if (err) throw err;
		console.log("hello: ");
		return router.route(req, res, "genres", {
													liUser: req.session.user,
													mine: (req.params.user == req.session.user),
													muser: req.params.user,
													"loggedin": (req.session.user != undefined),
													page: "tracks",
													tracks: result,
													genre: req.params.genre
												}
		);
	});
}
module.exports.getGenre = getGenre;

function getAlbum (req, res) {
	var query = "SELECT * FROM tracks WHERE album='" + req.params.album + "';";
	console.log(query);
	connection.query(query, function (err, result) {
		if (err) throw err;
		return router.route(req, res, "albums", {
													liUser: req.session.user,
													mine: (req.params.user == req.session.user),
													muser: req.params.user,
													"loggedin": (req.session.user != undefined),
													page: "tracks",
													tracks: result,
													album: req.params.album
												}
		);
	});
}
module.exports.getAlbum = getAlbum;

function getProjects (req, res) {
	var query ="SELECT * from projects where creator='" + req.params.user + "';";
	connection.query(query, function (err, result) {
		if (err) throw err;
		
		var mineVal = (req.params.user == req.session.user);
		return router.route(req, res, "projects",	{ 	
														liUser: req.session.user,
														mine: mineVal,
														muser: req.params.user,
														"loggedin": (req.session.user != undefined),
														page: "projects",
														projects: result
													}
		);
		
	});
}
module.exports.getProjects = getProjects;

function getProject (req, res) { 
	if (req.params.projectid == undefined) res.send(req);
	var query = "SELECT * FROM projects WHERE id=" + req.params.projectid + ";";
	async.waterfall([
		function (cb) {
			connection.query(query, function(err, result) {
				if (err) throw err;
				var iter = JSON.parse(result[0].iterations);
				console.log(iter);
				var iter_query = "SELECT * FROM tracks WHERE";
				// console.log(iter);
				if (iter.length == 0) {
					return cb (err, result[0], undefined, undefined);
				}
				for ( var iterIndex = 0; iterIndex < iter.length; iterIndex++) {
					console.log("iterIndex: " + iterIndex);
					var iteration = iter[iterIndex];
					for (var trackIndex in iteration.tracks) {
						console.log("trackIndex: " + trackIndex);
						iter_query += " id=" + iteration.tracks[trackIndex];
						if (!(iterIndex == iter.length - 1 && trackIndex == iteration.tracks.length - 1))
							iter_query += " OR ";
					}
				}
				iter_query += ";";
				// console.log(iter_query);
				cb (err,result[0], iter, iter_query);
			});
		},
		function (project, iter, iter_query, cb) {
			console.log(iter_query);
			if (iter_query == undefined)
				return cb (null, project, iter, undefined);
			connection.query(iter_query, function (err, result) {
				if (err) throw err;
				var track_results = {};
				for (var trackIndex in result) {
					var track = result[trackIndex];
					// console.log("track: " + track);
					track_results[track.id] = track;
				}
				// console.log("track results: ");
				// console.log(track_results);
				// console.log(track_results['1']);
				cb (err, project, iter, track_results)
			});
		}
	], 
	function (err, project, iter, track_results) {
		if (err) throw err;
		// console.log("project");
		// console.log(project);
		// console.log("iter");
		// console.log(iter);
		// console.log("track_results");
		// console.log(track_results);
		return router.route(req, res, "control",	{
											mine: (req.params.user == req.session.user),
											muser: req.params.user,
											"loggedin": (req.session.user != undefined),
											page: "control",
											liUser: req.session.user,
											tracks: track_results,
											project: project,
											projectid: req.params.projectid,
											iterations: iter
										}
		);
	});
}
module.exports.getProject = getProject;
