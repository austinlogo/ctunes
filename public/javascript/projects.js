var projects = $(".project-container");
	//the first element is going to be the add button
for (var index = 1; index < projects.length; index++) {
	var project = projects[index];



	getProjectTrackId("container-", project, function (trackId) {
		var downloadId = "download-" + trackId;
		var voteId = "upvote-" + trackId;



		$(project).click(function() {
			window.location.href = window.location.href + "/" + trackId;
		});

		console.log(trackId);
		console.log(project);

		var voteBtn = document.getElementById(voteId);
		voteBtn.addEventListener("click", function() {
			// console.log("vote: " + voteId);
		});
	});


}

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
	var f = document.forms['uploadIteration']['iteration_title'];
	alert(f);
	var bad = false;
	if (f.value == null || f.value == "") {
		alert(f);
		$(f).css("border", "1px #F00 solid");
		alert("4");
		bad = true;
	}

	f = document.forms['uploadIteration']['file'];
	if (f.value == null || f.value == "") {
		alert("5")
		$(f).css("border", "1px #F00 solid");
		alert("6");
		bad = true;
	}

	bad ? return false : return true;
}