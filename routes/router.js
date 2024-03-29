/**
 * routes to the correct
 * @param  req {request}
 * @param  res {response}
 * @param  webpage {String}
 * @param  options {JSON} the values that are added into the JSON document
 * @param  cb {Function} callback
 * @return callback function {Function}
 */
function route(req, res, webpage, options, cb) {

	switch(webpage) {
		case "splash" : 
			res.render("index", options);
		break;
		case "profile" :
			res.render("profile", options, function(err, html) {
				if (err) console.log(err);
				else res.send(html);
			});
		break;
		case "feed" :
			res.render("userFeed", options, function(err, html) {
				if (err) console.log(err);
				else res.send(html);
			});
		break;
		case "new-user" :
			res.render("new-user", options);
		break;
		case "projects" :
			res.render("projects", options, function(err, ht) {
				if(err) res.send("error:" + err);
				else res.send(ht);
			});
		break;
		case "tracks" : 
			res.render("tracks", options, function(err, ht) {
				if(err) res.send("error:" + err);
				else res.send(ht);
			});
		break;
		case "manage" : 
			res.render("manage", options, function(err, ht) {
				
				if(err) res.send("error:" + err);
				else res.send(ht);
			});
		break;
		case "discover" : 
			res.render("discover", options, function(err, ht) {
				if(err) res.send("error:" + err);
				else res.send(ht);
			});
		break;
		case "login" :
			res.render("login", options);
		break;
		case "control" : 
			res.render("control-room", options, function(err, ht) {
				if(err) res.send("error:" + err);
				else res.send(ht);
			});
		break;
		case "genres" : 
			res.render("genres", options, function(err, ht) {
				if(err) res.send("error:" + err);
				else res.send(ht);
			});
		break;
		case "albums" : 
			res.render("albums", options, function(err, ht) {
				if(err) res.send("error:" + err);
				else res.send(ht);
			});
		break;
		default :
			res.status(404).send("not found")
		break;
	}
}

module.exports.route = route;
