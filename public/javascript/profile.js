
$(document).ready( function () {

	var DELAY = 600,
	    clicks = 0,
	    timer = null;

	$("div.track-container").click( function (e) {
		if ( $(e.target).hasClass('icon'))
			return;

		// if (clicks++ == 1) {
		// 		var audio = this.getElementsByTagName('audio')[0];
		// 		audio.pause();
		// 		audio.currentTime = 0;
		// 		clicks = 0;
		// 		return;
		// }

		// timer = setTimeout(function() {
  //           clicks = 0;
  //           console.log("RESET");
  //       }, DELAY);

		var button = $(this).find(" > .playback-control");
		var css = button.css("background");	
		var str = "container-";
		var divId = $(this).attr('id');
		var trackId = divId.substring(str.length, divId.length);
		var playerId = "player-" + trackId;
		var progressId = "progress-" + trackId;
		var audioDiv = document.getElementById(playerId);

		// console.log(css.indexOf("play.png"));
		if ( css.indexOf("play.png") > -1) {
			console.log("playing");
			$(this).find(" > .playback-control").css("background", "url('/images/pause.png') no-repeat center center");
			audioDiv.play();
		}
		else {
			console.log("pausing");
			$(this).find(" > .playback-control").css("background", "url('/images/play.png') no-repeat center center");			
			audioDiv.pause();
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

			audioTrack.addEventListener('ended', function (){
				this.pause();
				
				getTrackId("player-", this, function (trackId) {
					var progressId = "#progress-" + trackId;
					var playback = "#playback-control-" + trackId;
					$(progressId).css("right", "100%");
					$(playback).css("background", "url('/images/play.png') no-repeat center center");

				});
			});
			
			audioTrackContainer.addEventListener('dblclick', function(e) {
				var audio = this.getElementsByTagName('audio')[0];
				audio.pause();
				audio.currentTime = 0;
				console.log("hello");
				$(this).find(" > .playback-control").css("background", "url('/images/play.png') no-repeat center center");
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

function getTrackId (prefix, elt, cb) {
	eltId = elt.id;
	var trackId = eltId.substring(prefix.length, elt.length);

	return cb (trackId);

//category navigation



} //document ready