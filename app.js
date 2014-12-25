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

//sql config setup
var config = {
	host: 'localhost',
	user: 'root', 
	password: 'sniper'
	// database: 'collabTunes'
	
}


var iteration = {
	title 	: "",
	id		: -1,
	tracks 	: "[]"
}

//create a connection and create Database and tables if necessary
var connection = sql.createConnection(config);
db.initialize(connection);

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

app.post("/new-project", function(req, res) { 
	var post = req.body;

	query = "INSERT INTO projects (title, creator, iterations, rating, rated) " + 
		"VALUES ('" + 
		post.projectTitle + "', '" + 
		req.session.user + "', '" + 
		"[]" + "', " + //iterations
		"1" + ", '" +
		"[]" + "' " +
		");";				

	connection.query(query, function (err, result) {
		if (err) throw err;

		var route = "/" + req.session.user + "/projects";
		
		return res.redirect(route);

		
	});
});

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

app.get("/download/:downloadid", function (req, res) {
	var id = req.params.downloadid;

	var query = "SELECT * FROM tracks WHERE id=" + id + ";";

	connection.query (query, function (err, result) {
		if (err) throw err;

		var file = __dirname + "/public/" + result[0].content;
		return res.download(file);

		
	});

});

app.get("/:userid/projects/:project/download-iteration/:downloadid", function (req, res) {
	var id = req.params.project;
	var iterationIndex = req.params.downloadid

	var query = "SELECT iterations FROM projects WHERE id=" + id + ";";

	connection.query (query, function (err, result) {
		if (err) throw err;
		result = JSON.parse(result[0]['iterations']);


		var file = __dirname + "/public/" + result[iterationIndex].content;
		return res.download(file);

		
	});

});

app.get("/:userid/projects/:projectid/:iterationid", function (req, res) {
	var query = "SELECT iterations FROM projects WHERE id=" + req.params.projectid + ";";

	connection.query(query, function (err, result) {
		var iterations = JSON.parse(result[0].iterations);
		var iteration = iterations[req.params.iterationid];
		return res.download(__dirname + "/public/" + iteration.content);

		
	});

});
 
app.post("/upvote", function (req, res) {
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
		return res.send(undefined);
	
	})
});

app.post("/projUpvote", function (req, res) {
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
			connection.query(update, function (err, result) {
				if (err)  throw err;
				return res.send(result2);	
			});
		}
		return res.send(undefined);
	
	})
});

app.post("/follow", function (req, res) {
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

	
});

app.post("/search", function (req, res) {
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
});

//sign in
app.post("/logincheck", function (req, res) {
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
				return res.redirect("/" + post.username);
				}
			else {
				return router.route(req, res, "splash", undefined);
			}
		}
	);	
});

app.get("/:user", function (req, res) {

	var usersQuery = "SELECT user,following FROM users WHERE user ='" + req.params.user + "';";
	var tracksQuery = "SELECT * FROM tracks WHERE artist='" + req.params.user + "';";
	var userQuery = "SELECT * FROM users;";

	async.parallel([
		function (cb) {
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
		function (cb) {
			
			connection.query(tracksQuery, function (err, result) {
				if (err) throw err;
				return cb (null, result);

				
			});
		},
		function (cb) {
			connection.query(userQuery, function (err, result) {
				return cb (null, result);

				
			});
			
		}
	],
	function (err, result) {
		// connection.close();
		if (err) {
			router.route(req, res, "error", undefined);
		}

		var following_var = result[0][0] == undefined ? [] : result[0][0].following;

		return router.route(req, res, "profile", {	
													liUser: req.session.user,
													"mine": (req.session.user && req.session.user == req.params.user),     
													"muser": req.params.user,
													"loggedin": !(req.session.user == undefined),
													"tracks": result[1], 
													"users": result[2], 
													"following": following_var,
													"page": "user",
													"account": "hello",
													"dup": req.query.dup
												}
		);
	});
});




app.get("/:user/tracks", function(req, res) {
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
});

app.get("/:user/tracks/genre/:genre", function(req, res) {
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
});

app.get("/:user/tracks/album/:album", function(req, res) {
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
});

app.get("/:user/projects", function (req, res) {

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

});

var called = 0;

app.get("/:user/projects/:projectid", function (req, res) { 

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
});
 
// sample
// { filename: [ '' ], upload: [ 'Submit' ] } and 
// { file: [ { fieldName: 'file', originalFilename: 'app.js', path: '/tmp/65352-4owg4h.js', headers: [Object], ws: [Object], size: 4905 } ] 
app.post("/upload", function (req, res) {
	var form = new multiparty.Form();
		
	insert_track(req, res, form, true, function (err, path, result) {
		if (err) {
			console.log(err.errno);
			if (!err.errno == 1062)
				return router.route(req, res, "error", err);
			else
				return res.redirect("/" + req.session.user + "?dup=true");

		}

		return res.redirect("/" + req.session.user);
	});
});

function insert_track(req, res, form, insert, main_cb) {
	var file = '';
	var user = '';
	var folderPath = '';
	var fields = undefined;
		
	async.waterfall([
		function (cb) {
			form.parse(req, function(err, fields_param, files) {
				if (err) {
					throw err;
				}
				console.log(files);
				file = files.file[0];
				user = req.session.user;
				folderPath = contentPath + user + "/";
				fields = fields_param;

				var len = file.originalFilename.length;
				var extension = file.originalFilename.substring(len - 4, len);
				console.log("655: " + extension);
				if (extension == ".mp3" || extension == ".wav") {
					return cb(null);
				}
				else {
					return cb({ "ext" : true});
				}
			});
		},
		function (cb) {
			fsExtra.mkdirs(folderPath, function (err) {
				if (err) throw err;

				var path = folderPath + file.originalFilename;
				var databasePath = savePath + user + "/" + file.originalFilename;

				return cb(null, path, databasePath);
			});
		},
		function (path, databasePath, cb) {
			fs.readFile(file.path , function(err, data) {
				return cb(err, data, path, databasePath);
			});
		},
		function (data, path, databasePath, cb) {
			fs.writeFile(path, data, function(err) {
				return cb(err, databasePath);
			});
		},
		function (databasePath, cb) {
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

		if (!insert) return;

		// inserting iterations should not be inserted into 
        var tracksQuery = "INSERT INTO tracks (title, album, artist, collaborators, genre, content, rating, rated)" +
        			"VALUES ('" 
        			+ file.originalFilename + "', '" 
        			+ fields.album + "', '" 
        			+ req.session.user + "', '" 
        			+ "{}" + "', '" 
        			+ fields.genre + "', '" 
        			+ databasePath + "', "
        			+ 0 + ", "
        			+ "'[]'"
        			+ ");";
	
   		connection.query(tracksQuery, function (err, result) {
			return main_cb(err, databasePath, result);
			
	   	});
	});	
}

app.post("/projects/upload-iteration", function (req, res) {
	var user 	= req.body.user;
	var id		= req.body.id;

	var user_tracks = "SELECT DISTINCT title, id FROM tracks WHERE artist='" + user + "' GROUP BY title;";
	var proj_tracks = "SELECT iterations FROM projects WHERE id=" + id + " GROUP BY title;";

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
});

app.post("/:user/projects/:projectid/add-iteration", function (req, res) {
	var tracks = req.body.tracks;
	var new_iteration = {};




	async.parallel([
		function (cb) {
			var form = new multiparty.Form();
			console.log(form);
			insert_track(req, res, form, true, function (err, path, result) {
				if (err && err.errno != 1062) { //DUP ENTRY
					return router.route(req, res, "error", err);
				}
				return cb (null, path);
			});
		},
		function (cb) {
			var query = "SELECT * FROM projects WHERE id=" + req.params.projectid + ";";
			connection.query(query, function(err, result) {
				if (err) throw err;
				var result = result[0];
				
				
				var iterations = JSON.parse(result.iterations);
				new_iteration.id = iterations.length;

				return cb(null, iterations);
			});
		},
		function (cb) {
			var form = new multiparty.Form();

			form.parse(req, function(err, fields_param, files) {
				if (err) throw err;

				new_iteration.title 		= fields_param.iteration_title[0];
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
		if (new_iteration.tracks.length == 0 && new_iteration.iTracks.length == 0) {
			console.log("Me again");
			res.redirect("/" + req.params.user + "/projects" + "/" + req.params.projectid);
			return;
		}
		else {
			console.log("hello");
			iterations.push(new_iteration);
			
			iterations = JSON.stringify(iterations);
			var update = "UPDATE projects SET iterations = '" + iterations + "' WHERE id=" + req.params.projectid + ";";
			
			connection.query(update, function(err2, result2) {
				if (err2) throw err;
				
				res.redirect("/" + req.params.user + "/projects" + "/" + req.params.projectid);
				return
			});
		}
	});

	

	
});

app.post("/add-user", function (req, res) {

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

			bcrypt.hash(post.password, 10, function (err, hashp) {

				hash_err = err;
				hash = hashp;
				
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
});
	
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