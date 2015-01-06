$('ul.navbar-right > #logout').click(function() {
	$.post("/logout", function () {

	});
});

$("#trackBtn").click(function() {
	$("#track-items").css("display", "block");
	$("#album-items").css("display", "none");
	$("#artist-items").css("display", "none");
	$("#genre-items").css("display", "none");
	$("#project-items").css("display", "none");

	$("#trackBtn").removeClass("cselected").addClass("cselected");
	$("#albumBtn").removeClass("cselected");
	$("#genreBtn").removeClass("cselected");
	$("#projectBtn").removeClass("cselected");
	$("#artistBtn").removeClass("cselected");
});

$("#albumBtn").click(function() {
	$("#album-items").css("display", "block");
	$("#track-items").css("display", "none");
	$("#artist-items").css("display", "none");
	$("#genre-items").css("display", "none");
	$("#project-items").css("display", "none");

	$("#trackBtn").removeClass("cselected");
	$("#albumBtn").removeClass("cselected").addClass("cselected");
	$("#genreBtn").removeClass("cselected");
	$("#projectBtn").removeClass("cselected");
	$("#artistBtn").removeClass("cselected");
});

$("#genreBtn").click(function() {
	$("#genre-items").css("display", "block");
	$("#artist-items").css("display", "none");
	$("#album-items").css("display", "none");
	$("#track-items").css("display", "none");
	$("#project-items").css("display", "none");

	$("#trackBtn").removeClass("cselected");
	$("#albumBtn").removeClass("cselected");
	$("#genreBtn").removeClass("cselected").addClass("cselected");
	$("#projectBtn").removeClass("cselected");
	$("#artistBtn").removeClass("cselected");
});

$("#projectBtn").click(function() {
	$("#project-items").css("display", "block");	
	$("#genre-items").css("display", "none");
	$("#artist-items").css("display", "none");
	$("#album-items").css("display", "none");
	$("#track-items").css("display", "none");

	$("#trackBtn").removeClass("cselected");
	$("#albumBtn").removeClass("cselected");
	$("#genreBtn").removeClass("cselected");
	$("#projectBtn").removeClass("cselected").addClass("cselected");
	$("#artistBtn").removeClass("cselected");
});

$("#artistBtn").click(function() {
	$("#project-items").css("display", "none");	
	$("#genre-items").css("display", "none");
	$("#artist-items").css("display", "block");
	$("#album-items").css("display", "none");
	$("#track-items").css("display", "none");

	$("#trackBtn").removeClass("cselected");
	$("#albumBtn").removeClass("cselected");
	$("#genreBtn").removeClass("cselected");
	$("#projectBtn").removeClass("cselected");
	$("#artistBtn").removeClass("cselected").addClass("cselected");;
});
