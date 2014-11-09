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

