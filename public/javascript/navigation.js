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