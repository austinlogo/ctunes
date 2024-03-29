$(".upload-drop-down").click(function () {
	$("#upload").css("display", "block");
	$(".content").css("-webkit-filter", "blur(10px)");	
	$('.mask').css("background", "rgba(0,0,0, .9");
	$('body').css("overflow", "hidden");
});


//ITERATION UPLOAD LOGIC
$("#upload-drop-down-iteration").click(function () {
	$("#upload-iteration").css("display", "block");
	$(".content").css("-webkit-filter", "blur(10px)");	
	$('.mask').css("background", "rgba(0,0,0, .9");
	$('body').css("overflow", "hidden");


	var id_reg		= /.*\/projects\/(.*)/;
	var user_reg	= /.*\/(.*)\/projects\/.*/;
	var user 		= user_reg.exec(window.location.href)[1];
	var num 		= id_reg.exec(window.location.href)[1];

	console.log("user: " + user);
	console.log("num: " + num);
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "POST", "/projects/upload-iteration", false ); //false makes this synchronous
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); 
    xmlHttp.send("id=" + num + "&user=" + user);
    // xmlHttp.send("id=2&user=austinlg");

    var response = xmlHttp.responseText;
    response = JSON.parse(response);

    //populate user
    var blacklist = [];
    var insert = "<h2>Iterations</h2>\n";
    
    //projects
    for (var i = 0; i < response.project.length; i++) {
    	var item = response.project[i];
    	
    	insert += "<div>";
    	insert += "<input type='checkbox' name='iterations' id='" + item.id + "i' value='"+ item.id +"'>";
    	insert += "<label class='checkbox-label' for='"+ item.id +"i'>" +item.title + "</label>";
    	insert += "</div>\n";
    }

   	$('#project-checkbox').html(insert);

   	insert = "<h2>Raw</h2>\n";
    //user library
    for (var i = 0; i < response.user.length; i++) {
    	var item = response.user[i];
    	if (blacklist.indexOf(item.id) < 0) {
    		blacklist.push(item.id);
    	}
    	else {
    		continue;
    	}

    	insert += "<div>";
    	insert += "<input type='checkbox' name='tracks' id='" + item.id + "' value='"+ item.id +"'>";
    	insert += "<label class='checkbox-label' for='"+ item.id +"'>" +item.title + "</label>";
    	insert += "</div>\n";
    }
    // $('#user-checkbox').html(insert);

    //populate project
    // insert ="<h2>Project</h2>\n";
	


	    $('#user-checkbox').html(insert);


});

$("#upload-back").click(function () {
	$('#upload').css("display", "none");
	$('#upload-iteration').css("display", "none");
	$(".content").css("-webkit-filter", "blur(0px)");
	$('.mask').css("background", "rgba(0,0,0, .6");
	$('body').css("overflow-y", "scroll");
});

$("#upload-back-iteration").click(function () {
	$('#upload-iteration').css("display", "none");
	$(".content").css("-webkit-filter", "blur(0px)");
	$('.mask').css("background", "rgba(0,0,0, .6");
	$('body').css("overflow-y", "scroll");
});

function updateValidate() {
	var id = document.forms['trackSubmit']['id'].value;
	var f = document.forms['trackSubmit']['album'];

	if (f.value == null || f.value == "") {
		$('#album').attr('value', $("#" + id).children('.track-album').html());
	}

	f = document.forms['trackSubmit']['genre'];
	if (f.value == null || f.value =="") {
		$('#genre').attr('value', $("#" + id).children('.track-genre').html());
	}
}

function trackValidate() {
	var f = document.forms['trackSubmit']['album'];
	var bad = false;
	// console.log("1");
	if (f.value == null || f.value == "") {
		$(f).css("border", "1px #F00 solid");
		bad = true;
	}
	// console.log("1");
	f = document.forms['trackSubmit']['genre'];
	if (f.value == null || f.value == "") {
		$(f).css("border", "1px #F00 solid");
		bad = true;
	}

	f = document.forms['trackSubmit']['file'];
	if (f.value == null || f.value == "") {
		$(f).css("border", "1px #F00 solid");
		bad = true;
	}
	var extension = f.value.substring(f.value.length - 4, f.value.length);
	if (extension != ".mp3" && extension != ".wav" ) {
		$(f).css("border", "1px #F00 solid");
		bad = true;
	}

	// if (!bad) $('#loading-icon').css("display", "block");

	return !bad;
}