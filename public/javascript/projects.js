// var projects = $(".project-container");
	//the first element is going to be the add button

$(".project-container").click( function (e) {
	// console.log(e.target);
	if ($(e.target).hasClass("icon")) {
		console.log("hello");
		return;
	}
	else if ($(e.target).hasClass("project-info")) { 
		getTrackId("container-", $(e.target).parent()[0], function (trackId) {
			console.log($(e.target).parent().parent()[0]);
			window.location.href = window.location.href + "/../projects/" + trackId;
		});
	}
	else { 
		getTrackId("container-", $(e.target).parent().parent()[0], function (trackId) {
			console.log($(e.target).parent().parent()[0]);
			window.location.href = window.location.href + "/../projects/" + trackId;
		});
	}
});

$(".prating").click(function (e) {

	getTrackId("upvote-", e.target, function (trackId) {
		var iIndex = trackId.indexOf("i");
		if (iIndex >= 0) {
			trackId = trackId.substring(iIndex + 1, trackId.length);
		}
		
		xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "POST", "/projUpvote", false );
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


var iteration_containers = $('.iteration-container');
// var iteration_tracks = $('.iteration-tracks');

for (var iterationIndex = 0; iterationIndex < iteration_containers.length; iterationIndex++) {
	var iteration = iteration_containers[iterationIndex];
	var container = document.getElementById(iteration.id);

	container.onmouseover= function() {
		console.log('EVENT');

		getProjectTrackId("container-", this, function(trackId) {

			var cl_div = "iteration-" + trackId;

			var iteration_tracks = $(".iteration-tracks > .track-container");
			for (var trackI = 0; trackI < iteration_tracks.length; trackI++) {
				var track = iteration_tracks[trackI];
				
				$(track).removeClass("it-selected");
			}
			$("." + cl_div).addClass("it-selected");
		});
	};
}

function getProjectTrackId (prefix, elt, cb) {
	eltId = elt.id;
	var trackId = eltId.substring(prefix.length, eltId.length - 1);

	return cb (trackId);
}

function validateIteration() {
	// var f = document.forms['uploadIteration']['iteration_title'];
	// alert(f);
	// var bad = false;
	// if (f.value == null || f.value == "") {
	// 	alert(f);
	// 	$(f).css("border", "1px #F00 solid");
	// 	alert("4");
	// 	bad = true;
	// }

	f = document.forms['uploadIteration']['file'];
	if (f.value == null || f.value == "") {
		alert("5")
		$(f).css("border", "1px #F00 solid");
		alert("6");
		bad = true;
	}

	return bad ? false : true;
}