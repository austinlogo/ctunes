// navigation.js contains the routes for basic navigaiton between pages and the logic for populating
// those pages with whatever is needed.


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
// var user = require('./user.js');
var favicon = require('serve-favicon');
var connection = db.getConnection();

/** 
 * will route to your feed unless you are not signed in.
 */
function home(req, res) {
	if (req.session.user) {
		return res.redirect("/" + req.session.user + "/feed");
	}
	return router.route(req, res, "splash", undefined);
}
module.exports.home = home;

/**
 * (really)
 */
function logout (req, res) {
	req.session.user = undefined;
	return res.redirect("/");
}
module.exports.logout = logout;

/**
 * (really)
 */
function login (req, res) {	
	router.route(req, res, "login", {
										"page": "login"
									}
	);
}
module.exports.login = login;

/**
 * /:user/feed
 * feed is music and iterations from people you are following
 * users are users you are following
 */
function getUserFeed (req, res) {

	var usersQuery = "SELECT user,following FROM users WHERE user ='" + req.params.user + "';";
	var myQuery = "SELECT user,following FROM users WHERE user ='" + req.session.user + "';";
	var tracksQuery = "SELECT * FROM tracks WHERE artist='" + req.params.user + "';";
	var userQuery = "SELECT * FROM users;";
	var followQuery = "SELECT following FROM users WHERE user='" + req.params.user + "';";

	async.parallel([
		// get the list of followers from the pageUser
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
		// get the tracks from the sessionUser
		function (cb) { // 1
			connection.query(tracksQuery, function (err, result) {
				if (err) throw err;
				return cb (null, result);

				
			});
		},
		// get all users;
		function (cb) { // 2
			connection.query(userQuery, function (err, result) {
				return cb (null, result);
			});
		},
		// get the list of followers from the session user
		function (cb) { // 3
			connection.query(myQuery, function (err, result) {
				return cb (null, result);
			});
		},
		// get the list of followers from the pageUser and use it to construct a query of tracks that were composed
		// by the people the pageUser follows
		function (cb) { // 4
			connection.query(followQuery, function (err, result) {
				if (err) return cb(err, null);
				var following = JSON.parse(result[0].following);
				console.log("following");
				console.log(following.length);
				if (following.length == 0) return cb(null, []);
				
				//Constructing query to find tracks by artists that I follow
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
		if (err) {
			router.route(req, res, "error", undefined);
		}

		var following_var = result[0][0] == undefined ? [] : result[0][0].following;
		var my_following = result[3][0] == undefined ? [] : result[3][0].following;

		// mine 	:	determines if this is your page
		// muser	:	which user's page is this
		// loggedin	: 	are we loggedin
		// tracks 	:	tracks to be displayed in feed
		// users 	: 	users you are following
		// following: 	users the page owner is following
		// myFollowing: users the loggedin user is following
		// account 	: 	I don't know
		// dup 		: 	are there duplicate entries
		// album 	: 	this is used for two cases to pre fill the album space
		// genre 	: 	same but for the genre text box
		return router.route(req, res, "feed", {	
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
													"dup": req.query.dup,
													album: undefined,
													genre: undefined
												}
		);
	});
}
module.exports.getUserFeed = getUserFeed;

/**
 * /:user/
 */
function getUser (req, res) {

	var usersQuery = "SELECT user,following FROM users WHERE user ='" + req.params.user + "';";
	var myQuery = "SELECT user,following FROM users WHERE user ='" + req.session.user + "';";
	var tracksQuery = "SELECT * FROM tracks WHERE artist='" + req.params.user + "';";
	var userQuery = "SELECT * FROM users;";
	var followQuery = "SELECT following FROM users WHERE user='" + req.params.user + "';";

	async.parallel([
		// Get the user for this page, so we can see who the user is following
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
		// Get the tracks by this page's user
		function (cb) { // 1 - get the 
			connection.query(tracksQuery, function (err, result) {
				if (err) throw err;
				return cb (null, result);	
			});
		},
		// Get all users
		function (cb) { // 2
			connection.query(userQuery, function (err, result) {
				return cb (null, result);
			});
		},
		// Get the logged in user, so we can see who he is following
		function (cb) { // 3
			connection.query(myQuery, function (err, result) {
				return cb (null, result);
			});
		},
		// Construct a query 
		function (cb) { // 4
			connection.query(followQuery, function (err, result) {
				if (err) return cb(err, null);
				var following = JSON.parse(result[0].following);
				console.log("following");
				console.log(following.length);
				if (following.length == 0) return cb(null, []);
				
				// consstruct a query to get users who the pageUser follows
				var followedTracksQuery = "SELECT * FROM users WHERE ";
				for (var index in following) {
					console.log(index);
					//looks for the last item in the list
					followedTracksQuery += (index == following.length - 1) ? "user='" + following[index] + "'" : " user='" + following + "' OR ";
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

		var following_var = result[4] == undefined ? [] : result[4];
		var my_following = result[3][0] == undefined ? [] : result[3][0].following;

		return router.route(req, res, "profile", {	
													liUser: req.session.user,
													"mine": (req.session.user && req.session.user == req.params.user),     
													"muser": req.params.user,
													"loggedin": !(req.session.user == undefined),
													"tracks": result[1], 
													"users": result[2], 
													"following": following_var,
													"myFollowing" : my_following,
													"page": "user",
													"account": "hello",
													"dup": req.query.dup,
													album: undefined,
													genre: undefined
												}
		);
	});
}
module.exports.getUser = getUser;


/**
 * /:user/discover
 * used to find music by other artists
 */
function discoverTracks(req, res) {
	var query  = 	"SELECT * from tracks ORDER BY id DESC LIMIT 50;";
	var aquery = 	"SELECT id, album FROM tracks GROUP BY album;";
	var gquery =  	"SELECT id, genre FROM tracks GROUP BY genre;";
	var pquery = 	"SELECT id, creator, title, rated, rating from projects ORDER BY id DESC;";
	var uquery = 	"SELECT * FROM users LIMIT 50;";
	var myQuery = "SELECT user,following FROM users WHERE user ='" + req.session.user + "';";

	
	async.parallel([
		function (cb) { //0
			//get the last 50 tracks uploaded
			connection.query(query, function (err, result) {
				return cb (err, result);
			});
		},
		// get the albums of all tracks
		function (cb) { // 1
			connection.query(aquery, function (err, result) {
				return cb (err, result);
			});
		},
		// get the genre of all tracks
		function (cb) { // 2
			connection.query(gquery, function (err, result) {
				return cb (err, result);
			});
		},
		// get the projects
		function (cb) { // 3
			connection.query(pquery, function (err, result) {
				return cb (err, result);
			});
		},
		// get the users
		function (cb) { // 4
			connection.query(uquery, function (err, result) {
				return cb (err, result);
			});
		},
		// get the followers of the sessionUser
		function (cb) { // 5
			connection.query(myQuery, function (err, result) {
				return cb (err, result);
			});
		}
	],
	function (err, result) {
		if (err) throw err;
		console.log("results: " + result[4]);
		var my_following = result[5][0] == undefined ? [] : result[5][0].following;

		return router.route(req, res, "discover",	{ 	
														liUser: req.session.user,
														mine: (req.params.user == req.session.user),
														muser: req.params.user,
														"loggedin": (req.session.user != undefined),
														page: "discover",
														tracks: result[0],
														albums: result[1],
														genres: result[2],
														projects: result[3],
														users: result[4],
														myFollowing: my_following
													}
		);
	});
}
module.exports.discoverTracks = discoverTracks;

/**
 * /:user/tracks
 * getTracks of the pageUser
 */
function getTracks(req, res) {
	var query  = 	"SELECT * from tracks where artist='" + req.params.user + "';";
	var aquery = 	"SELECT id, album FROM tracks where artist='" + req.params.user + "' GROUP BY album;";
	var gquery =  	"SELECT id, genre FROM tracks where artist='" + req.params.user + "' GROUP BY genre;";
	
	async.parallel([
		// get the tracks by pageUser
		function (cb) {
			connection.query(query, function (err, result) {
				return cb (err, result);
			});
		},
		// get the albums by pageUser
		function (cb) {
			connection.query(aquery, function (err, result) {
				return cb (err, result);
			});
		},
		// get the genres by pageUser
		function (cb) {
			connection.query(gquery, function (err, result) {
				return cb (err, result);
			});
		}
	],
	// compile
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
													genres: result[2],
													album: undefined,
													genre: undefined
												}
		);
	});
}
module.exports.getTracks = getTracks;

/**
 * /:user/manage
 * allows you to update, change, and delete tracks
 */
function manageTracks( req, res) {

	if (req.session.user != undefined && req.params.user != req.session.user) {
		res.redirect('/');
	}

	var tracksQuery = "SELECT * FROM tracks WHERE artist='" + req.params.user + "' AND projectAlbum=0;";

	connection.query(tracksQuery, function (err, result) {
		if (err) {
			console.log(err);
		}
		// result = result[0];	

		return router.route(req, res, "manage",	{ 	
													liUser: req.session.user,
													mine: (req.params.user == req.session.user),
													muser: req.params.user,
													"loggedin": (req.session.user != undefined),
													page: "tracks",
													tracks: result,
													album: undefined,
													genre: undefined
												}
		);

	});

}
module.exports.manageTracks = manageTracks;

/**
 * /:user/tracks/genre/:genre
 * shows you all the tracks you have uploaded in a specific genre
 */
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
													album: undefined,
													genre: req.params.genre
												}
		);
	});
}
module.exports.getGenre = getGenre;

/**
 * /:user/tracks/album/:album
 * get tracks from a specific album
 */
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
													album: req.params.album,
													genre: undefined
												}
		);
	});
}
module.exports.getAlbum = getAlbum;

/**
 * /:user/projects/
 * get the projects that you have created
 */
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

/**
 * /:user/projects/:projectid
 * get a specific project and open up the control room for that project
 */
function getProject (req, res) { 
	if (req.params.projectid == undefined) res.send(req);
	var query = "SELECT * FROM projects WHERE id=" + req.params.projectid + ";";

	//waterfall will allow you to serialize certain chunks of your operation
	async.waterfall([
		// PART 01
		// construct the query to get the tracks you need from the specified project
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
				// gets tracks used in the iterations
				// SELECT * FROM tracks WHERE id=4 OR id=5 OR ... OR id=6;
				for ( var iterIndex = 0; iterIndex < iter.length; iterIndex++) { //loops through the iterations
					var iteration = iter[iterIndex];
					for (var trackIndex in iteration.tracks) { //loops through the tracks in each iteration
						console.log("trackIndex: " + trackIndex);
						iter_query += " id=" + iteration.tracks[trackIndex];
						// if (!(iterIndex == iter.length - 1 && trackIndex == iteration.tracks.length - 1)) //determines if there is another
						iter_query += " OR ";
					}
				}
				
				// this is easier than adding a whole lot of end checks to see if the end fo the query is " OR " 
				// or " WHERE "
				if (iter_query.substring(iter_query.length-4, iter_query.length) == " OR ")
					iter_query = iter_query.substring(0, iter_query.length-4);
				else if (iter_query.substring(iter_query.length-5, iter_query.length) == "WHERE") 
					return cb (err, result[0], iter, undefined);
				iter_query += ";";
				// console.log(iter_query);
				return cb (err,result[0], iter, iter_query);
			});
		},
		// PART 02
		// make the query
		function (project, iter, iter_query, cb) {
			console.log(iter_query);
			//enpty check
			if (iter_query == undefined)
				return cb (null, project, iter, undefined);

			// query
			connection.query(iter_query, function (err, result) {
				if (err) throw err;
				var track_results = {};
				for (var trackIndex in result) {
					var track = result[trackIndex];
					// console.log("track: " + track);
					track_results[track.id] = track;
				}

				return cb (err, project, iter, track_results)
			});
		}
	], 
	// compile
	function (err, project, iter, track_results) {
		if (err) throw err;
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
