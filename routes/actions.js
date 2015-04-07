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
// var content = require('./routes/content.js');
// var user = require('./routes/user.js');
// var navigation = require('./routes/navigation.js');
// var actions = require('./routes/actions.js');
var favicon = require('serve-favicon');
var connection = db.getConnection();

// find what they are looking for in the search bar
function search (req, res) {
	var prefix = req.body.query + "%";
	var users_query = "SELECT user, first, last, pic FROM users WHERE " +
		"user like '" + prefix + "' OR " + 
		"first like '" + prefix + "' OR " + 
		"last like '" + prefix + "'" +  
		";";
	var track_query = "SELECT * FROM tracks WHERE " +
		"title like '" + prefix + "' OR " +
		"album like '" + prefix + "' OR " +
		"genre like '" + prefix + "'" + 
		";";
	var project_query = "SELECT * FROM projects WHERE " +
		"title like '" + prefix + "'" + 
		";";
	
	async.parallel([
		function (cb) {
			
			connection.query(users_query, function (err, result) {
				if (err) throw err;

		

				if (result) {
					cb( null, result);
				}
				else
					cb( true, result);

				
			});		
		},
		function (cb) {
			connection.query(track_query, function (err, result) {
				if (err) throw err;

				
				if (result) {
					return cb( null, result);
				}
				else
					return cb( null, result);

				
			});
		},
		function (cb) {
			connection.query(project_query, function (err, result) {
				if (err) throw err;

				
				if (result) {
					return cb( null, result);
				}
				else
					return cb( null, result);
			});
		}
	],
	function (err, result) {
		if (err) throw err;

		
		var sending = 	{
							"users"	: result[0],
							"tracks": result[1],
							"projects" : result[2]
						};
		return res.send(sending);
	});
}
module.exports.search = search;

