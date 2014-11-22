function initialize(connection) {
	var user_table = "CREATE TABLE IF NOT EXISTS users (" + 
		"user VARCHAR(20) NOT NULL PRIMARY KEY," +
		"email VARCHAR(30) NOT NULL, " +
		"first VARCHAR(15) NOT NULL, " +
		"last VARCHAR(20) NOT NULL, " +
		"genre VARCHAR(15) NOT NULL, " +
		"pic VARCHAR(100) NOT NULL, " +
		"hashed_password VARCHAR(100), " +
		"following VARCHAR(1000)" +
		");";

	var music_table = "CREATE TABLE IF NOT EXISTS tracks (" + 
		"id INT NOT NULL AUTO_INCREMENT," +
		"title VARCHAR(30) NOT NULL, " +
		"album VARCHAR(20), " +
		"artist VARCHAR(20) NOT NULL, " +
		"collaborators VARCHAR(300) NOT NULL, " +
		"genre VARCHAR(15) NOT NULL, " +
		"content VARCHAR(200) NOT NULL, " + 
		"rating INT NOT NULL, " + 
		"PRIMARY KEY(id), " +
		"UNIQUE KEY(title, album, artist)" +
		");";
	var project_table = "CREATE TABLE IF NOT EXISTS projects (" +
		"id INT NOT NULL AUTO_INCREMENT, " +
		"title VARCHAR(40) NOT NULL, " +
		"creator VARCHAR(20) NOT NULL, " +
		"iterations VARCHAR(500) NOT NULL, " +
		// "collaborators VARCHAR(500) NOT NULL, " +
		"PRIMARY KEY(id)" +
		");";

	connection.query("CREATE DATABASE collabTunes", function (err, res) {});
	connection.query("use collabTunes", function (err, res) {});

	connection.query(user_table, function (err, result) {
		if (err) {
			console.log(err);
		}
	});

	connection.query(music_table, function (err, result) {
		if (err) {
			console.log(err);
		}
	});
	
	connection.query(project_table, function (err, result) {
		if (err) {
			console.log(err);
		}
	});			


}

module.exports.initialize = initialize;