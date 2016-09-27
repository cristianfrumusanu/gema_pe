$(document).ready(function() {
	if ( isWekbit ) $body.addClass('is--webkit');

	if ( isIE ) $body.addClass('is--ie'); // IE Edge

	if ( isiele10 ) $body.addClass('is--ie-le10');

	bindEvents();
});

function bindEvents() {

	$window.load(onLoad);
	$window.smartresize(onResize);

	$(document.body).on('post-load', function(event, data) {
		$('.infinite-loader').remove();

		// Append the new posts to the grid
		// via Salvattore
		$('.grid').each(function(i, obj) {
			salvattore.appendElements(obj, $(data.html).filter('.grid__item'));
			Grid.alignTitles();
			adjustCardMeta();
		});

		// Clean up the duplicate posts that are appended
		// by default by Jetpack's Infinite Scroll to div#main
		// (and also the corresponding HTML comments)
		$('#main').contents().each(function() {
			if( $(this).is('article') || this.nodeType === Node.COMMENT_NODE )
				$(this).remove();
		});
	});

	/**
	 * Mobile menu, mobile sidebar
	 */
	$('.overlay-toggle').on('touchstart click', function(e) {
		e.preventDefault();
		e.stopPropagation();

		$body.toggleClass('overlay-is-open');

		if ( $body.hasClass('overlay-is-open') ) {
			$body.width($body.width());
			$body.css('overflow', 'hidden');
		} else {
			$body.css('overflow', '');
		}
	});

	$('.menu-toggle').on('touchstart click', function(e) {
		e.preventDefault();
		e.stopPropagation();

		if( $body.hasClass('nav-is-open') ) {
			//closing the menu
			$('.menu-toggle').attr('aria-expanded', 'false');
		} else {
			// opening the menu
			$('.menu-toggle').attr('aria-expanded', 'true');
		}

		$body.toggleClass('nav-is-open');
	});

	$('.sidebar-toggle').on('touchstart click', function(e) {
		e.preventDefault();
		e.stopPropagation();

		if( $body.hasClass('sidebar-is-open') ) {
			//closing the sidebar
			$('.sidebar-toggle').attr('aria-expanded', 'false');
		} else {
			// opening the sidebar
			$('.sidebar-toggle').attr('aria-expanded', 'true');
		}

		$body.toggleClass('sidebar-is-open');
	});

	checkForSmallImageOnSingle();
}

function onLoad() {
	placeSidebar();

	HandleSubmenusOnTouch.init();

	$('ul.nav-menu').ariaNavigation();

	$('.grid, .site-header').css('opacity', 1);

	if ( $body.is('.singular') ) {
		prepareSingle();
	} else {
		prepareArchive();
	}

	adjustCardMeta();
}

function prepareArchive() {
	$('.grid').on("columnsChange", function() {
		Grid.addMargins();
		Grid.alignTitles();
		Logo.init();
		$body.css('opacity', 1);
	});

	$('.grid').each(function(i, obj) {
		salvattore.registerGrid(obj);
	});
}

function prepareSingle() {

	var $mobileHeader = $('.mobile-header-wrapper'),
		scrollTo;

	Logo.init();

	if ( $mobileHeader.is(':visible') ) {
		scrollTo = $('.content-area').offset().top - $mobileHeader.outerHeight();
		setTimeout(function() {
			window.scrollTo(0, scrollTo);
			$body.css('opacity', 1);
		});
	} else {
		$body.css('opacity', 1);
	}
}

$window.on('scroll', function() {
	latestKnownScrollY = $(this).scrollTop();
	requestTick();
});

$window.on('orientationchange', function() {
	$body.removeClass('nav-is-open')
			.removeClass('sidebar-is-open')
			.removeClass('overlay-is-open')
			.css('width', '')
			.css('overflow', '');
})

function requestTick() {
	if (!ticking) {
		requestAnimationFrame(update);
	}
	ticking = true;
}

function update() {
	Logo.update();
	ticking = false;
}

function onResize() {

	var newWidth = $window.outerWidth(),
		newHeight = $window.outerHeight(),
		oldOrientation = windowWidth > windowHeight ? 'landscape' : 'portrait',
		newOrientation = newWidth > newHeight ? 'landscape' : 'portrait';

	windowWidth = newWidth;
	windowHeight = newHeight;

	checkForSmallImageOnSingle();
	placeSidebar();
	Logo.onResize();

	$('.grid').each(function(i, obj) {
		salvattore.rescanMediaQueries(obj);
	});

	adjustCardMeta();


	resizing = false;
}