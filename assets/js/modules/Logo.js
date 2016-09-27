window.Logo = (function($, undefined) {

    var $header = $('.header'),
        $logo = $('.site-branding'),
        $clone,
        distance,
        initialized = false;

    function init() {
        prepareAnimation();
        updateAnimation();
        offsetFirstColumn();
    }

    function onResize() {
        resizeTitle();
        offsetFirstColumn();
    }

    function prepareAnimation() {

        if ($logo.length && !initialized) {

            if ($clone === undefined) {
                $clone = $logo.clone().appendTo('.mobile-logo');
            } else {
                $clone.removeAttr('style');
            }

            onResize();

            var cloneOffset     = $clone.offset(),
                cloneTop        = cloneOffset.top,
                cloneHeight     = $clone.height(),
                cloneMid        = cloneTop + cloneHeight / 2,
                headerOffset    = $header.offset(),
                headerHeight    = $header.outerHeight(),
                headerMid       = headerHeight / 2,
                logoOffset      = $logo.offset(),
                logoTop         = logoOffset.top,
                logoWidth       = $logo.width(),
                logoHeight      = $logo.height(),
                logoMid         = logoTop + logoHeight / 2;

            distance = latestKnownScrollY + logoMid - cloneMid;

            translateY($clone, distance);
            $clone.css('opacity', 1);

            initialized = true;
        }
    }

    function translateY($element, distance) {
        $element.css({
            "webkitTransform": "translateY("+distance+"px)",
            "MozTransform": "translateY("+distance+"px)",
            "msTransform": "translateY("+distance+"px)",
            "OTransform": "translateY("+distance+"px)",
            "transform": "translateY("+distance+"px)"
        });
    }

    function updateAnimation() {

        if (!initialized) {
            return;
        }

        if (distance < latestKnownScrollY) {
            translateY($clone, 0);
            return;
        }

        translateY($clone, distance - latestKnownScrollY);
    }

    function resizeTitle() {

        $('.site-title').each(function(i, obj) {
            var $title          = $(obj).removeAttr('style').css('fontSize', ''),
                $branding       = $title.closest('.site-branding'),
                $span           = $title.find('span'),
                titleWidth      = $title.width(),
                brandingHeight  = $branding.outerHeight(),
                spanWidth       = $span.width(),
                spanHeight      = $span.height(),
                fontSize        = parseInt($title.css('font-size', '').css('font-size')),
                scaling         = spanWidth / parseFloat(titleWidth),
                maxLines        = $body.is('.singular') ? 3 : 2;

            /* if site title is too long use a smaller font size */
            if (spanWidth > titleWidth) {
                fontSize = parseInt(fontSize / scaling);
                $title.css('fontSize', fontSize);
            }

            var titleHeight = $title.outerHeight();

            if ( $title.closest('.mobile-logo').length ) {
                var mobileHeight = $('.mobile-logo').outerHeight();
                fontSize = parseInt(fontSize * mobileHeight / titleHeight);
                if ( mobileHeight < titleHeight ) {
                    $title.css('fontSize', fontSize);
                }
                return;
            }

            brandingHeight = $branding.outerHeight();

            /* if site title is too long use a smaller font size */
            if (brandingHeight < titleHeight) {
                fontSize = parseInt(fontSize * brandingHeight / titleHeight);
                $title.css('fontSize', fontSize);
                return;
            }

            /* if site title is too tall, again, use a smaller font size */
            var lineHeight = parseFloat($title.css('lineHeight')) / fontSize,
                lines = titleHeight / (fontSize * lineHeight);

            while (lines > maxLines) {
                fontSize = fontSize - 1;
                $title.css('fontSize', fontSize);
                titleHeight = $title.outerHeight();
                lines = titleHeight / (fontSize * lineHeight);
            }
        });

        $('.archive-title').each(function(i, obj) {
            var $title          = $(obj).removeAttr('style').css('fontSize', ''),
                fontSize        = parseInt($title.css('font-size')),
                $span           = $title.find('span'),
                titleWidth      = $title.width(),
                spanWidth       = $span.width(),
                spanHeight      = $span.height(),
                scaling         = spanWidth / parseFloat(titleWidth);

            /* if site title is too long use a smaller font size */
            if (spanWidth > titleWidth) {
                fontSize = parseInt(fontSize / scaling);
                $title.css('fontSize', fontSize);
            }
        });
    }

    function offsetFirstColumn() {
        var $columns = $('.column');
        if ( $columns.length > 1 ) {
            var height = $('.header .site-branding').outerHeight();
            $columns.css('marginTop', '').eq(1).css('marginTop', height);
        }
    }

    return {
        init: init,
        update: updateAnimation,
        onResize: onResize
    }

})(jQuery);