var projects = $(".project-container");
	//the first element is going to be the add button
for (var index = 1; index < projects.length; index++) {
	var project = projects[index];



	getTrackId("container-", project, function (trackId) {
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
	console.log("A");
	console.log(container);
	container.addEventListener("mouseover", function() {
		console.log("EVENT");
		// console.log(this);

		getTrackId("container-", this, function(trackId) {
			// console.log(trackId);
			var id_container = "container-" + trackId;
			var id_div = "iteration-tracks-" + trackId;

			var iteration_tracks = $('.iteration-tracks');
			for (var trackI = 0; trackI < iteration_tracks.length; trackI++) {
				var track = iteration_tracks[trackI];
				
				$(track).removeClass("it-selected");
			}
			$("#" + id_div).addClass("it-selected");
			

		});
	});
	// });
}



function getTrackId (prefix, elt, cb) {
	eltId = elt.id;
	var trackId = eltId.substring(prefix.length, elt.length);

	return cb (trackId);
}

