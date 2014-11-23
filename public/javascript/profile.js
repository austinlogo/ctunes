
function getTrackId (prefix, elt, cb) {
	eltId = elt.id;
	var trackId = eltId.substring(prefix.length, eltId.length);

	return cb (trackId);
}


$(document).ready( function () {

	var DELAY = 600,
	    clicks = 0,
	    timer = null;

	$("div.track-container").click( function (e) {
		if ( $(e.target).hasClass('icon'))
			return;

		var button = $(this).find(" > .play-control");
		var css = button.css("display");	
		var str = "container-";
		var divId = $(this).attr('id');
		var trackId = divId.substring(str.length, divId.length);
		var playerId = "player-" + trackId;
		var progressId = "progress-" + trackId;
		var audioDiv = document.getElementById(playerId);
		var aud = new Audio();
		aud.src = "/content/austinlg/OneRepublic - Counting Stars.mp3";
		aud.play();

		// playing
		if ( css.indexOf("none") <= -1) {
			// console.log("playing");
			$(this).find(" > .play-control").css("display", "none");
			$(this).find(" > .pause-control").css("display", "inline-block");
			audioDiv.play();
			
		}
		else {
			// pausing
			$(this).find(" > .play-control").css("display", "inline-block");
			$(this).find(" > .pause-control").css("display", "none");
			audioDiv.pause();
			// audioDiv.currentTime = 0;
			// audioDiv.load();
		}
	});

	//ADD ALL THE EVENT LISTENERS TO THE CARDS
	var j = 0;
	var audioTrackList = $(".track-container"); //all divs .track-container
	// console.log(audioTrackList);
	for (var i = 0; i < audioTrackList.length; i++) {
		if (audioTrackList[i].id.length >= 16 && audioTrackList[i].id.substring(0,16) == "upload-drop-down")
			continue;


		var audioTrackContainer = audioTrackList[i];
		var str = "container-";
		var divId = audioTrackContainer.id;
		var trackId = divId.substring(str.length, divId.length);
		
		getTrackId(str, audioTrackContainer, function (trackId) {
			var playerId = "player-" + trackId;
			var audioTrack = document.getElementById(playerId);
			var progressId = "progress-" + trackId;

			audioTrack.addEventListener('timeupdate', function (e){
				// console.log(e.target);
			// audioTrack.addEventListener('timeupdate', function (){
				var audio = this;
								
				getTrackId("player-", this, function (trackId) {
					var progressId = "progress-" + trackId;
					var percent = 100 - ( (audio.currentTime * 100) / audio.duration);
					// console.log(progressId + ": " + percent);
				    $("#" + progressId).css("right", percent + "%");
				}, false);
			});

			var downloadId = "download-" + trackId;
			var iteration_downloadId = "iteration-download-" + trackId; 
			var voteId = "upvote-" + trackId;

			// console.log(trackId);
			// console.log(project);
	
			var downloadBtn = document.getElementById(downloadId);
			if (downloadBtn) {		
				downloadBtn.addEventListener("click", function() {
					window.location.href = "/download/" + trackId;
				});
			}
			

			var idownloadBtn = document.getElementById(iteration_downloadId);
			
			if (idownloadBtn) {
				idownloadBtn.addEventListener("click", function() {
					window.location.href += "/" + trackId;
				});
			}

			var voteBtn = document.getElementById(voteId);
			if (voteBtn) {
				voteBtn.addEventListener("click", function() {
					// $(this).html("++");
					xmlHttp = new XMLHttpRequest();
					xmlHttp.open( "POST", "/upvote", false );
				    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); 
				    xmlHttp.send("id=" + trackId);
				    var response = xmlHttp.responseText;
				    console.log(response);

				    var rating = $(this).html();
				    console.log("rating: " + rating);
				    rating = rating.substring(1, rating.length);
				    ratingInt = parseInt(rating) + 1;
				    // console.log(ratingInt);
				    $(this).html("+" + ratingInt);
				    // console.log($(this).html());

				});
			}

			audioTrack.addEventListener('waiting', function() {
				// console.log("It needs to load, just one minute");
				// this.load();
			});                           

			audioTrack.addEventListener('canplay', function(e) {
				console.log("cp");
				console.log($(this));
			});

			audioTrack.addEventListener('stalled', function() {


			});

			audioTrack.addEventListener('ended', function (){
				this.pause();
				
				getTrackId("player-", this, function (trackId) {
					var progressId = "#progress-" + trackId;
					var play = "#play-control-" + trackId;
					var pause = "#play-control-" + trackId;
					$(progressId).css("right", "100%");
					$(this).find(" > .play-control").css("display", "inline-block");
					$(this).find(" > .pause-control").css("display", "none");

				});
			});
			
			audioTrackContainer.addEventListener('dblclick', function(e) {
				var audio = this.getElementsByTagName('audio')[0];
				audio.pause();
				audio.currentTime = 0;
				// console.log("hello");
				$(this).find(" > .play-control").css("display", "inline-block");
				$(this).find(" > .pause-control").css("display", "none");
			}, false);

		});
	}

	$('ul.navbar-right > #logout').click(function() {
		$.post("/logout", function () {

		});
	});

	$("#trackBtn").click(function() {
		$("#track-items").css("display", "block");
		$("#album-items").css("display", "none");
		$("#genre-items").css("display", "none");

		$("#trackBtn").removeClass("cselected").addClass("cselected");
		$("#albumBtn").removeClass("cselected");
		$("#genreBtn").removeClass("cselected");
	});

	$("#albumBtn").click(function() {
		$("#album-items").css("display", "block");
		$("#track-items").css("display", "none");
		$("#genre-items").css("display", "none");

		$("#trackBtn").removeClass("cselected");
		$("#albumBtn").removeClass("cselected").addClass("cselected");
		$("#genreBtn").removeClass("cselected");
	});

	$("#genreBtn").click(function() {
		$("#genre-items").css("display", "block");
		$("#album-items").css("display", "none");
		$("#track-items").css("display", "none");

		$("#trackBtn").removeClass("cselected");
		$("#albumBtn").removeClass("cselected");
		$("#genreBtn").removeClass("cselected").addClass("cselected");
	});

});