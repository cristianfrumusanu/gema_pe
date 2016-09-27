// /* ====== Sidebar Placing Logic ====== */
function placeSidebar() {

	if( ! $body.hasClass('singular') ) return;

	if ( windowWidth > 900 ) {
		var $sidebar = $('.widget-area');

		if ( ! $sidebar.length ) {
			return;
		}

		if ( $body.hasClass('no-featured-image') ) {
			$sidebar.addClass('is--placed').css( 'top', $('.site-main').css('padding-top') );
		} else {
			// If we are past the breakpoint
			var $featuredImage = $('.entry-featured'),
				featuredImageBottom = $featuredImage.height() + parseInt($featuredImage.css('margin-bottom'), 10);
			// position: absolute; on the sidebar(via ".is--placed")
			// below the featured image;
			if ( ! $body.hasClass('has--small-featured-image') )
				$sidebar.addClass('is--placed').css( 'top', featuredImageBottom );
			else
				$sidebar.addClass('is--placed').css( 'top', 108 );
		}

		// and set a height on the content so that everything seems in place.
		$('.content-area').css( "minHeight", $sidebar.offset().top + $sidebar.height() );


	} else {
		// Remove the height (possibly) set above.
		$('.content-area').removeAttr('style');

	}
}

var HandleSubmenusOnTouch = (function() {

	var $theUsualSuspects,
		$theUsualAnchors,
		initialInit = false;

	function init() {
		if( initialInit || !isTouchDevice ) return;

		$theUsualSuspects = $('li[class*=children]').removeClass('hover');
		$theUsualAnchors = $theUsualSuspects.find('> a');

		unbind();

		$theUsualAnchors.on('click', function (e) {
			e.preventDefault();
			e.stopPropagation();

			if( $(this).hasClass('active') ) {
				window.location.href = $(this).attr('href');
			}

			$theUsualAnchors.removeClass('active');
			$(this).addClass('active');

			// When a parent menu item is activated,
			// close other menu items on the same level
			$(this).parent().siblings().removeClass('hover');

			// Open the sub menu of this parent item
			$(this).parent().addClass('hover');
		});

		bindOuterNavClick();

		initialInit = true;
	}

	function unbind() {
		$theUsualAnchors.unbind();
		isHorizontalInitiated = false;
	}

	// When a sub menu is open, close it by a touch on
	// any other part of the viewport than navigation.
	// use case: normal, horizontal menu, touch events,
	// sub menus are not visible.
	function bindOuterNavClick() {
		$body.on('touchstart', function (e) {
			var container = $('.main-navigation');

			if (!container.is(e.target) // if the target of the click isn't the container...
					&& container.has(e.target).length === 0) // ... nor a descendant of the container
			{
				$theUsualSuspects.removeClass('hover').removeClass('active');
			}
		});
	}

	return {
		init: init
	}
}());

function checkForSmallImageOnSingle() {
	if( ! $body.hasClass('singular') || $body.hasClass('no-featured-image') ) return;

	if ( windowWidth > 900 ) {
		if( $('.entry-featured img').width() < 600 ) {
			$body.addClass('has--small-featured-image');
			$('.post__content').css('paddingTop', $('.entry-featured').height() + 30);
		}
	} else {
		$('.post__content').removeAttr('style');
	}
}

function adjustCardMeta() {
	if ( $body.is('.singular') || windowWidth < 480 ) {
		$('.card__meta').attr('style', '');
	} else {
		$('.card--image').each( function(i, obj) {
			var $cardMeta = $(obj).find('.card__meta');
			$cardMeta.css('marginTop', - ( $cardMeta.height() ) );
		});
	}

}