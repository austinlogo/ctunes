	if ($('.icon')) { 
		var heightStr = $('.icon').css('height');
		var height = parseInt(heightStr.substring(0, heightStr.length - 2));
		$('.icon').css('top', "-" + height/2);
	}