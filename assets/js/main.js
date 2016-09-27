/**
 * jQuery plugin to make the main navigation WAI-ARIA compatible
 * Inspired by http://simplyaccessible.com/examples/css-menu/option-6/
 *
 * It needs jquery.hoverIntent
 */
(function($) {

    $.fn.ariaNavigation = function(settings) {

        //Map of all the alphanumeric keys so one can jump through submenus by typing the first letter
        //Also use the ESC key to close a submenu
        var keyCodeMap = {
                48: "0",
                49: "1",
                50: "2",
                51: "3",
                52: "4",
                53: "5",
                54: "6",
                55: "7",
                56: "8",
                57: "9",
                59: ";",
                65: "a",
                66: "b",
                67: "c",
                68: "d",
                69: "e",
                70: "f",
                71: "g",
                72: "h",
                73: "i",
                74: "j",
                75: "k",
                76: "l",
                77: "m",
                78: "n",
                79: "o",
                80: "p",
                81: "q",
                82: "r",
                83: "s",
                84: "t",
                85: "u",
                86: "v",
                87: "w",
                88: "x",
                89: "y",
                90: "z",
                96: "0",
                97: "1",
                98: "2",
                99: "3",
                100: "4",
                101: "5",
                102: "6",
                103: "7",
                104: "8",
                105: "9"
            },
            $nav = $(this),
            $allLinks = $nav.find('li.menu-item > a, li.page_item > a'),
            $topLevelLinks = $nav.find('> li > a'),
            subLevelLinks = $topLevelLinks.parent('li').find('ul').find('a');
        navWidth = $nav.outerWidth();

        //default settings
        settings = jQuery.extend({
            menuHoverClass: 'show-menu',
            topMenuHoverClass: 'hover'
        }, settings);


        /**
         *  First add the needed WAI-ARIA markup - supercharge the menu
         */

        // Add ARIA role to menubar and menu items
        //$nav.find( 'li' ).attr( 'role', 'menuitem' );

        $topLevelLinks.each(function() {
            //for regular sub-menus
            // Set tabIndex to -1 so that links can't receive focus until menu is open
            $(this).next('ul')
                .attr({
                    'aria-hidden': 'true',
                    'role': 'menu'
                })
                .find('a')
                .attr('tabIndex', -1);

            // Add aria-haspopup for appropriate items
            if ($(this).next('ul').length > 0) {
                $(this).parent('li').attr('aria-haspopup', 'true');
            }

            // Set tabIndex to -1 so that links can't receive focus until menu is open
            $(this).next('.menu-item-has-children').children('ul')
                .attr({
                    'aria-hidden': 'true',
                    'role': 'menu'
                })
                .find('a').attr('tabIndex', -1);

            $(this).next('.menu-item-has-children')
                .find('a').attr('tabIndex', -1);

            // Add aria-haspopup for appropriate items
            if ($(this).next('.sub-menu').length > 0)
                $(this).parent('li').attr('aria-haspopup', 'true');

            // Set tabIndex to -1 so that links can't receive focus until menu is open
            $(this).next('.page_item_has_children').children('ul')
                .attr({
                    'aria-hidden': 'true',
                    'role': 'menu'
                })
                .find('a').attr('tabIndex', -1);

            $(this).next('.page_item_has_children')
                .find('a').attr('tabIndex', -1);

            // Add aria-haspopup for appropriate items
            if ($(this).next('.children').length > 0)
                $(this).parent('li').attr('aria-haspopup', 'true');
        });


        /**
         * Now let's begin binding things to their proper events
         */

        // First, bind to the hover event
        // use hoverIntent to make sure we avoid flicker
        $allLinks.closest('li').hoverIntent({
            over: function() {
                //clean up first
                $(this).closest('ul')
                    .find('ul.' + settings.menuHoverClass)
                    .attr('aria-hidden', 'true')
                    .removeClass(settings.menuHoverClass)
                    .find('a')
                    .attr('tabIndex', -1);

                $(this).closest('ul')
                    .find('.' + settings.topMenuHoverClass)
                    .removeClass(settings.topMenuHoverClass);

                //now do things
                showSubMenu($(this));

            },
            out: function() {
                hideSubMenu($(this));
            },
            timeout: 10
        });

        // Secondly, bind to the focus event - very important for WAI-ARIA purposes
        $allLinks.focus(function() {
            //clean up first
            $(this).closest('ul')
                .find('ul.' + settings.menuHoverClass)
                .attr('aria-hidden', 'true')
                .removeClass(settings.menuHoverClass)
                .find('a')
                .attr('tabIndex', -1);

            $(this).closest('ul')
                .find('.' + settings.topMenuHoverClass)
                .removeClass(settings.topMenuHoverClass);

            //now do things
            showSubMenu($(this).closest('li'));

        });


        // Now bind arrow keys for navigating the menu

        // First the top level links (the permanent visible links)
        $topLevelLinks.keydown(function(e) {
            var $item = $(this);

            if (e.keyCode == 37) { //left arrow
                e.preventDefault();
                // This is the first item
                if ($item.parent('li').prev('li').length == 0) {
                    $item.parents('ul').find('> li').last().find('a').first().focus();
                } else {
                    $item.parent('li').prev('li').find('a').first().focus();
                }
            } else if (e.keyCode == 38) { //up arrow
                e.preventDefault();
                if ($item.parent('li').find('ul').length > 0) {
                    $item.parent('li').find('ul')
                        .attr('aria-hidden', 'false')
                        .addClass(settings.menuHoverClass)
                        .find('a').attr('tabIndex', 0)
                        .last().focus();
                }
            } else if (e.keyCode == 39) { //right arrow
                e.preventDefault();

                // This is the last item
                if ($item.parent('li').next('li').length == 0) {
                    $item.parents('ul').find('> li').first().find('a').first().focus();
                } else {
                    $item.parent('li').next('li').find('a').first().focus();
                }
            } else if (e.keyCode == 40) { //down arrow
                e.preventDefault();
                if ($item.parent('li').find('ul').length > 0) {
                    $item.parent('li').find('ul')
                        .attr('aria-hidden', 'false')
                        .addClass(settings.menuHoverClass)
                        .find('a').attr('tabIndex', 0)
                        .first().focus();
                }
            } else if (e.keyCode == 32) { //space key
                // If submenu is hidden, open it
                e.preventDefault();
                $item.parent('li').find('ul[aria-hidden=true]')
                    .attr('aria-hidden', 'false')
                    .addClass(settings.menuHoverClass)
                    .find('a').attr('tabIndex', 0)
                    .first().focus();
            } else if (e.keyCode == 27) { //escape key
                e.preventDefault();
                $('.' + settings.menuHoverClass)
                    .attr('aria-hidden', 'true')
                    .removeClass(settings.menuHoverClass)
                    .find('a')
                    .attr('tabIndex', -1);
            } else { //cycle through the child submenu items based on the first letter
                $item.parent('li').find('ul[aria-hidden=false] > li > a').each(function() {
                    if ($(this).text().substring(0, 1).toLowerCase() == keyCodeMap[e.keyCode]) {
                        $(this).focus();
                        return false;
                    }
                });
            }
        });

        // Now do the keys bind for the submenus links
        $(subLevelLinks).keydown(function(e) {
            var $item = $(this);

            if (e.keyCode == 38) { //up arrow
                e.preventDefault();
                // This is the first item
                if ($item.parent('li').prev('li').length == 0) {
                    $item.parents('ul').parents('li').find('a').first().focus();
                } else {
                    $item.parent('li').prev('li').find('a').first().focus();
                }
            } else if (e.keyCode == 39) { //right arrow
                e.preventDefault();

                //if it has sub-menus we should go into them
                if ($item.parent('li').hasClass('menu-item-has-children')) {
                    $item.next('ul').find('> li').first().find('a').first().focus();
                } else {
                    // This is the last item
                    if ($item.parent('li').next('li').length == 0) {
                        $item.closest('ul').closest('li').children('a').first().focus();
                    } else {
                        $item.parent('li').next('li').find('a').first().focus();
                    }
                }
            } else if (e.keyCode == 40) { //down arrow
                e.preventDefault();

                // This is the last item
                if ($item.parent('li').next('li').length == 0) {
                    $item.closest('ul').closest('li').children('a').first().focus();
                } else {
                    $item.parent('li').next('li').find('a').first().focus();
                }
            } else if (e.keyCode == 27 || e.keyCode == 37) { //escape key or left arrow => jump to the upper level links
                e.preventDefault();

                //focus on the upper level link
                $item.closest('ul').closest('li')
                    .children('a').first().focus();

            } else if (e.keyCode == 32) { //space key
                e.preventDefault();
                window.location = $item.attr('href');
            } else {

                //cycle through the menu items based on the first letter
                var found = false;
                $item.parent('li').nextAll('li').find('a').each(function() {
                    if ($(this).text().substring(0, 1).toLowerCase() == keyCodeMap[e.keyCode]) {
                        $(this).focus();
                        found = true;
                        return false;
                    }
                });

                if (!found) {
                    $item.parent('li').prevAll('li').find('a').each(function() {
                        if ($(this).text().substring(0, 1).toLowerCase() == keyCodeMap[e.keyCode]) {
                            $(this).focus();
                            return false;
                        }
                    });
                }
            }
        });


        // Hide menu if click or focus occurs outside of navigation
        $nav.find('a').last().keydown(function(e) {
            if (e.keyCode == 9) { //tab key
                // If the user tabs out of the navigation hide all menus
                hideSubMenus();
            }
        });

        //close all menus when pressing ESC key
        $(document).keydown(function(e) {
            if (e.keyCode == 27) { //esc key
                hideSubMenus();
            }
        });

        //close all menus on click outside
        $(document).click(function() {
            hideSubMenus();
        });

        $nav.on('click touchstart', function(e) {
            e.stopPropagation();
        });

        $nav.find('.menu-item-has-children > a, .page_item_has_children > a').on('touchstart', function(e) {

            var $item = $(this).parent();

            if (!$item.hasClass('hover')) {
                e.preventDefault();
                $item.addClass('hover');
                $item.siblings().removeClass('hover');
                return;
            } else {
                // $item.removeClass("hover");
            }

        });

        function getIOSVersion(ua) {
            ua = ua || navigator.userAgent;
            return parseFloat(
                ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(ua) || [0, ''])[1])
                .replace('undefined', '3_2').replace('_', '.').replace('_', '')
            ) || false;
        }

        if (getIOSVersion()) {
            $nav.find('.menu-item--no-children > a').on('hover', function(e) {
                var el = $(this);
                var link = el.attr('href');
                window.location = link;
            });
        }

        $('body').on('touchstart', function() {
            $('.menu-item-has-children').removeClass('hover');
            $('.page_item_has_children').removeClass('hover');
        });

        function showSubMenu($item) {

            $item.addClass(settings.topMenuHoverClass);

            $item.find('.sub-menu, .children').first() //affect only the first ul found - the one with the submenus, ignore the mega menu items
                .attr('aria-hidden', 'false')
                .addClass(settings.menuHoverClass);

            $item.find('a').attr('tabIndex', 0); //set the tabIndex to 0 so we let the browser figure out the tab order

        }

        function hideSubMenu($item) {

            if ($item.hasClass('menu-item-has-children')) {
                $item.children('.sub-menu').css('left', '');
            }

            if ($item.hasClass('page_item_has_children')) {
                $item.children('.children').css('left', '');
            }

            $item.children('a').first().next('ul')
                .attr('aria-hidden', 'true')
                .removeClass(settings.menuHoverClass)
                .find('a')
                .attr('tabIndex', -1);

            //when dealing with first level submenus - they are wrapped
            $item.children('a').first().next('.sub-menu')
                .attr('aria-hidden', 'true')
                .removeClass(settings.menuHoverClass)
                .find('a')
                .attr('tabIndex', -1);

            $item.children('a').first().next('.children')
                .attr('aria-hidden', 'true')
                .removeClass(settings.menuHoverClass)
                .find('a')
                .attr('tabIndex', -1);

            $item.removeClass(settings.topMenuHoverClass);
        }

        function hideSubMenus() {

            $('.' + settings.menuHoverClass)
                .attr('aria-hidden', 'true')
                .removeClass(settings.menuHoverClass)
                .find('a')
                .attr('tabIndex', -1);

            $('.' + settings.topMenuHoverClass).removeClass(settings.topMenuHoverClass);

        }
    }

})(jQuery);
/*!
 * hoverIntent v1.8.0 // 2014.06.29 // jQuery v1.9.1+
 * http://cherne.net/brian/resources/jquery.hoverIntent.html
 *
 * You may use hoverIntent under the terms of the MIT license. Basically that
 * means you are free to use hoverIntent as long as this header is left intact.
 * Copyright 2007, 2014 Brian Cherne
 */
(function($) {
    $.fn.hoverIntent = function(handlerIn, handlerOut, selector) {
        var cfg = {
            interval: 100,
            sensitivity: 6,
            timeout: 0
        };
        if (typeof handlerIn === "object") {
            cfg = $.extend(cfg, handlerIn)
        } else {
            if ($.isFunction(handlerOut)) {
                cfg = $.extend(cfg, {
                    over: handlerIn,
                    out: handlerOut,
                    selector: selector
                })
            } else {
                cfg = $.extend(cfg, {
                    over: handlerIn,
                    out: handlerIn,
                    selector: handlerOut
                })
            }
        }
        var cX, cY, pX, pY;
        var track = function(ev) {
            cX = ev.pageX;
            cY = ev.pageY
        };
        var compare = function(ev, ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            if (Math.sqrt((pX - cX) * (pX - cX) + (pY - cY) * (pY - cY)) < cfg.sensitivity) {
                $(ob).off("mousemove.hoverIntent", track);
                ob.hoverIntent_s = true;
                return cfg.over.apply(ob, [ev])
            } else {
                pX = cX;
                pY = cY;
                ob.hoverIntent_t = setTimeout(function() {
                    compare(ev, ob)
                }, cfg.interval)
            }
        };
        var delay = function(ev, ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            ob.hoverIntent_s = false;
            return cfg.out.apply(ob, [ev])
        };
        var handleHover = function(e) {
            var ev = $.extend({}, e);
            var ob = this;
            if (ob.hoverIntent_t) {
                ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t)
            }
            if (e.type === "mouseenter") {
                pX = ev.pageX;
                pY = ev.pageY;
                $(ob).on("mousemove.hoverIntent", track);
                if (!ob.hoverIntent_s) {
                    ob.hoverIntent_t = setTimeout(function() {
                        compare(ev, ob)
                    }, cfg.interval)
                }
            } else {
                $(ob).off("mousemove.hoverIntent", track);
                if (ob.hoverIntent_s) {
                    ob.hoverIntent_t = setTimeout(function() {
                        delay(ev, ob)
                    }, cfg.timeout)
                }
            }
        };
        return this.on({
            "mouseenter.hoverIntent": handleHover,
            "mouseleave.hoverIntent": handleHover
        }, cfg.selector)
    }
})(jQuery);
// /* ====== Smart Resize Logic ====== */
// It's best to debounce the resize event to a void performance hiccups
(function($, sr) {

    /**
     * debouncing function from John Hann
     * http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
     */
    var debounce = function(func, threshold, execAsap) {
            var timeout;

            return function debounced() {
                var obj = this,
                    args = arguments;

                function delayed() {
                    if (!execAsap) func.apply(obj, args);
                    timeout = null;
                }

                if (timeout) clearTimeout(timeout);
                else if (execAsap) func.apply(obj, args);

                timeout = setTimeout(delayed, threshold || 200);
            };
        }
        // smartresize
    jQuery.fn[sr] = function(fn) {
        return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr);
    };

})(jQuery, 'smartresize');
(function($, undefined) {
    // /* ====== SHARED VARS  - jQuery ====== */
    // These depend on jQuery
    var $window = $(window),
        windowHeight = $window.height(),
        windowWidth = $window.width(),
        latestKnownScrollY = window.scrollY,
        ticking = false,
        isTouchDevice = !!('ontouchstart' in window),
        $body = $('body'),
        isWekbit = ('WebkitAppearance' in document.documentElement.style) ? true : false,
        isIE = typeof(is_ie) !== "undefined" || (!(window.ActiveXObject) && "ActiveXObject" in window),
        isiele10 = navigator.userAgent.match(/msie (9|([1-9][0-9]))/i);

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

                        if ($obj.is(':nth-child(2n+1)')) {
                            $compare = $columns.eq(i - 1);
                        } else {
                            $compare = $columns.eq(i + 1);
                        }

                        if (typeof $compare == "undefined") {
                            return;
                        }

                        var bottom = $obj.offset().top + $obj.outerHeight(),
                            $neighbour;

                        $compare.children().each(function(j, item) {
                            var $item = $(item),
                                thisBottom = $(item).offset().top + $(item).outerHeight();

                            if (thisBottom < bottom) {
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

                var cloneOffset = $clone.offset(),
                    cloneTop = cloneOffset.top,
                    cloneHeight = $clone.height(),
                    cloneMid = cloneTop + cloneHeight / 2,
                    headerOffset = $header.offset(),
                    headerHeight = $header.outerHeight(),
                    headerMid = headerHeight / 2,
                    logoOffset = $logo.offset(),
                    logoTop = logoOffset.top,
                    logoWidth = $logo.width(),
                    logoHeight = $logo.height(),
                    logoMid = logoTop + logoHeight / 2;

                distance = latestKnownScrollY + logoMid - cloneMid;

                translateY($clone, distance);
                $clone.css('opacity', 1);

                initialized = true;
            }
        }

        function translateY($element, distance) {
            $element.css({
                "webkitTransform": "translateY(" + distance + "px)",
                "MozTransform": "translateY(" + distance + "px)",
                "msTransform": "translateY(" + distance + "px)",
                "OTransform": "translateY(" + distance + "px)",
                "transform": "translateY(" + distance + "px)"
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
                var $title = $(obj).removeAttr('style').css('fontSize', ''),
                    $branding = $title.closest('.site-branding'),
                    $span = $title.find('span'),
                    titleWidth = $title.width(),
                    brandingHeight = $branding.outerHeight(),
                    spanWidth = $span.width(),
                    spanHeight = $span.height(),
                    fontSize = parseInt($title.css('font-size', '').css('font-size')),
                    scaling = spanWidth / parseFloat(titleWidth),
                    maxLines = $body.is('.singular') ? 3 : 2;

                /* if site title is too long use a smaller font size */
                if (spanWidth > titleWidth) {
                    fontSize = parseInt(fontSize / scaling);
                    $title.css('fontSize', fontSize);
                }

                var titleHeight = $title.outerHeight();

                if ($title.closest('.mobile-logo').length) {
                    var mobileHeight = $('.mobile-logo').outerHeight();
                    fontSize = parseInt(fontSize * mobileHeight / titleHeight);
                    if (mobileHeight < titleHeight) {
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
                var $title = $(obj).removeAttr('style').css('fontSize', ''),
                    fontSize = parseInt($title.css('font-size')),
                    $span = $title.find('span'),
                    titleWidth = $title.width(),
                    spanWidth = $span.width(),
                    spanHeight = $span.height(),
                    scaling = spanWidth / parseFloat(titleWidth);

                /* if site title is too long use a smaller font size */
                if (spanWidth > titleWidth) {
                    fontSize = parseInt(fontSize / scaling);
                    $title.css('fontSize', fontSize);
                }
            });
        }

        function offsetFirstColumn() {
            var $columns = $('.column');
            if ($columns.length > 1) {
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
    // /* ====== Sidebar Placing Logic ====== */
    function placeSidebar() {

        if (!$body.hasClass('singular')) return;

        if (windowWidth > 900) {
            var $sidebar = $('.widget-area');

            if (!$sidebar.length) {
                return;
            }

            if ($body.hasClass('no-featured-image')) {
                $sidebar.addClass('is--placed').css('top', $('.site-main').css('padding-top'));
            } else {
                // If we are past the breakpoint
                var $featuredImage = $('.entry-featured'),
                    featuredImageBottom = $featuredImage.height() + parseInt($featuredImage.css('margin-bottom'), 10);
                // position: absolute; on the sidebar(via ".is--placed")
                // below the featured image;
                if (!$body.hasClass('has--small-featured-image'))
                    $sidebar.addClass('is--placed').css('top', featuredImageBottom);
                else
                    $sidebar.addClass('is--placed').css('top', 108);
            }

            // and set a height on the content so that everything seems in place.
            $('.content-area').css("minHeight", $sidebar.offset().top + $sidebar.height());


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
            if (initialInit || !isTouchDevice) return;

            $theUsualSuspects = $('li[class*=children]').removeClass('hover');
            $theUsualAnchors = $theUsualSuspects.find('> a');

            unbind();

            $theUsualAnchors.on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                if ($(this).hasClass('active')) {
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
            $body.on('touchstart', function(e) {
                var container = $('.main-navigation');

                if (!container.is(e.target) // if the target of the click isn't the container...
                    &&
                    container.has(e.target).length === 0) // ... nor a descendant of the container
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
        if (!$body.hasClass('singular') || $body.hasClass('no-featured-image')) return;

        if (windowWidth > 900) {
            if ($('.entry-featured img').width() < 600) {
                $body.addClass('has--small-featured-image');
                $('.post__content').css('paddingTop', $('.entry-featured').height() + 30);
            }
        } else {
            $('.post__content').removeAttr('style');
        }
    }

    function adjustCardMeta() {
        if ($body.is('.singular') || windowWidth < 480) {
            $('.card__meta').attr('style', '');
        } else {
            $('.card--image').each(function(i, obj) {
                var $cardMeta = $(obj).find('.card__meta');
                $cardMeta.css('marginTop', -($cardMeta.height()));
            });
        }

    }
    $(document).ready(function() {
        if (isWekbit) $body.addClass('is--webkit');

        if (isIE) $body.addClass('is--ie'); // IE Edge

        if (isiele10) $body.addClass('is--ie-le10');

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
                if ($(this).is('article') || this.nodeType === Node.COMMENT_NODE)
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

            if ($body.hasClass('overlay-is-open')) {
                $body.width($body.width());
                $body.css('overflow', 'hidden');
            } else {
                $body.css('overflow', '');
            }
        });

        $('.menu-toggle').on('touchstart click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if ($body.hasClass('nav-is-open')) {
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

            if ($body.hasClass('sidebar-is-open')) {
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

        if ($body.is('.singular')) {
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

        if ($mobileHeader.is(':visible')) {
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
})(jQuery);