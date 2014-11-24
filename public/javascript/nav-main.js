$("#search").children("input").keypress(function() {
    request(this);
});

$('#search').focusin(function() {
    
    $(".search-results").css("display", "block");
});

$('.search-item').focusin(function() {
    console.log('focusin');
});

$('#search').focusout(function() {
    $(".search-results").css("display", "none");
});

$('.search-results').click(function(e) {
    var div = e.target;
    console.log (e.target);

    if ($(e.target).hasClass('user-result') || $(e.target).hasClass('user-text') ) {
        var str = "" + "/" + $(e.target).html();
        window.location.href = str;
    } else if ($(e.target).hasClass('track-result') || $(e.target).hasClass('track-text') )  {
        window.location.href = "/" + e.target.id + "/tracks";
    } else
        window.location.href = "/" + e.target.id;

    console.log(e.target.id)
});

function request(caller) {

    var bg_img = "background-image: url(\"/content/common/download.png\")";

    var text = caller.value;
    var sendJson = {"query": text};
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "POST", "/search", false );
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); 
    xmlHttp.send("query=" + text);
    var response = xmlHttp.responseText;
    response = JSON.parse(response);
    var insert = "";//$('#search').html();

// POST REQUEST HAS RESPONDED FROM SERVER NOW WE START FORMATTING THE INFORMATION

    var i = 0, j = 0;
    for (var i = 0; i < response.users.length; i++) {
        insert +=   "<div tabindex='" + (i + 1) + "' class='search-item user-result' id='"+response.users[i].user+"'> " + 
                        "<div class='profile-pic' style='background-image: url(\""+ response.users[i].pic +"\")' />" + 
                        "<div class='user-text'>" + response.users[i].user + "</div>" + 
                    "</div>\n";

    }

    for (var j = 0; j < response.tracks.length; j++) {
        insert +=   "<div tabindex='" + (i + j + 1) + "' class='search-item track-result' id='"+ response.tracks[j].artist +"'>" + 
                    "<div class='track-text' id='"+ response.tracks[j].artist +"' >" + response.tracks[j].title + "</div>" +
                    "</div>\n";
    }

    for (var k = 0; k < response.projects.length; k++) {
        var id = "" + response.projects[k].creator + "/projects/" + response.projects[k].id;
        insert +=   "<div tabindex='" + (i + j + k + 1) + "' class='search-item project-result' id='"+ id +"'>" + 
                    "<div class='project-text' id='"+ id +"' >" + response.projects[k].title + "</div>" +
                    "</div>\n";
    }
    // console.log(insert);
    $('.search-results').html(insert);
}



