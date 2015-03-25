var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cookiesession = require('cookie-session');
var bodyParser = require('body-parser');
var sql = require('mysql');
var app = express();
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

// var iteration = {
// 	title 	: "",
// 	id		: -1,
// 	tracks 	: "[]"
// }

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

app.get("/", navigation.home);

app.post("/new-project", content.newProject);

app.get("/logout", navigation.logout);

app.get("/login", navigation.login);

//THIS IS DEFINED BELOW
app.get("/download/:downloadid", downloadTrack);

app.get("/:userid/projects/:project/download-iteration/:downloadid", downloadIteration);

app.get("/:userid/projects/:projectid/:iterationid", content.downloadCurrentIteration); 

app.post("/upvote", user.upvote);

app.post("/projUpvote", user.projUpvote);

app.post("/follow", user.follow);

app.post("/search", actions.search);

app.post("/logincheck", user.loginCheck);

app.get("/:user", navigation.getUser);

app.get("/:user/feed", navigation.getUserFeed);

app.get("/:user/tracks", navigation.getTracks);

app.get("/:user/manage", navigation.manageTracks);

app.get("/:user/discover", navigation.discoverTracks);

app.get("/:user/tracks/genre/:genre", navigation.getGenre);

app.get("/:user/tracks/album/:album", navigation.getAlbum);

app.get("/:user/projects", navigation.getProjects);

app.get("/:user/projects/:projectid", navigation.getProject);
 
app.post("/upload", content.upload);

app.post("/update", content.update);

app.post("/delete", content.deleteTrack);

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

app.listen(3020);

module.exports = app;

//---DEFINED FUNCTIONS------------------------------------------------------------|

function downloadTrack (req, res) {
	var id = req.params.downloadid;
	var query = "SELECT * FROM tracks WHERE id=" + id + ";";

	connection.query (query, function (err, result) {
		if (err) throw err;

		var file = __dirname + "/public/" + result[0].content;
		return res.download(file);
	});
}

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
