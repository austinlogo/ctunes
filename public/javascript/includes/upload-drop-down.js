	$("#upload-drop-down").click(function () {
		$("#upload").css("display", "block");
		$(".content").css("-webkit-filter", "blur(10px)");	
		$('.mask').css("background", "rgba(0,0,0, .9");
	});


	//ITERATION UPLOAD LOGIC
	$("#upload-drop-down-iteration").click(function () {
		$("#upload-iteration").css("display", "block");
		$(".content").css("-webkit-filter", "blur(10px)");	
		$('.mask').css("background", "rgba(0,0,0, .9");

		var id_r 	= /.*\/projects\/(.*)/;
		var user_r	= /.*\/(.*)\/projects\/.*/;
		var user 	= user_r.exec(window.location.href)[1];
		var num 	= id_r.exec(window.location.href)[1];

		console.log(user);
		console.log(num);
		xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "POST", "/projects/upload-iteration", false ); //false makes this synchronous
	    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); 
	    xmlHttp.send("id=" + num + "&user=" + user);
	    var response = xmlHttp.responseText;
	    response = JSON.parse(response);

	    //populate user
	    var blacklist = [];
	    var insert = "<h2>Included Project Tracks</h2>\n";
	    
	    //projects
	    for (var i = 0; i < response.project.length; i++) {
	    	var item = response.project[i];
	    	
	    	insert += "<div>";
	    	insert += "<input type='checkbox' name='tracks' id='" + item.id + "i' value='"+ item.id +"'>";
	    	insert += "<label for='"+ item.id +"'>" +item.title + "</label>";
	    	insert += "</div>\n";
	    }

	   	$('#project-checkbox').html(insert);

	   	insert = "<h2>Included Raw Tracks</h2>\n";
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
	    	insert += "<label for='"+ item.id +"'>" +item.title + "</label>";
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
	});

	$("#upload-back-iteration").click(function () {
		$('#upload-iteration').css("display", "none");
		$(".content").css("-webkit-filter", "blur(0px)");
		$('.mask').css("background", "rgba(0,0,0, .6");
	});
