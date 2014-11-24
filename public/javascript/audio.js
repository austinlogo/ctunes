var playing = {
	title: "",
	artist: "",
	src: "",
	currenttime: 0,
	id: "",
	playing: true
}

var audioPlayer = $('.player')[0];
console.log(audioPlayer);

$('.track-container').click(function (e) {
	if ($(e.target).hasClass("icon")) return;

	var prefix = "container-";
	var idLong = $(this).attr("id");
	var id = idLong.substring(prefix.length, idLong.length); 

	if (id != playing.id) {

		//RESET ALL OTHER INFO
		if(playing.id != "") {
			progressId = "#progress-" + playing.id;
			$(progressId).css("right", "100%");
		}

		//SET ALL INFO
		playing.title 	= $(this).find(' > .track-info > .track-title').html();
		playing.artist 	= $(this).find(' > .track-info > .track-artist').html();
		playing.src 	= $(this).find(' > .player-info').attr('src');
		playing.id		= id;
		audioPlayer.src = playing.src;
		audioPlayer.play();


	}
	else {
		playing.playing ? audioPlayer.pause() : audioPlayer.play();
		playing.playing = !playing.playing;


	}
});

audioPlayer.addEventListener('timeupdate', function (e){
		var progressId = "progress-" + playing.id;
		var percent = 100 - ( (audioPlayer.currentTime * 100) / audioPlayer.duration);
		// console.log(progressId + ": " + percent);
	    $("#" + progressId).css("right", percent + "%");
});


$(".rating").click(function (e) {

	getTrackId("upvote-", e.target, function (trackId) {
		xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "POST", "/upvote", false );
	    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); 
	    xmlHttp.send("id=" + trackId);
	    var response = xmlHttp.responseText;
	    // console.log(response);

	    var rating = $(e.target).html();
	    // console.log("rating: " + rating);
	    rating = rating.substring(1, rating.length);
	    ratingInt = parseInt(rating) + 1;
	    $(e.target).html("+" + ratingInt);
	});
});

$(".download").click(function (e) {
	getTrackId ("download-", e.target, function (trackId) {
		window.location.href = "/download/" + trackId;
	});
});

audioPlayer.addEventListener('ended', function (){	
	console.log("ended");
	var progressId = "#progress-" + playing.id;
	this.pause();
	$(progressId).css("right", "100%");
});


function getTrackId (prefix, elt, cb) {
	eltId = elt.id;
	var trackId = eltId.substring(prefix.length, eltId.length);

	return cb (trackId);
}
