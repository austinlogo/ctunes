// var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cookiesession = require('cookie-session');
var bodyParser = require('body-parser');
var sql = require('mysql');
// var app = express();
var bcrypt = require('bcrypt-nodejs');
var fsExtra = require('fs-extra');
var fs = require('fs');
var multiparty = require('multiparty');
var util = require('util');
var async = require('async');
var router = require('./router.js');
var db = require('./database.js');
// var favicon = require('serve-favicon');
var connection = db.getConnection();
// console.log(connection);

var iteration_template = {
	title 	: "",
	id		: -1,
	tracks 	: "[]"
}

var contentPath	= "./public/content/";
var savePath = "/content/";

function newProject(req, res) { 
	var post = req.body;

	query = "INSERT INTO projects (title, creator, iterations, rating, rated) " + 
		"VALUES ('" + 
		post.projectTitle + "', '" + 
		req.session.user + "', '" + 
		"[]" + "', " + //iterations
		"0" + ", '" +
		"[]" + "' " +
		");";				

	connection.query(query, function (err, result) {
		if (err) throw err;

		var route = "/" + req.session.user + "/projects";
		
		return res.redirect(route);

		
	});
}
module.exports.newProject = newProject;

function downloadTrack (req, res) {
	var id = req.params.downloadid;
	var query = "SELECT * FROM tracks WHERE id=" + id + ";";

	connection.query (query, function (err, result) {
		if (err) throw err;

		var file = __dirname + "/public/" + result[0].content;
		return res.send(file);
	});
}
module.exports.downloadTrack = downloadTrack;

function downloadIteration (req, res) {
	var id = req.params.project;
	var iterationIndex = req.params.downloadid

	var query = "SELECT iterations FROM projects WHERE id=" + id + ";";

	connection.query (query, function (err, result) {
		if (err) throw err;
		result = JSON.parse(result[0]['iterations']);


		var file = __dirname + "/public/" + result[iterationIndex].content;
		return res.download(file);
	});
}
module.exports.downloadIteration = downloadIteration;

function downloadCurrentIteration (req, res) {
	var query = "SELECT iterations FROM projects WHERE id=" + req.params.projectid + ";";

	connection.query(query, function (err, result) {
		var iterations = JSON.parse(result[0].iterations);
		var iteration = iterations[req.params.iterationid];
		return res.download(__dirname + "/public/" + iteration.content);
	});
}
module.exports.downloadCurrentIteration = downloadCurrentIteration;

function upload (req, res) {
	var form = new multiparty.Form();
		
	insert_track(req, res, form, true, function (err, path, result) {
		if (err) {
			console.log(err);
			if (!err.errno == 1062)
				return router.route(req, res, "error", err);
			else
				return res.redirect("/" + req.session.user + "?dup=true");

		}

		return res.redirect("/" + req.session.user);
	});
}
module.exports.upload = upload;

function update (req, res) {
	var form = new multiparty.Form();
		
	update_track(req, res, form, true, function (err) {
		if (err) {
			console.log("UPDATE ERR: " + err);
			if (!err.errno == 1062)
				return router.route(req, res, "error", err);
			else
				return res.redirect("/" + req.session.user + "?dup=true");

		}

		return res.redirect("/" + req.session.user + "/manage");
	});
}
module.exports.update = update;


function insert_track(req, res, form, insert, main_cb) {
	var file = '';
	var title = '';
	var user = '';
	var folderPath = '';
	var fields = undefined;
		
	//waterfall will perform each of these sections synchronously one after the other.
	async.waterfall([
		function (cb) {
			form.parse(req, function(err, fields_param, files) {
				if (err) throw err;


				// console.log(files);
				file = files.file[0];
				user = req.session.user;
				fields = fields_param;
				console.log("album: ");
				
				// if there is no album then we are adding a mixed track which is actually part of project.
				fields.album = (fields.album == undefined && fields.project != undefined) ? [fields.project[0].toLowerCase()] : [fields.album[0].toLowerCase()];
				// contentPath prefix is meant to actually get your file to the right place
				// savepath prefix will be put into the database so that it can be accessed by the web pages.
				folderPath = contentPath + user + "/" + fields.album + "/";

				// get the file extension
				var len = file.originalFilename.length;
				var extension = file.originalFilename.substring(len - 4, len);
				title = file.originalFilename.substring(0, len - 4);

				//We need to check that we are dealing with an mp3 or wav file. as that's all we support
				if (extension == ".mp3" || extension == ".wav") {
					return cb(null);
				}
				else {
					return cb({ "ext" : true});
				}
			});
		},
		function (cb) {

			//make the folder path. if it already exists then nothing will change
			fsExtra.mkdirs(folderPath, function (err) {
				if (err) throw err;

				// path: hard coded path where your file will be stored
				// databasePath: path as it will need to be referenced by webpages. they're different trust me.
				// I am a doctor
				var path = folderPath + file.originalFilename;
				var databasePath = savePath + user + "/" + fields.album + "/" + file.originalFilename;

				// database path is not used until the end. I just pass it down the entire way for fun
				return cb(null, path, databasePath);
			});
		},
		function (path, databasePath, cb) {
			// read the file from the temp folder where it was downloaded to
			fs.readFile(file.path , function(err, data) {
				return cb(err, data, path, databasePath);
			});
		},
		function (data, path, databasePath, cb) {
			// write file to path, not hard to understand this part
			fs.writeFile(path, data, function(err) {
				return cb(err, databasePath);
			});
		},
		function (databasePath, cb) {
			// the internet said to do this. tells the computer something, frees the data, I am not sure.
			fs.unlink(file.path, function() {
				return cb(null, databasePath);
			});
		}
	],
	function (err, databasePath) {
		if(err) {
			console.log(err);
			if(err.ext) return main_cb(true, undefined, undefined);
			else throw err;
		}

		// if the stuff is empty it needs to be something that is not undefined
		fields.album = (fields.album == undefined) ? ["unknown album"] : fields.album;
		fields.genre = (fields.genre == undefined) ? ["unknown genre"] : fields.genre;

		// deprecated
		if (!insert) return;
		
		//convert strings to integer values although they should really be bit values
		fields.visibility[0] = (fields.visibility[0] == '0') ? 0 : 1;

		// inserting iterations should not be inserted into 
        var tracksQuery = "INSERT INTO tracks (title, album, artist, collaborators, genre, content, rating, rated, visibility)"
        			+ "VALUES ('" 
        			+ title + "', '" 
        			+ fields.album[0]  + "', '" 
        			+ req.session.user + "', '" 
        			+ "{}" + "', '" 
        			+ fields.genre[0] + "', '" 
        			+ databasePath + "', "
        			+ 0 + ", "
        			+ "'[]'" + ", "
        			+ fields.visibility[0]
        			+ ");";

   		connection.query(tracksQuery, function (err, result) {
			return main_cb(err, databasePath, result);			
	   	});
	});	
}

function update_track(req, res, form, insert, main_cb) {
	var file = '';
	var user = '';
	var folderPath = '';
	var fields = undefined;
		
	form.parse(req, function(err, fields_param, files) {
		if (err) throw err;


		// console.log(files);
		user = req.session.user;
		fields = fields_param;
		fields.visibility[0] = (fields.visibility[0] == '0') ? 0 : 1;
		// console.log(fields.album[0]);
		fields.album = (fields.album == undefined && fields.project != undefined) ? [fields.project[0].toLowerCase()] : [fields.album[0].toLowerCase()];

		var updateQuery = 	"UPDATE tracks SET " +
							"album='" + fields.album + "', " +
							"genre='" + fields.genre + "', " +
							"visibility=" + fields.visibility + " " +
							"WHERE id=" + fields.id + ";";
		console.log(updateQuery);

		connection.query(updateQuery, function (err, result) {
			return main_cb(err);
		});

	});
}

function deleteTrack (req, res) {
	var form = new multiparty.Form();
	console.log("deleteTrack");
	form.parse(req, function(err, fields_param, files) {
		console.log("Err: "+ err);
		var deleteQuery = "DELETE FROM tracks WHERE id=" + fields_param.id + ";";

		connection.query(deleteQuery, function (err, result) {
			console.log("del err: " + err);
			return res.redirect("/" + req.session.user + "/manage");

		});
	});

}
module.exports.deleteTrack = deleteTrack;

function uploadIteration (req, res) {
	var user 	= req.body.user;
	var id		= req.body.id;

	var user_tracks = "SELECT DISTINCT title, id FROM tracks WHERE artist='" + user + "' GROUP BY title;";
	var proj_tracks = "SELECT iterations FROM projects WHERE id=" + id + " GROUP BY title;";

	console.log(req.body);
	console.log(user_tracks);
	console.log(proj_tracks);
	async.parallel([
		function (cb) {
			connection.query(user_tracks, function (err, result) {
				if (err) throw err;
				return cb (null, result);
			});
		},
		function (cb) {
			connection.query(proj_tracks, function (err, result) {
				if (err) throw err;
				console.log("hello");
				console.log(result[0]["iterations"]);

				return cb (null, JSON.parse(result[0]["iterations"]));
			});
		}
	],
	function (err, result) {
		if(err) res.send(err);

		res.send({
			user: result[0],
			project: result[1]
		});
	});
}
module.exports.uploadIteration = uploadIteration;

function addIteration(req, res) {
	var tracks = req.body.tracks;
	var new_iteration = {};

	async.parallel([
		function (cb) { // 0
			var form = new multiparty.Form();
			console.log(form);
			insert_track(req, res, form, true, function (err, path, result) {
				if (err && err.errno != 1062) { //DUP ENTRY
					return router.route(req, res, "error", err);
				}
				return cb (null, path);
			});
		},
		function (cb) { // 1
			var query = "SELECT * FROM projects WHERE id=" + req.params.projectid + ";";
			connection.query(query, function(err, result) {
				if (err) throw err;
				var result = result[0];
				
				
				var iterations = JSON.parse(result.iterations);
				new_iteration.id = iterations.length;

				return cb(null, iterations);
			});
		},
		function (cb) { // 2
			var form = new multiparty.Form();

			form.parse(req, function(err, fields_param, files) {
				if (err) throw err;

				new_iteration.title 		= files.file[0].originalFilename;
				new_iteration.tracks 		= (fields_param.tracks != undefined) ? fields_param.tracks : [];
				new_iteration.iTracks	 	= (fields_param.iterations != undefined) ? fields_param.iterations : []; 
				// if (fields_param.iterations != undefined) 
				// 	new_iteration.iTracks		= fields_param.iterations;	
				// else
				// 	new_iteration.iTracks		= [];	


				return cb(null, null);
			});
		}
	],
	function (err, result) {
		var path = result[0];
		var iterations = result[1];
		// console.log(iterations);
		new_iteration.content = path;

		console.log("new_iteration~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`");
		// I'VE DETERMINED THAT YOU SHOULD BE ABLE TO HAVE BLANK ITERATIONS IF YOU ARE UPLOADING FOR THE FIRST TIME
		// if (new_iteration.tracks.length == 0 && new_iteration.iTracks.length == 0) {
		// 	console.log("new iteration error");
		// 	res.redirect("/" + req.params.user + "/projects" + "/" + req.params.projectid);
		// 	return;
		// }
		// else {
		iterations.push(new_iteration);
		
		iterations = JSON.stringify(iterations);
		var update = "UPDATE projects SET iterations = '" + iterations + "' WHERE id=" + req.params.projectid + ";";
		
		connection.query(update, function(err2, result2) {
			if (err2) throw err;
			
			res.redirect("/" + req.params.user + "/projects" + "/" + req.params.projectid);
			return
		});
		// }
	});	
}
module.exports.addIteration = addIteration;