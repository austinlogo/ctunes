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
var router = require('./routes/router.js');
var db = require('./routes/database.js');
var content = require('./routes/content.js');
var user = require('./routes/user.js');
var navigation = require('./routes/navigation.js');
var actions = require('./routes/actions.js');
var favicon = require('serve-favicon');

var iteration = {
	title 	: "",
	id		: -1,
	tracks 	: "[]"
}

//create a connection and create Database and tables if necessary
db.initialize();
var connection = db.getConnection();
// console.log(connection);

var contentPath	= "./public/content/";
var savePath = "/content/";

// view engine setup
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cookiesession({keys: ['124353423', '19374402848']}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + "/favicon.ico"));

app.param("user", function (req, res, next, id) {
	next();
});

app.param("downloadid", function (req, res, next, id) {
	next();
});

app.param("projectid", function (req, res, next, id) {
	next();
});

app.param("iterationid", function (req, res, next, id) {
	next();
});

app.param("genre", function (req, res, next, id) {
	next();
});


app.get("/", function (req, res) {
	if (req.session.user) {
		return res.redirect("/" + req.session.user);
	}
	return router.route(req, res, "splash", undefined);
});

app.post("/new-project", content.newProject);

app.get("/logout", function (req, res) {
	req.session.user = undefined;
	return res.redirect("/");
});


app.get("/login", function (req, res) {
	
	router.route(req, res, "login", {
										"page": "login"
									}
	);

});

app.get("/download/:downloadid", downloadTrack);

function downloadTrack (req, res) {
	var id = req.params.downloadid;
	var query = "SELECT * FROM tracks WHERE id=" + id + ";";

	connection.query (query, function (err, result) {
		if (err) throw err;

		var file = __dirname + "/public/" + result[0].content;
		return res.download(file);
	});
}

app.get("/:userid/projects/:project/download-iteration/:downloadid", content.downloadIteration);

app.get("/:userid/projects/:projectid/:iterationid", content.downloadCurrentIteration); 

app.post("/upvote", user.upvote);

app.post("/projUpvote", user.projUpvote);

app.post("/follow", user.follow);

app.post("/search", actions.search);

app.post("/logincheck", user.loginCheck);

app.get("/:user", navigation.getUser);

app.get("/:user/tracks", navigation.getTracks);

app.get("/:user/tracks/genre/:genre", navigation.getGenre);

app.get("/:user/tracks/album/:album", navigation.getAlbum);

app.get("/:user/projects", navigation.getProjects);

app.get("/:user/projects/:projectid", navigation.getProject);
 
app.post("/upload", content.upload);

// function insert_track(req, res, form, insert, main_cb) {
// 	var file = '';
// 	var user = '';
// 	var folderPath = '';
// 	var fields = undefined;
		
// 	async.waterfall([
// 		function (cb) {
// 			form.parse(req, function(err, fields_param, files) {
// 				if (err) {
// 					throw err;
// 				}
// 				console.log(files);
// 				file = files.file[0];
// 				user = req.session.user;
// 				folderPath = contentPath + user + "/";
// 				fields = fields_param;

// 				var len = file.originalFilename.length;
// 				var extension = file.originalFilename.substring(len - 4, len);
// 				console.log("655: " + extension);
// 				if (extension == ".mp3" || extension == ".wav") {
// 					return cb(null);
// 				}
// 				else {
// 					return cb({ "ext" : true});
// 				}
// 			});
// 		},
// 		function (cb) {
// 			fsExtra.mkdirs(folderPath, function (err) {
// 				if (err) throw err;

// 				var path = folderPath + file.originalFilename;
// 				var databasePath = savePath + user + "/" + file.originalFilename;

// 				return cb(null, path, databasePath);
// 			});
// 		},
// 		function (path, databasePath, cb) {
// 			fs.readFile(file.path , function(err, data) {
// 				return cb(err, data, path, databasePath);
// 			});
// 		},
// 		function (data, path, databasePath, cb) {
// 			fs.writeFile(path, data, function(err) {
// 				return cb(err, databasePath);
// 			});
// 		},
// 		function (databasePath, cb) {
// 			fs.unlink(file.path, function() {
// 				return cb(null, databasePath);
// 			});
// 		}
// 	],
// 	function (err, databasePath) {
// 		if(err) {
// 			console.log(err);
// 			if(err.ext) return main_cb(true, undefined, undefined);
// 			else throw err;
// 		}

// 		if (!insert) return;

// 		// inserting iterations should not be inserted into 
//         var tracksQuery = "INSERT INTO tracks (title, album, artist, collaborators, genre, content, rating, rated)" +
//         			"VALUES ('" 
//         			+ file.originalFilename + "', '" 
//         			+ fields.album + "', '" 
//         			+ req.session.user + "', '" 
//         			+ "{}" + "', '" 
//         			+ fields.genre + "', '" 
//         			+ databasePath + "', "
//         			+ 0 + ", "
//         			+ "'[]'"
//         			+ ");";
	
//    		connection.query(tracksQuery, function (err, result) {
// 			return main_cb(err, databasePath, result);
			
// 	   	});
// 	});	
// }

app.post("/projects/upload-iteration", content.uploadIteration);

app.post("/:user/projects/:projectid/add-iteration", content.addIteration);

app.post("/add-user", user.addUser);
	
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//error handler
app.use(function (err, req, res, next) {
    if (err.status == 404 || err.status == 500) {
        
        res.status(err.status);
        next();
    }
});

app.listen(8080);

module.exports = app;
