$(document).ready(function(){

	$('a').click(function() { 
		var target = $(this).attr('href');
		target = '#' + target.substring(3, target.length);

			$('html, body').animate({ 
				scrollTop: $(target).offset().top
			}, 
			1000);
			return;
	});

	var position = 0;
	$(window).scroll( function() { 
	
		if ($(this).scrollTop() < $('#who').offset().top) { 
			
			$('.navbar-main').css('opacity', '0');
			$('.navbar-main').css('visibility', 'hidden');
		}
		else {
			$('.navbar-main').css('visibility', 'visible');
			$('.navbar-main').css('opacity', '1');
		
		}
	});
});