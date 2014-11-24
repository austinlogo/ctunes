var artists = $('.artist-item');

for (var i = 0; i < artists.length; i++) {
	//getting to the following icon button
	var artist = artists[i];
	var following = $(artist).children('.icon-container'); // get icon container
	following = $(following[0]).children('.icon'); //get list of icons
	following = following[0]; //get icon

	// console.log("hello");
	following.addEventListener("click", function() {
		xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "POST", "/follow", false );
	    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); 
	    xmlHttp.send("id=" + this.id);
	    var response = xmlHttp.responseText;
	    console.log(response);

	    // console.log(ratingInt);
	    $(this).html("-");
	});
}