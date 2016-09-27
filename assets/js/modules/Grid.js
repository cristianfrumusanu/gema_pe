
var Grid = (function() {

	function alignTitles() {
	    $('.card-title-wrap').each(function(i, obj) {
	        var $title = $(obj);
	        $title.closest('.card__wrap').css('paddingBottom', $title.outerHeight() * 0.5);
	    });
	}

	function addMargins() {

		var $columns = $('.column'),
			$compare;

		$('.grid__item--mb').removeClass('grid__item--mb');

		$columns.each(function(i, column) {
			var $column = $(column);

			if (i % 2 == 1) {

				$column.children('.entry-card--portrait, .entry-card--text').each(function(j, obj) {
					var $obj = $(obj);

					if ( $obj.is(':nth-child(2n+1)') ) {
						$compare = $columns.eq(i - 1);
					} else {
						$compare = $columns.eq(i + 1);
					}

					if (typeof $compare == "undefined") {
						return;
					}

					var bottom = $obj.offset().top + $obj.outerHeight(),
						$neighbour;

					$compare.children().each(function (j, item) {
						var $item 		= $(item),
							thisBottom 	= $(item).offset().top + $(item).outerHeight();

						if ( thisBottom < bottom ) {
							$neighbour = $item;
						} else {
							return false;
						}
					});

					if (typeof $neighbour !== "undefined") {
						$neighbour.addClass('grid__item--mb');
					}
				});
			}
		});
	}

	return {
		alignTitles: alignTitles,
		addMargins: addMargins
	}

})();