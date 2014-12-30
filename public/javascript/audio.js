var playing = {
	title: "",
	artist: "",
	src: "",
	currenttime: 0,
	id: "",
	playing: true
}

var audioPlayer = $('.player')[0];
// console.log(audioPlayer);

$('.track-container').click(function (e) {
	if ($(e.target).hasClass("icon")) return;

	var prefix = "container-";
	var idLong = $(this).attr("id");
	var id = idLong.substring(prefix.length, idLong.length); 

	// STARTING A NEW TRACK
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
		if ($(".play-bar").css("display") == "none") $(".play-bar").slideDown();
		$("#pb-play > img").attr("src", "/images/pause.png");


	}
	else {
		if (playing.playing) {
			audioPlayer.pause();
			$("#pb-play > img").attr("src", "/images/play.png");
		}
		else {
			audioPlayer.play();
			if ($(".play-bar").css("display") == "none") $(".play-bar").slideDown();
			$("#pb-play > img").attr("src", "/images/pause.png");
		}

		playing.playing = !playing.playing;


	}
});

if (audioPlayer) {
	audioPlayer.addEventListener('timeupdate', function (e){
			var progressId = "progress-" + playing.id;
			var percent = 100 - ( (audioPlayer.currentTime * 100) / audioPlayer.duration);
			// console.log(progressId + ": " + percent);
		    $("#" + progressId).css("right", percent + "%");
		    $(".play-bar > .progress").css("right", percent + "%");
	});
}


$(".rating").click(function (e) {

	getTrackId("upvote-", e.target, function (trackId) {
		var iIndex = trackId.indexOf("i");
		if (iIndex >= 0) {
			trackId = trackId.substring(iIndex + 1, trackId.length);
		}
		
		xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "POST", "/upvote", false );
	    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); 
	    xmlHttp.send("id=" + trackId);
	    var response = xmlHttp.responseText;
	    // console.log(response);
	    if (response == "") return;

	    var rating = $(e.target).html();
	    // console.log("rating: " + rating);
	    rating = rating.substring(1, rating.length);
	    ratingInt = parseInt(rating) + 1;
	    $(e.target).html("+" + ratingInt);
	});
});

$(".download").click(function (e) {
	getTrackId ("download-", e.target, function (trackId) {
		var pIndex = trackId.charAt(trackId.length - 1) == 'i';
		var iIndex = trackId.indexOf('i');
		if (pIndex) {
			if (iIndex < trackId.length - 1)
				trackId = trackId.substring(iIndex + 1, trackId.length - 1);
			else
				trackId = trackId.substring(0, trackId.length - 1);
			console.log(trackId);
			window.location.href = window.location.href + "/download-iteration/" + trackId;

		}
		else {
			if (iIndex < 0) {
				window.location.href = "/download/" + trackId;
			}
			else {
				console.log(iIndex);
				trackId = trackId.substring(iIndex + 1, trackId.length);
				console.log(trackId);
				window.location.href = "/download/" + trackId;
			}
		}
	});
});



if (audioPlayer) {
	audioPlayer.addEventListener('ended', function (){	
		if (audioPlayer.loop) return;
		console.log("ended");
		var progressId = "#progress-" + playing.id;
		this.pause();
		$(progressId).css("right", "100%");
	});
}


function getTrackId (prefix, elt, cb) {
	eltId = elt.id;
	var trackId = eltId.substring(prefix.length, eltId.length);

	return cb (trackId);
}


//PLAYBAR CONTROLS

$("#pb-play").click (function(e) {
	// alert("hello");

	if (audioPlayer.paused) {
		audioPlayer.play();
		$("#pb-play > img").attr("src", "/images/pause.png");

	}
	else {
		audioPlayer.pause();
		$("#pb-play > img").attr("src", "/images/play.png");
	}
});

$("#pb-stop").click (function (e) {
	audioPlayer.pause();
	audioPlayer.currentTime = 0;
	$(".play-bar").slideUp();
});


$("#pb-forw").click (function (e) {
	audioPlayer.currentTime += 3;
});

$("#pb-back").click (function (e) {
	audioPlayer.currentTime -= 3;
});

$("#pb-rept").click (function (e) {

	if (audioPlayer.loop) {
		audioPlayer.loop = false;
		$("#pb-rept > img").attr("src", "/images/repeat.png");
	}
	else {
		audioPlayer.loop = true
		$("#pb-rept > img").attr("src", "/images/ITERATE.png");	
	}
});