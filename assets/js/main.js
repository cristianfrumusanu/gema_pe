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
/*!
 * modernizr v3.3.1
 * Build http://modernizr.com/download?-applicationcache-audio-backgroundsize-borderimage-borderradius-boxshadow-canvas-canvastext-cssanimations-csscolumns-cssgradients-cssreflections-csstransforms-csstransforms3d-csstransitions-flexbox-fontface-generatedcontent-geolocation-hashchange-history-hsla-indexeddb-inlinesvg-input-inputtypes-localstorage-multiplebgs-opacity-postmessage-rgba-sessionstorage-smil-svg-svgclippaths-textshadow-video-webgl-websockets-websqldatabase-webworkers-addtest-domprefixes-hasevent-mq-prefixed-prefixes-setclasses-shiv-testallprops-testprop-teststyles-dontmin
 *
 * Copyright (c)
 *  Faruk Ates
 *  Paul Irish
 *  Alex Sexton
 *  Ryan Seddon
 *  Patrick Kettner
 *  Stu Cox
 *  Richard Herrera

 * MIT License
 */

/*
 * Modernizr tests which native CSS3 and HTML5 features are available in the
 * current UA and makes the results available to you in two ways: as properties on
 * a global `Modernizr` object, and as classes on the `<html>` element. This
 * information allows you to progressively enhance your pages with a granular level
 * of control over the experience.
 */

;
(function(window, document, undefined) {
    var classes = [];


    var tests = [];


    /**
     *
     * ModernizrProto is the constructor for Modernizr
     *
     * @class
     * @access public
     */

    var ModernizrProto = {
        // The current version, dummy
        _version: '3.3.1',

        // Any settings that don't work as separate modules
        // can go in here as configuration.
        _config: {
            'classPrefix': '',
            'enableClasses': true,
            'enableJSClass': true,
            'usePrefixes': true
        },

        // Queue of tests
        _q: [],

        // Stub these for people who are listening
        on: function(test, cb) {
            // I don't really think people should do this, but we can
            // safe guard it a bit.
            // -- NOTE:: this gets WAY overridden in src/addTest for actual async tests.
            // This is in case people listen to synchronous tests. I would leave it out,
            // but the code to *disallow* sync tests in the real version of this
            // function is actually larger than this.
            var self = this;
            setTimeout(function() {
                cb(self[test]);
            }, 0);
        },

        addTest: function(name, fn, options) {
            tests.push({
                name: name,
                fn: fn,
                options: options
            });
        },

        addAsyncTest: function(fn) {
            tests.push({
                name: null,
                fn: fn
            });
        }
    };



    // Fake some of Object.create so we can force non test results to be non "own" properties.
    var Modernizr = function() {};
    Modernizr.prototype = ModernizrProto;

    // Leak modernizr globally when you `require` it rather than force it here.
    // Overwrite name so constructor name is nicer :D
    Modernizr = new Modernizr();


    /*!
     {
     "name": "Application Cache",
     "property": "applicationcache",
     "caniuse": "offline-apps",
     "tags": ["storage", "offline"],
     "notes": [{
     "name": "MDN documentation",
     "href": "https://developer.mozilla.org/en/docs/HTML/Using_the_application_cache"
     }],
     "polyfills": ["html5gears"]
     }
     !*/
    /* DOC
     Detects support for the Application Cache, for storing data to enable web-based applications run offline.

     The API has been [heavily criticized](http://alistapart.com/article/application-cache-is-a-douchebag) and discussions are underway to address this.
     */

    Modernizr.addTest('applicationcache', 'applicationCache' in window);

    /*!
     {
     "name": "Geolocation API",
     "property": "geolocation",
     "caniuse": "geolocation",
     "tags": ["media"],
     "notes": [{
     "name": "MDN documentation",
     "href": "https://developer.mozilla.org/en-US/docs/WebAPI/Using_geolocation"
     }],
     "polyfills": [
     "joshuabell-polyfill",
     "webshims",
     "geo-location-javascript",
     "geolocation-api-polyfill"
     ]
     }
     !*/
    /* DOC
     Detects support for the Geolocation API for users to provide their location to web applications.
     */

    // geolocation is often considered a trivial feature detect...
    // Turns out, it's quite tricky to get right:
    //
    // Using !!navigator.geolocation does two things we don't want. It:
    //   1. Leaks memory in IE9: github.com/Modernizr/Modernizr/issues/513
    //   2. Disables page caching in WebKit: webk.it/43956
    //
    // Meanwhile, in Firefox < 8, an about:config setting could expose
    // a false positive that would throw an exception: bugzil.la/688158

    Modernizr.addTest('geolocation', 'geolocation' in navigator);

    /*!
     {
     "name": "History API",
     "property": "history",
     "caniuse": "history",
     "tags": ["history"],
     "authors": ["Hay Kranen", "Alexander Farkas"],
     "notes": [{
     "name": "W3C Spec",
     "href": "https://www.w3.org/TR/html51/browsers.html#the-history-interface"
     }, {
     "name": "MDN documentation",
     "href": "https://developer.mozilla.org/en-US/docs/Web/API/window.history"
     }],
     "polyfills": ["historyjs", "html5historyapi"]
     }
     !*/
    /* DOC
     Detects support for the History API for manipulating the browser session history.
     */

    Modernizr.addTest('history', function() {
        // Issue #733
        // The stock browser on Android 2.2 & 2.3, and 4.0.x returns positive on history support
        // Unfortunately support is really buggy and there is no clean way to detect
        // these bugs, so we fall back to a user agent sniff :(
        var ua = navigator.userAgent;

        // We only want Android 2 and 4.0, stock browser, and not Chrome which identifies
        // itself as 'Mobile Safari' as well, nor Windows Phone (issue #1471).
        if ((ua.indexOf('Android 2.') !== -1 ||
                (ua.indexOf('Android 4.0') !== -1)) &&
            ua.indexOf('Mobile Safari') !== -1 &&
            ua.indexOf('Chrome') === -1 &&
            ua.indexOf('Windows Phone') === -1) {
            return false;
        }

        // Return the regular check
        return (window.history && 'pushState' in window.history);
    });

    /*!
     {
     "name": "postMessage",
     "property": "postmessage",
     "caniuse": "x-doc-messaging",
     "notes": [{
     "name": "W3C Spec",
     "href": "http://www.w3.org/TR/html5/comms.html#posting-messages"
     }],
     "polyfills": ["easyxdm", "postmessage-jquery"]
     }
     !*/
    /* DOC
     Detects support for the `window.postMessage` protocol for cross-document messaging.
     */

    Modernizr.addTest('postmessage', 'postMessage' in window);

    /*!
     {
     "name": "SVG",
     "property": "svg",
     "caniuse": "svg",
     "tags": ["svg"],
     "authors": ["Erik Dahlstrom"],
     "polyfills": [
     "svgweb",
     "raphael",
     "amplesdk",
     "canvg",
     "svg-boilerplate",
     "sie",
     "dojogfx",
     "fabricjs"
     ]
     }
     !*/
    /* DOC
     Detects support for SVG in `<embed>` or `<object>` elements.
     */

    Modernizr.addTest('svg', !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect);

    /*!
     {
     "name": "WebSockets Support",
     "property": "websockets",
     "authors": ["Phread [fearphage]", "Mike Sherov [mikesherov]", "Burak Yigit Kaya [BYK]"],
     "caniuse": "websockets",
     "tags": ["html5"],
     "warnings": [
     "This test will reject any old version of WebSockets even if it is not prefixed such as in Safari 5.1"
     ],
     "notes": [{
     "name": "CLOSING State and Spec",
     "href": "https://www.w3.org/TR/websockets/#the-websocket-interface"
     }],
     "polyfills": [
     "sockjs",
     "socketio",
     "kaazing-websocket-gateway",
     "websocketjs",
     "atmosphere",
     "graceful-websocket",
     "portal",
     "datachannel"
     ]
     }
     !*/

    Modernizr.addTest('websockets', 'WebSocket' in window && window.WebSocket.CLOSING === 2);

    /*!
     {
     "name": "Local Storage",
     "property": "localstorage",
     "caniuse": "namevalue-storage",
     "tags": ["storage"],
     "knownBugs": [],
     "notes": [],
     "warnings": [],
     "polyfills": [
     "joshuabell-polyfill",
     "cupcake",
     "storagepolyfill",
     "amplifyjs",
     "yui-cacheoffline"
     ]
     }
     !*/

    // In FF4, if disabled, window.localStorage should === null.

    // Normally, we could not test that directly and need to do a
    //   `('localStorage' in window) && ` test first because otherwise Firefox will
    //   throw bugzil.la/365772 if cookies are disabled

    // Also in iOS5 Private Browsing mode, attempting to use localStorage.setItem
    // will throw the exception:
    //   QUOTA_EXCEEDED_ERROR DOM Exception 22.
    // Peculiarly, getItem and removeItem calls do not throw.

    // Because we are forced to try/catch this, we'll go aggressive.

    // Just FWIW: IE8 Compat mode supports these features completely:
    //   www.quirksmode.org/dom/html5.html
    // But IE8 doesn't support either with local files

    Modernizr.addTest('localstorage', function() {
        var mod = 'modernizr';
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch (e) {
            return false;
        }
    });

    /*!
     {
     "name": "Session Storage",
     "property": "sessionstorage",
     "tags": ["storage"],
     "polyfills": ["joshuabell-polyfill", "cupcake", "sessionstorage"]
     }
     !*/

    // Because we are forced to try/catch this, we'll go aggressive.

    // Just FWIW: IE8 Compat mode supports these features completely:
    //   www.quirksmode.org/dom/html5.html
    // But IE8 doesn't support either with local files
    Modernizr.addTest('sessionstorage', function() {
        var mod = 'modernizr';
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch (e) {
            return false;
        }
    });

    /*!
     {
     "name": "Web SQL Database",
     "property": "websqldatabase",
     "caniuse": "sql-storage",
     "tags": ["storage"]
     }
     !*/

    // Chrome incognito mode used to throw an exception when using openDatabase
    // It doesn't anymore.
    Modernizr.addTest('websqldatabase', 'openDatabase' in window);

    /*!
     {
     "name": "Web Workers",
     "property": "webworkers",
     "caniuse" : "webworkers",
     "tags": ["performance", "workers"],
     "notes": [{
     "name": "W3C Reference",
     "href": "https://www.w3.org/TR/workers/"
     }, {
     "name": "HTML5 Rocks article",
     "href": "http://www.html5rocks.com/en/tutorials/workers/basics/"
     }, {
     "name": "MDN documentation",
     "href": "https://developer.mozilla.org/en-US/docs/Web/Guide/Performance/Using_web_workers"
     }],
     "polyfills": ["fakeworker", "html5shims"]
     }
     !*/
    /* DOC
     Detects support for the basic `Worker` API from the Web Workers spec. Web Workers provide a simple means for web content to run scripts in background threads.
     */

    Modernizr.addTest('webworkers', 'Worker' in window);


    /**
     * List of property values to set for css tests. See ticket #21
     * http://git.io/vUGl4
     *
     * @memberof Modernizr
     * @name Modernizr._prefixes
     * @optionName Modernizr._prefixes
     * @optionProp prefixes
     * @access public
     * @example
     *
     * Modernizr._prefixes is the internal list of prefixes that we test against
     * inside of things like [prefixed](#modernizr-prefixed) and [prefixedCSS](#-code-modernizr-prefixedcss). It is simply
     * an array of kebab-case vendor prefixes you can use within your code.
     *
     * Some common use cases include
     *
     * Generating all possible prefixed version of a CSS property
     * ```js
     * var rule = Modernizr._prefixes.join('transform: rotate(20deg); ');
     *
     * rule === 'transform: rotate(20deg); webkit-transform: rotate(20deg); moz-transform: rotate(20deg); o-transform: rotate(20deg); ms-transform: rotate(20deg);'
     * ```
     *
     * Generating all possible prefixed version of a CSS value
     * ```js
     * rule = 'display:' +  Modernizr._prefixes.join('flex; display:') + 'flex';
     *
     * rule === 'display:flex; display:-webkit-flex; display:-moz-flex; display:-o-flex; display:-ms-flex; display:flex'
     * ```
     */

    // we use ['',''] rather than an empty array in order to allow a pattern of .`join()`ing prefixes to test
    // values in feature detects to continue to work
    var prefixes = (ModernizrProto._config.usePrefixes ? ' -webkit- -moz- -o- -ms- '.split(' ') : ['', '']);

    // expose these for the plugin API. Look in the source for how to join() them against your input
    ModernizrProto._prefixes = prefixes;



    /**
     * is returns a boolean if the typeof an obj is exactly type.
     *
     * @access private
     * @function is
     * @param {*} obj - A thing we want to check the type of
     * @param {string} type - A string to compare the typeof against
     * @returns {boolean}
     */

    function is(obj, type) {
        return typeof obj === type;
    };

    /**
     * Run through all tests and detect their support in the current UA.
     *
     * @access private
     */

    function testRunner() {
        var featureNames;
        var feature;
        var aliasIdx;
        var result;
        var nameIdx;
        var featureName;
        var featureNameSplit;

        for (var featureIdx in tests) {
            if (tests.hasOwnProperty(featureIdx)) {
                featureNames = [];
                feature = tests[featureIdx];
                // run the test, throw the return value into the Modernizr,
                // then based on that boolean, define an appropriate className
                // and push it into an array of classes we'll join later.
                //
                // If there is no name, it's an 'async' test that is run,
                // but not directly added to the object. That should
                // be done with a post-run addTest call.
                if (feature.name) {
                    featureNames.push(feature.name.toLowerCase());

                    if (feature.options && feature.options.aliases && feature.options.aliases.length) {
                        // Add all the aliases into the names list
                        for (aliasIdx = 0; aliasIdx < feature.options.aliases.length; aliasIdx++) {
                            featureNames.push(feature.options.aliases[aliasIdx].toLowerCase());
                        }
                    }
                }

                // Run the test, or use the raw value if it's not a function
                result = is(feature.fn, 'function') ? feature.fn() : feature.fn;


                // Set each of the names on the Modernizr object
                for (nameIdx = 0; nameIdx < featureNames.length; nameIdx++) {
                    featureName = featureNames[nameIdx];
                    // Support dot properties as sub tests. We don't do checking to make sure
                    // that the implied parent tests have been added. You must call them in
                    // order (either in the test, or make the parent test a dependency).
                    //
                    // Cap it to TWO to make the logic simple and because who needs that kind of subtesting
                    // hashtag famous last words
                    featureNameSplit = featureName.split('.');

                    if (featureNameSplit.length === 1) {
                        Modernizr[featureNameSplit[0]] = result;
                    } else {
                        // cast to a Boolean, if not one already
                        /* jshint -W053 */
                        if (Modernizr[featureNameSplit[0]] && !(Modernizr[featureNameSplit[0]] instanceof Boolean)) {
                            Modernizr[featureNameSplit[0]] = new Boolean(Modernizr[featureNameSplit[0]]);
                        }

                        Modernizr[featureNameSplit[0]][featureNameSplit[1]] = result;
                    }

                    classes.push((result ? '' : 'no-') + featureNameSplit.join('-'));
                }
            }
        }
    };

    /**
     * docElement is a convenience wrapper to grab the root element of the document
     *
     * @access private
     * @returns {HTMLElement|SVGElement} The root element of the document
     */

    var docElement = document.documentElement;


    /**
     * A convenience helper to check if the document we are running in is an SVG document
     *
     * @access private
     * @returns {boolean}
     */

    var isSVG = docElement.nodeName.toLowerCase() === 'svg';


    /**
     * setClasses takes an array of class names and adds them to the root element
     *
     * @access private
     * @function setClasses
     * @param {string[]} classes - Array of class names
     */

    // Pass in an and array of class names, e.g.:
    //  ['no-webp', 'borderradius', ...]
    function setClasses(classes) {
        var className = docElement.className;
        var classPrefix = Modernizr._config.classPrefix || '';

        if (isSVG) {
            className = className.baseVal;
        }

        // Change `no-js` to `js` (independently of the `enableClasses` option)
        // Handle classPrefix on this too
        if (Modernizr._config.enableJSClass) {
            var reJS = new RegExp('(^|\\s)' + classPrefix + 'no-js(\\s|$)');
            className = className.replace(reJS, '$1' + classPrefix + 'js$2');
        }

        if (Modernizr._config.enableClasses) {
            // Add the new classes
            className += ' ' + classPrefix + classes.join(' ' + classPrefix);
            isSVG ? docElement.className.baseVal = className : docElement.className = className;
        }

    }

    ;

    /**
     * @optionName html5shiv
     * @optionProp html5shiv
     */

    // Take the html5 variable out of the html5shiv scope so we can return it.
    var html5;
    if (!isSVG) {
        /**
         * @preserve HTML5 Shiv 3.7.3 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
         */
        ;
        (function(window, document) {
            /*jshint evil:true */
            /** version */
            var version = '3.7.3';

            /** Preset options */
            var options = window.html5 || {};

            /** Used to skip problem elements */
            var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

            /** Not all elements can be cloned in IE **/
            var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

            /** Detect whether the browser supports default html5 styles */
            var supportsHtml5Styles;

            /** Name of the expando, to work with multiple documents or to re-shiv one document */
            var expando = '_html5shiv';

            /** The id for the the documents expando */
            var expanID = 0;

            /** Cached data for each document */
            var expandoData = {};

            /** Detect whether the browser supports unknown elements */
            var supportsUnknownElements;

            (function() {
                try {
                    var a = document.createElement('a');
                    a.innerHTML = '<xyz></xyz>';
                    //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
                    supportsHtml5Styles = ('hidden' in a);

                    supportsUnknownElements = a.childNodes.length == 1 || (function() {
                        // assign a false positive if unable to shiv
                        (document.createElement)('a');
                        var frag = document.createDocumentFragment();
                        return (
                            typeof frag.cloneNode == 'undefined' ||
                            typeof frag.createDocumentFragment == 'undefined' ||
                            typeof frag.createElement == 'undefined'
                        );
                    }());
                } catch (e) {
                    // assign a false positive if detection fails => unable to shiv
                    supportsHtml5Styles = true;
                    supportsUnknownElements = true;
                }

            }());

            /*--------------------------------------------------------------------------*/

            /**
             * Creates a style sheet with the given CSS text and adds it to the document.
             * @private
             * @param {Document} ownerDocument The document.
             * @param {String} cssText The CSS text.
             * @returns {StyleSheet} The style element.
             */
            function addStyleSheet(ownerDocument, cssText) {
                var p = ownerDocument.createElement('p'),
                    parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

                p.innerHTML = 'x<style>' + cssText + '</style>';
                return parent.insertBefore(p.lastChild, parent.firstChild);
            }

            /**
             * Returns the value of `html5.elements` as an array.
             * @private
             * @returns {Array} An array of shived element node names.
             */
            function getElements() {
                var elements = html5.elements;
                return typeof elements == 'string' ? elements.split(' ') : elements;
            }

            /**
             * Extends the built-in list of html5 elements
             * @memberOf html5
             * @param {String|Array} newElements whitespace separated list or array of new element names to shiv
             * @param {Document} ownerDocument The context document.
             */
            function addElements(newElements, ownerDocument) {
                var elements = html5.elements;
                if (typeof elements != 'string') {
                    elements = elements.join(' ');
                }
                if (typeof newElements != 'string') {
                    newElements = newElements.join(' ');
                }
                html5.elements = elements + ' ' + newElements;
                shivDocument(ownerDocument);
            }

            /**
             * Returns the data associated to the given document
             * @private
             * @param {Document} ownerDocument The document.
             * @returns {Object} An object of data.
             */
            function getExpandoData(ownerDocument) {
                var data = expandoData[ownerDocument[expando]];
                if (!data) {
                    data = {};
                    expanID++;
                    ownerDocument[expando] = expanID;
                    expandoData[expanID] = data;
                }
                return data;
            }

            /**
             * returns a shived element for the given nodeName and document
             * @memberOf html5
             * @param {String} nodeName name of the element
             * @param {Document|DocumentFragment} ownerDocument The context document.
             * @returns {Object} The shived element.
             */
            function createElement(nodeName, ownerDocument, data) {
                if (!ownerDocument) {
                    ownerDocument = document;
                }
                if (supportsUnknownElements) {
                    return ownerDocument.createElement(nodeName);
                }
                if (!data) {
                    data = getExpandoData(ownerDocument);
                }
                var node;

                if (data.cache[nodeName]) {
                    node = data.cache[nodeName].cloneNode();
                } else if (saveClones.test(nodeName)) {
                    node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
                } else {
                    node = data.createElem(nodeName);
                }

                // Avoid adding some elements to fragments in IE < 9 because
                // * Attributes like `name` or `type` cannot be set/changed once an element
                //   is inserted into a document/fragment
                // * Link elements with `src` attributes that are inaccessible, as with
                //   a 403 response, will cause the tab/window to crash
                // * Script elements appended to fragments will execute when their `src`
                //   or `text` property is set
                return node.canHaveChildren && !reSkip.test(nodeName) && !node.tagUrn ? data.frag.appendChild(node) : node;
            }

            /**
             * returns a shived DocumentFragment for the given document
             * @memberOf html5
             * @param {Document} ownerDocument The context document.
             * @returns {Object} The shived DocumentFragment.
             */
            function createDocumentFragment(ownerDocument, data) {
                if (!ownerDocument) {
                    ownerDocument = document;
                }
                if (supportsUnknownElements) {
                    return ownerDocument.createDocumentFragment();
                }
                data = data || getExpandoData(ownerDocument);
                var clone = data.frag.cloneNode(),
                    i = 0,
                    elems = getElements(),
                    l = elems.length;
                for (; i < l; i++) {
                    clone.createElement(elems[i]);
                }
                return clone;
            }

            /**
             * Shivs the `createElement` and `createDocumentFragment` methods of the document.
             * @private
             * @param {Document|DocumentFragment} ownerDocument The document.
             * @param {Object} data of the document.
             */
            function shivMethods(ownerDocument, data) {
                if (!data.cache) {
                    data.cache = {};
                    data.createElem = ownerDocument.createElement;
                    data.createFrag = ownerDocument.createDocumentFragment;
                    data.frag = data.createFrag();
                }


                ownerDocument.createElement = function(nodeName) {
                    //abort shiv
                    if (!html5.shivMethods) {
                        return data.createElem(nodeName);
                    }
                    return createElement(nodeName, ownerDocument, data);
                };

                ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
                    'var n=f.cloneNode(),c=n.createElement;' +
                    'h.shivMethods&&(' +
                    // unroll the `createElement` calls
                    getElements().join().replace(/[\w\-:]+/g, function(nodeName) {
                        data.createElem(nodeName);
                        data.frag.createElement(nodeName);
                        return 'c("' + nodeName + '")';
                    }) +
                    ');return n}'
                )(html5, data.frag);
            }

            /*--------------------------------------------------------------------------*/

            /**
             * Shivs the given document.
             * @memberOf html5
             * @param {Document} ownerDocument The document to shiv.
             * @returns {Document} The shived document.
             */
            function shivDocument(ownerDocument) {
                if (!ownerDocument) {
                    ownerDocument = document;
                }
                var data = getExpandoData(ownerDocument);

                if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
                    data.hasCSS = !!addStyleSheet(ownerDocument,
                        // corrects block display not defined in IE6/7/8/9
                        'article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
                        // adds styling not present in IE6/7/8/9
                        'mark{background:#FF0;color:#000}' +
                        // hides non-rendered elements
                        'template{display:none}'
                    );
                }
                if (!supportsUnknownElements) {
                    shivMethods(ownerDocument, data);
                }
                return ownerDocument;
            }

            /*--------------------------------------------------------------------------*/

            /**
             * The `html5` object is exposed so that more elements can be shived and
             * existing shiving can be detected on iframes.
             * @type Object
             * @example
             *
             * // options can be changed before the script is included
             * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
             */
            var html5 = {

                /**
                 * An array or space separated string of node names of the elements to shiv.
                 * @memberOf html5
                 * @type Array|String
                 */
                'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video',

                /**
                 * current version of html5shiv
                 */
                'version': version,

                /**
                 * A flag to indicate that the HTML5 style sheet should be inserted.
                 * @memberOf html5
                 * @type Boolean
                 */
                'shivCSS': (options.shivCSS !== false),

                /**
                 * Is equal to true if a browser supports creating unknown/HTML5 elements
                 * @memberOf html5
                 * @type boolean
                 */
                'supportsUnknownElements': supportsUnknownElements,

                /**
                 * A flag to indicate that the document's `createElement` and `createDocumentFragment`
                 * methods should be overwritten.
                 * @memberOf html5
                 * @type Boolean
                 */
                'shivMethods': (options.shivMethods !== false),

                /**
                 * A string to describe the type of `html5` object ("default" or "default print").
                 * @memberOf html5
                 * @type String
                 */
                'type': 'default',

                // shivs the document according to the specified `html5` object options
                'shivDocument': shivDocument,

                //creates a shived element
                createElement: createElement,

                //creates a shived documentFragment
                createDocumentFragment: createDocumentFragment,

                //extends list of elements
                addElements: addElements
            };

            /*--------------------------------------------------------------------------*/

            // expose html5
            window.html5 = html5;

            // shiv the document
            shivDocument(document);

            if (typeof module == 'object' && module.exports) {
                module.exports = html5;
            }

        }(typeof window !== "undefined" ? window : this, document));
    };

    /**
     * If the browsers follow the spec, then they would expose vendor-specific style as:
     *   elem.style.WebkitBorderRadius
     * instead of something like the following, which would be technically incorrect:
     *   elem.style.webkitBorderRadius

     * Webkit ghosts their properties in lowercase but Opera & Moz do not.
     * Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
     *   erik.eae.net/archives/2008/03/10/21.48.10/

     * More here: github.com/Modernizr/Modernizr/issues/issue/21
     *
     * @access private
     * @returns {string} The string representing the vendor-specific style properties
     */

    var omPrefixes = 'Moz O ms Webkit';


    /**
     * List of JavaScript DOM values used for tests
     *
     * @memberof Modernizr
     * @name Modernizr._domPrefixes
     * @optionName Modernizr._domPrefixes
     * @optionProp domPrefixes
     * @access public
     * @example
     *
     * Modernizr._domPrefixes is exactly the same as [_prefixes](#modernizr-_prefixes), but rather
     * than kebab-case properties, all properties are their Capitalized variant
     *
     * ```js
     * Modernizr._domPrefixes === [ "Moz", "O", "ms", "Webkit" ];
     * ```
     */

    var domPrefixes = (ModernizrProto._config.usePrefixes ? omPrefixes.toLowerCase().split(' ') : []);
    ModernizrProto._domPrefixes = domPrefixes;


    /**
     * hasOwnProp is a shim for hasOwnProperty that is needed for Safari 2.0 support
     *
     * @author kangax
     * @access private
     * @function hasOwnProp
     * @param {object} object - The object to check for a property
     * @param {string} property - The property to check for
     * @returns {boolean}
     */

    // hasOwnProperty shim by kangax needed for Safari 2.0 support
    var hasOwnProp;

    (function() {
        var _hasOwnProperty = ({}).hasOwnProperty;
        /* istanbul ignore else */
        /* we have no way of testing IE 5.5 or safari 2,
         * so just assume the else gets hit */
        if (!is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined')) {
            hasOwnProp = function(object, property) {
                return _hasOwnProperty.call(object, property);
            };
        } else {
            hasOwnProp = function(object, property) { /* yes, this can give false positives/negatives, but most of the time we don't care about those */
                return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
            };
        }
    })();




    // _l tracks listeners for async tests, as well as tests that execute after the initial run
    ModernizrProto._l = {};

    /**
     * Modernizr.on is a way to listen for the completion of async tests. Being
     * asynchronous, they may not finish before your scripts run. As a result you
     * will get a possibly false negative `undefined` value.
     *
     * @memberof Modernizr
     * @name Modernizr.on
     * @access public
     * @function on
     * @param {string} feature - String name of the feature detect
     * @param {function} cb - Callback function returning a Boolean - true if feature is supported, false if not
     * @example
     *
     * ```js
     * Modernizr.on('flash', function( result ) {
     *   if (result) {
     *    // the browser has flash
     *   } else {
     *     // the browser does not have flash
     *   }
     * });
     * ```
     */

    ModernizrProto.on = function(feature, cb) {
        // Create the list of listeners if it doesn't exist
        if (!this._l[feature]) {
            this._l[feature] = [];
        }

        // Push this test on to the listener list
        this._l[feature].push(cb);

        // If it's already been resolved, trigger it on next tick
        if (Modernizr.hasOwnProperty(feature)) {
            // Next Tick
            setTimeout(function() {
                Modernizr._trigger(feature, Modernizr[feature]);
            }, 0);
        }
    };

    /**
     * _trigger is the private function used to signal test completion and run any
     * callbacks registered through [Modernizr.on](#modernizr-on)
     *
     * @memberof Modernizr
     * @name Modernizr._trigger
     * @access private
     * @function _trigger
     * @param {string} feature - string name of the feature detect
     * @param {function|boolean} [res] - A feature detection function, or the boolean =
     * result of a feature detection function
     */

    ModernizrProto._trigger = function(feature, res) {
        if (!this._l[feature]) {
            return;
        }

        var cbs = this._l[feature];

        // Force async
        setTimeout(function() {
            var i, cb;
            for (i = 0; i < cbs.length; i++) {
                cb = cbs[i];
                cb(res);
            }
        }, 0);

        // Don't trigger these again
        delete this._l[feature];
    };

    /**
     * addTest allows you to define your own feature detects that are not currently
     * included in Modernizr (under the covers it's the exact same code Modernizr
     * uses for its own [feature detections](https://github.com/Modernizr/Modernizr/tree/master/feature-detects)). Just like the offical detects, the result
     * will be added onto the Modernizr object, as well as an appropriate className set on
     * the html element when configured to do so
     *
     * @memberof Modernizr
     * @name Modernizr.addTest
     * @optionName Modernizr.addTest()
     * @optionProp addTest
     * @access public
     * @function addTest
     * @param {string|object} feature - The string name of the feature detect, or an
     * object of feature detect names and test
     * @param {function|boolean} test - Function returning true if feature is supported,
     * false if not. Otherwise a boolean representing the results of a feature detection
     * @example
     *
     * The most common way of creating your own feature detects is by calling
     * `Modernizr.addTest` with a string (preferably just lowercase, without any
     * punctuation), and a function you want executed that will return a boolean result
     *
     * ```js
     * Modernizr.addTest('itsTuesday', function() {
     *  var d = new Date();
     *  return d.getDay() === 2;
     * });
     * ```
     *
     * When the above is run, it will set Modernizr.itstuesday to `true` when it is tuesday,
     * and to `false` every other day of the week. One thing to notice is that the names of
     * feature detect functions are always lowercased when added to the Modernizr object. That
     * means that `Modernizr.itsTuesday` will not exist, but `Modernizr.itstuesday` will.
     *
     *
     *  Since we only look at the returned value from any feature detection function,
     *  you do not need to actually use a function. For simple detections, just passing
     *  in a statement that will return a boolean value works just fine.
     *
     * ```js
     * Modernizr.addTest('hasJquery', 'jQuery' in window);
     * ```
     *
     * Just like before, when the above runs `Modernizr.hasjquery` will be true if
     * jQuery has been included on the page. Not using a function saves a small amount
     * of overhead for the browser, as well as making your code much more readable.
     *
     * Finally, you also have the ability to pass in an object of feature names and
     * their tests. This is handy if you want to add multiple detections in one go.
     * The keys should always be a string, and the value can be either a boolean or
     * function that returns a boolean.
     *
     * ```js
     * var detects = {
     *  'hasjquery': 'jQuery' in window,
     *  'itstuesday': function() {
     *    var d = new Date();
     *    return d.getDay() === 2;
     *  }
     * }
     *
     * Modernizr.addTest(detects);
     * ```
     *
     * There is really no difference between the first methods and this one, it is
     * just a convenience to let you write more readable code.
     */

    function addTest(feature, test) {

        if (typeof feature == 'object') {
            for (var key in feature) {
                if (hasOwnProp(feature, key)) {
                    addTest(key, feature[key]);
                }
            }
        } else {

            feature = feature.toLowerCase();
            var featureNameSplit = feature.split('.');
            var last = Modernizr[featureNameSplit[0]];

            // Again, we don't check for parent test existence. Get that right, though.
            if (featureNameSplit.length == 2) {
                last = last[featureNameSplit[1]];
            }

            if (typeof last != 'undefined') {
                // we're going to quit if you're trying to overwrite an existing test
                // if we were to allow it, we'd do this:
                //   var re = new RegExp("\\b(no-)?" + feature + "\\b");
                //   docElement.className = docElement.className.replace( re, '' );
                // but, no rly, stuff 'em.
                return Modernizr;
            }

            test = typeof test == 'function' ? test() : test;

            // Set the value (this is the magic, right here).
            if (featureNameSplit.length == 1) {
                Modernizr[featureNameSplit[0]] = test;
            } else {
                // cast to a Boolean, if not one already
                /* jshint -W053 */
                if (Modernizr[featureNameSplit[0]] && !(Modernizr[featureNameSplit[0]] instanceof Boolean)) {
                    Modernizr[featureNameSplit[0]] = new Boolean(Modernizr[featureNameSplit[0]]);
                }

                Modernizr[featureNameSplit[0]][featureNameSplit[1]] = test;
            }

            // Set a single class (either `feature` or `no-feature`)
            /* jshint -W041 */
            setClasses([(!!test && test != false ? '' : 'no-') + featureNameSplit.join('-')]);
            /* jshint +W041 */

            // Trigger the event
            Modernizr._trigger(feature, test);
        }

        return Modernizr; // allow chaining.
    }

    // After all the tests are run, add self to the Modernizr prototype
    Modernizr._q.push(function() {
        ModernizrProto.addTest = addTest;
    });




    /**
     * createElement is a convenience wrapper around document.createElement. Since we
     * use createElement all over the place, this allows for (slightly) smaller code
     * as well as abstracting away issues with creating elements in contexts other than
     * HTML documents (e.g. SVG documents).
     *
     * @access private
     * @function createElement
     * @returns {HTMLElement|SVGElement} An HTML or SVG element
     */

    function createElement() {
        if (typeof document.createElement !== 'function') {
            // This is the case in IE7, where the type of createElement is "object".
            // For this reason, we cannot call apply() as Object is not a Function.
            return document.createElement(arguments[0]);
        } else if (isSVG) {
            return document.createElementNS.call(document, 'http://www.w3.org/2000/svg', arguments[0]);
        } else {
            return document.createElement.apply(document, arguments);
        }
    }

    ;

    /**
     * Modernizr.hasEvent() detects support for a given event
     *
     * @memberof Modernizr
     * @name Modernizr.hasEvent
     * @optionName Modernizr.hasEvent()
     * @optionProp hasEvent
     * @access public
     * @function hasEvent
     * @param  {string|*} eventName - the name of an event to test for (e.g. "resize")
     * @param  {Element|string} [element=HTMLDivElement] - is the element|document|window|tagName to test on
     * @returns {boolean}
     * @example
     *  `Modernizr.hasEvent` lets you determine if the browser supports a supplied event.
     *  By default, it does this detection on a div element
     *
     * ```js
     *  hasEvent('blur') // true;
     * ```
     *
     * However, you are able to give an object as a second argument to hasEvent to
     * detect an event on something other than a div.
     *
     * ```js
     *  hasEvent('devicelight', window) // true;
     * ```
     *
     */

    var hasEvent = (function() {

        // Detect whether event support can be detected via `in`. Test on a DOM element
        // using the "blur" event b/c it should always exist. bit.ly/event-detection
        var needsFallback = !('onblur' in document.documentElement);

        function inner(eventName, element) {

            var isSupported;
            if (!eventName) {
                return false;
            }
            if (!element || typeof element === 'string') {
                element = createElement(element || 'div');
            }

            // Testing via the `in` operator is sufficient for modern browsers and IE.
            // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and
            // "resize", whereas `in` "catches" those.
            eventName = 'on' + eventName;
            isSupported = eventName in element;

            // Fallback technique for old Firefox - bit.ly/event-detection
            if (!isSupported && needsFallback) {
                if (!element.setAttribute) {
                    // Switch to generic element if it lacks `setAttribute`.
                    // It could be the `document`, `window`, or something else.
                    element = createElement('div');
                }

                element.setAttribute(eventName, '');
                isSupported = typeof element[eventName] === 'function';

                if (element[eventName] !== undefined) {
                    // If property was created, "remove it" by setting value to `undefined`.
                    element[eventName] = undefined;
                }
                element.removeAttribute(eventName);
            }

            return isSupported;
        }
        return inner;
    })();


    ModernizrProto.hasEvent = hasEvent;

    /*!
     {
     "name": "Hashchange event",
     "property": "hashchange",
     "caniuse": "hashchange",
     "tags": ["history"],
     "notes": [{
     "name": "MDN documentation",
     "href": "https://developer.mozilla.org/en-US/docs/Web/API/window.onhashchange"
     }],
     "polyfills": [
     "jquery-hashchange",
     "moo-historymanager",
     "jquery-ajaxy",
     "hasher",
     "shistory"
     ]
     }
     !*/
    /* DOC
     Detects support for the `hashchange` event, fired when the current location fragment changes.
     */

    Modernizr.addTest('hashchange', function() {
        if (hasEvent('hashchange', window) === false) {
            return false;
        }

        // documentMode logic from YUI to filter out IE8 Compat Mode
        //   which false positives.
        return (document.documentMode === undefined || document.documentMode > 7);
    });

    /*!
     {
     "name" : "HTML5 Audio Element",
     "property": "audio",
     "tags" : ["html5", "audio", "media"]
     }
     !*/
    /* DOC
     Detects the audio element
     */

    // This tests evaluates support of the audio element, as well as
    // testing what types of content it supports.
    //
    // We're using the Boolean constructor here, so that we can extend the value
    // e.g.  Modernizr.audio     // true
    //       Modernizr.audio.ogg // 'probably'
    //
    // Codec values from : github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
    //                     thx to NielsLeenheer and zcorpan

    // Note: in some older browsers, "no" was a return value instead of empty string.
    //   It was live in FF3.5.0 and 3.5.1, but fixed in 3.5.2
    //   It was also live in Safari 4.0.0 - 4.0.4, but fixed in 4.0.5
    Modernizr.addTest('audio', function() {
        /* jshint -W053 */
        var elem = createElement('audio');
        var bool = false;

        try {
            if (bool = !!elem.canPlayType) {
                bool = new Boolean(bool);
                bool.ogg = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '');
                bool.mp3 = elem.canPlayType('audio/mpeg; codecs="mp3"').replace(/^no$/, '');
                bool.opus = elem.canPlayType('audio/ogg; codecs="opus"') ||
                    elem.canPlayType('audio/webm; codecs="opus"').replace(/^no$/, '');

                // Mimetypes accepted:
                //   developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   bit.ly/iphoneoscodecs
                bool.wav = elem.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '');
                bool.m4a = (elem.canPlayType('audio/x-m4a;') ||
                    elem.canPlayType('audio/aac;')).replace(/^no$/, '');
            }
        } catch (e) {}

        return bool;
    });

    /*!
     {
     "name": "Canvas",
     "property": "canvas",
     "caniuse": "canvas",
     "tags": ["canvas", "graphics"],
     "polyfills": ["flashcanvas", "excanvas", "slcanvas", "fxcanvas"]
     }
     !*/
    /* DOC
     Detects support for the `<canvas>` element for 2D drawing.
     */

    // On the S60 and BB Storm, getContext exists, but always returns undefined
    // so we actually have to call getContext() to verify
    // github.com/Modernizr/Modernizr/issues/issue/97/
    Modernizr.addTest('canvas', function() {
        var elem = createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    });

    /*!
     {
     "name": "Canvas text",
     "property": "canvastext",
     "caniuse": "canvas-text",
     "tags": ["canvas", "graphics"],
     "polyfills": ["canvastext"]
     }
     !*/
    /* DOC
     Detects support for the text APIs for `<canvas>` elements.
     */

    Modernizr.addTest('canvastext', function() {
        if (Modernizr.canvas === false) {
            return false;
        }
        return typeof createElement('canvas').getContext('2d').fillText == 'function';
    });

    /*!
     {
     "name": "HTML5 Video",
     "property": "video",
     "caniuse": "video",
     "tags": ["html5"],
     "knownBugs": [
     "Without QuickTime, `Modernizr.video.h264` will be `undefined`; https://github.com/Modernizr/Modernizr/issues/546"
     ],
     "polyfills": [
     "html5media",
     "mediaelementjs",
     "sublimevideo",
     "videojs",
     "leanbackplayer",
     "videoforeverybody"
     ]
     }
     !*/
    /* DOC
     Detects support for the video element, as well as testing what types of content it supports.

     Subproperties are provided to describe support for `ogg`, `h264` and `webm` formats, e.g.:

     ```javascript
     Modernizr.video         // true
     Modernizr.video.ogg     // 'probably'
     ```
     */

    // Codec values from : github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
    //                     thx to NielsLeenheer and zcorpan

    // Note: in some older browsers, "no" was a return value instead of empty string.
    //   It was live in FF3.5.0 and 3.5.1, but fixed in 3.5.2
    //   It was also live in Safari 4.0.0 - 4.0.4, but fixed in 4.0.5

    Modernizr.addTest('video', function() {
        /* jshint -W053 */
        var elem = createElement('video');
        var bool = false;

        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if (bool = !!elem.canPlayType) {
                bool = new Boolean(bool);
                bool.ogg = elem.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, '');

                // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
                bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, '');

                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '');

                bool.vp9 = elem.canPlayType('video/webm; codecs="vp9"').replace(/^no$/, '');

                bool.hls = elem.canPlayType('application/x-mpegURL; codecs="avc1.42E01E"').replace(/^no$/, '');
            }
        } catch (e) {}

        return bool;
    });

    /*!
     {
     "name": "WebGL",
     "property": "webgl",
     "caniuse": "webgl",
     "tags": ["webgl", "graphics"],
     "polyfills": ["jebgl", "cwebgl", "iewebgl"]
     }
     !*/

    Modernizr.addTest('webgl', function() {
        var canvas = createElement('canvas');
        var supports = 'probablySupportsContext' in canvas ? 'probablySupportsContext' : 'supportsContext';
        if (supports in canvas) {
            return canvas[supports]('webgl') || canvas[supports]('experimental-webgl');
        }
        return 'WebGLRenderingContext' in window;
    });

    /*!
     {
     "name": "CSS Gradients",
     "caniuse": "css-gradients",
     "property": "cssgradients",
     "tags": ["css"],
     "knownBugs": ["False-positives on webOS (https://github.com/Modernizr/Modernizr/issues/202)"],
     "notes": [{
     "name": "Webkit Gradient Syntax",
     "href": "https://webkit.org/blog/175/introducing-css-gradients/"
     },{
     "name": "Linear Gradient Syntax",
     "href": "https://developer.mozilla.org/en-US/docs/Web/CSS/linear-gradient"
     },{
     "name": "W3C Gradient Spec",
     "href": "https://drafts.csswg.org/css-images-3/#gradients"
     }]
     }
     !*/


    Modernizr.addTest('cssgradients', function() {

        var str1 = 'background-image:';
        var str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));';
        var css = '';
        var angle;

        for (var i = 0, len = prefixes.length - 1; i < len; i++) {
            angle = (i === 0 ? 'to ' : '');
            css += str1 + prefixes[i] + 'linear-gradient(' + angle + 'left top, #9f9, white);';
        }

        if (Modernizr._config.usePrefixes) {
            // legacy webkit syntax (FIXME: remove when syntax not in use anymore)
            css += str1 + '-webkit-' + str2;
        }

        var elem = createElement('a');
        var style = elem.style;
        style.cssText = css;

        // IE6 returns undefined so cast to string
        return ('' + style.backgroundImage).indexOf('gradient') > -1;
    });

    /*!
     {
     "name": "CSS Multiple Backgrounds",
     "caniuse": "multibackgrounds",
     "property": "multiplebgs",
     "tags": ["css"]
     }
     !*/

    // Setting multiple images AND a color on the background shorthand property
    // and then querying the style.background property value for the number of
    // occurrences of "url(" is a reliable method for detecting ACTUAL support for this!

    Modernizr.addTest('multiplebgs', function() {
        var style = createElement('a').style;
        style.cssText = 'background:url(https://),url(https://),red url(https://)';

        // If the UA supports multiple backgrounds, there should be three occurrences
        // of the string "url(" in the return value for elemStyle.background
        return (/(url\s*\(.*?){3}/).test(style.background);
    });

    /*!
     {
     "name": "CSS Opacity",
     "caniuse": "css-opacity",
     "property": "opacity",
     "tags": ["css"]
     }
     !*/

    // Browsers that actually have CSS Opacity implemented have done so
    // according to spec, which means their return values are within the
    // range of [0.0,1.0] - including the leading zero.

    Modernizr.addTest('opacity', function() {
        var style = createElement('a').style;
        style.cssText = prefixes.join('opacity:.55;');

        // The non-literal . in this regex is intentional:
        // German Chrome returns this value as 0,55
        // github.com/Modernizr/Modernizr/issues/#issue/59/comment/516632
        return (/^0.55$/).test(style.opacity);
    });

    /*!
     {
     "name": "CSS rgba",
     "caniuse": "css3-colors",
     "property": "rgba",
     "tags": ["css"],
     "notes": [{
     "name": "CSSTricks Tutorial",
     "href": "https://css-tricks.com/rgba-browser-support/"
     }]
     }
     !*/

    Modernizr.addTest('rgba', function() {
        var style = createElement('a').style;
        style.cssText = 'background-color:rgba(150,255,150,.5)';

        return ('' + style.backgroundColor).indexOf('rgba') > -1;
    });

    /*!
     {
     "name": "Inline SVG",
     "property": "inlinesvg",
     "caniuse": "svg-html5",
     "tags": ["svg"],
     "notes": [{
     "name": "Test page",
     "href": "https://paulirish.com/demo/inline-svg"
     }, {
     "name": "Test page and results",
     "href": "https://codepen.io/eltonmesquita/full/GgXbvo/"
     }],
     "polyfills": ["inline-svg-polyfill"],
     "knownBugs": ["False negative on some Chromia browsers."]
     }
     !*/
    /* DOC
     Detects support for inline SVG in HTML (not within XHTML).
     */

    Modernizr.addTest('inlinesvg', function() {
        var div = createElement('div');
        div.innerHTML = '<svg/>';
        return (typeof SVGRect != 'undefined' && div.firstChild && div.firstChild.namespaceURI) == 'http://www.w3.org/2000/svg';
    });


    /**
     * cssToDOM takes a kebab-case string and converts it to camelCase
     * e.g. box-sizing -> boxSizing
     *
     * @access private
     * @function cssToDOM
     * @param {string} name - String name of kebab-case prop we want to convert
     * @returns {string} The camelCase version of the supplied name
     */

    function cssToDOM(name) {
        return name.replace(/([a-z])-([a-z])/g, function(str, m1, m2) {
            return m1 + m2.toUpperCase();
        }).replace(/^-/, '');
    };

    /**
     * since we have a fairly large number of input tests that don't mutate the input
     * we create a single element that can be shared with all of those tests for a
     * minor perf boost
     *
     * @access private
     * @returns {HTMLInputElement}
     */
    var inputElem = createElement('input');

    /*!
     {
     "name": "Input attributes",
     "property": "input",
     "tags": ["forms"],
     "authors": ["Mike Taylor"],
     "notes": [{
     "name": "WHATWG spec",
     "href": "https://html.spec.whatwg.org/multipage/forms.html#input-type-attr-summary"
     }],
     "knownBugs": ["Some blackberry devices report false positive for input.multiple"]
     }
     !*/
    /* DOC
     Detects support for HTML5 `<input>` element attributes and exposes Boolean subproperties with the results:

     ```javascript
     Modernizr.input.autocomplete
     Modernizr.input.autofocus
     Modernizr.input.list
     Modernizr.input.max
     Modernizr.input.min
     Modernizr.input.multiple
     Modernizr.input.pattern
     Modernizr.input.placeholder
     Modernizr.input.required
     Modernizr.input.step
     ```
     */

    // Run through HTML5's new input attributes to see if the UA understands any.
    // Mike Taylr has created a comprehensive resource for testing these attributes
    //   when applied to all input types:
    //   miketaylr.com/code/input-type-attr.html

    // Only input placeholder is tested while textarea's placeholder is not.
    // Currently Safari 4 and Opera 11 have support only for the input placeholder
    // Both tests are available in feature-detects/forms-placeholder.js

    var inputattrs = 'autocomplete autofocus list placeholder max min multiple pattern required step'.split(' ');
    var attrs = {};

    Modernizr.input = (function(props) {
        for (var i = 0, len = props.length; i < len; i++) {
            attrs[props[i]] = !!(props[i] in inputElem);
        }
        if (attrs.list) {
            // safari false positive's on datalist: webk.it/74252
            // see also github.com/Modernizr/Modernizr/issues/146
            attrs.list = !!(createElement('datalist') && window.HTMLDataListElement);
        }
        return attrs;
    })(inputattrs);

    /*!
     {
     "name": "Form input types",
     "property": "inputtypes",
     "caniuse": "forms",
     "tags": ["forms"],
     "authors": ["Mike Taylor"],
     "polyfills": [
     "jquerytools",
     "webshims",
     "h5f",
     "webforms2",
     "nwxforms",
     "fdslider",
     "html5slider",
     "galleryhtml5forms",
     "jscolor",
     "html5formshim",
     "selectedoptionsjs",
     "formvalidationjs"
     ]
     }
     !*/
    /* DOC
     Detects support for HTML5 form input types and exposes Boolean subproperties with the results:

     ```javascript
     Modernizr.inputtypes.color
     Modernizr.inputtypes.date
     Modernizr.inputtypes.datetime
     Modernizr.inputtypes['datetime-local']
     Modernizr.inputtypes.email
     Modernizr.inputtypes.month
     Modernizr.inputtypes.number
     Modernizr.inputtypes.range
     Modernizr.inputtypes.search
     Modernizr.inputtypes.tel
     Modernizr.inputtypes.time
     Modernizr.inputtypes.url
     Modernizr.inputtypes.week
     ```
     */

    // Run through HTML5's new input types to see if the UA understands any.
    //   This is put behind the tests runloop because it doesn't return a
    //   true/false like all the other tests; instead, it returns an object
    //   containing each input type with its corresponding true/false value

    // Big thanks to @miketaylr for the html5 forms expertise. miketaylr.com/
    var inputtypes = 'search tel url email datetime date month week time datetime-local number range color'.split(' ');
    var inputs = {};

    Modernizr.inputtypes = (function(props) {
        var len = props.length;
        var smile = '1)';
        var inputElemType;
        var defaultView;
        var bool;

        for (var i = 0; i < len; i++) {

            inputElem.setAttribute('type', inputElemType = props[i]);
            bool = inputElem.type !== 'text' && 'style' in inputElem;

            // We first check to see if the type we give it sticks..
            // If the type does, we feed it a textual value, which shouldn't be valid.
            // If the value doesn't stick, we know there's input sanitization which infers a custom UI
            if (bool) {

                inputElem.value = smile;
                inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                if (/^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined) {

                    docElement.appendChild(inputElem);
                    defaultView = document.defaultView;

                    // Safari 2-4 allows the smiley as a value, despite making a slider
                    bool = defaultView.getComputedStyle &&
                        defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                        // Mobile android web browser has false positive, so must
                        // check the height to see if the widget is actually there.
                        (inputElem.offsetHeight !== 0);

                    docElement.removeChild(inputElem);

                } else if (/^(search|tel)$/.test(inputElemType)) {
                    // Spec doesn't define any special parsing or detectable UI
                    //   behaviors so we pass these through as true

                    // Interestingly, opera fails the earlier test, so it doesn't
                    //  even make it here.

                } else if (/^(url|email)$/.test(inputElemType)) {
                    // Real url and email support comes with prebaked validation.
                    bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                } else {
                    // If the upgraded input compontent rejects the :) text, we got a winner
                    bool = inputElem.value != smile;
                }
            }

            inputs[props[i]] = !!bool;
        }
        return inputs;
    })(inputtypes);



    /**
     * contains checks to see if a string contains another string
     *
     * @access private
     * @function contains
     * @param {string} str - The string we want to check for substrings
     * @param {string} substr - The substring we want to search the first string for
     * @returns {boolean}
     */

    function contains(str, substr) {
        return !!~('' + str).indexOf(substr);
    }

    ;
    /*!
     {
     "name": "CSS HSLA Colors",
     "caniuse": "css3-colors",
     "property": "hsla",
     "tags": ["css"]
     }
     !*/

    Modernizr.addTest('hsla', function() {
        var style = createElement('a').style;
        style.cssText = 'background-color:hsla(120,40%,100%,.5)';
        return contains(style.backgroundColor, 'rgba') || contains(style.backgroundColor, 'hsla');
    });

    /*!
     {
     "name": "CSS Supports",
     "property": "supports",
     "caniuse": "css-featurequeries",
     "tags": ["css"],
     "builderAliases": ["css_supports"],
     "notes": [{
     "name": "W3 Spec",
     "href": "http://dev.w3.org/csswg/css3-conditional/#at-supports"
     },{
     "name": "Related Github Issue",
     "href": "github.com/Modernizr/Modernizr/issues/648"
     },{
     "name": "W3 Info",
     "href": "http://dev.w3.org/csswg/css3-conditional/#the-csssupportsrule-interface"
     }]
     }
     !*/

    var newSyntax = 'CSS' in window && 'supports' in window.CSS;
    var oldSyntax = 'supportsCSS' in window;
    Modernizr.addTest('supports', newSyntax || oldSyntax);


    /**
     * Object.prototype.toString can be used with every object and allows you to
     * get its class easily. Abstracting it off of an object prevents situations
     * where the toString property has been overridden
     *
     * @access private
     * @function toStringFn
     * @returns {function} An abstracted toString function
     */

    var toStringFn = ({}).toString;

    /*!
     {
     "name": "SVG clip paths",
     "property": "svgclippaths",
     "tags": ["svg"],
     "notes": [{
     "name": "Demo",
     "href": "http://srufaculty.sru.edu/david.dailey/svg/newstuff/clipPath4.svg"
     }]
     }
     !*/
    /* DOC
     Detects support for clip paths in SVG (only, not on HTML content).

     See [this discussion](https://github.com/Modernizr/Modernizr/issues/213) regarding applying SVG clip paths to HTML content.
     */

    Modernizr.addTest('svgclippaths', function() {
        return !!document.createElementNS &&
            /SVGClipPath/.test(toStringFn.call(document.createElementNS('http://www.w3.org/2000/svg', 'clipPath')));
    });

    /*!
     {
     "name": "SVG SMIL animation",
     "property": "smil",
     "caniuse": "svg-smil",
     "tags": ["svg"],
     "notes": [{
     "name": "W3C Synchronised Multimedia spec",
     "href": "https://www.w3.org/AudioVideo/"
     }]
     }
     !*/

    // SVG SMIL animation
    Modernizr.addTest('smil', function() {
        return !!document.createElementNS &&
            /SVGAnimate/.test(toStringFn.call(document.createElementNS('http://www.w3.org/2000/svg', 'animate')));
    });


    /**
     * getBody returns the body of a document, or an element that can stand in for
     * the body if a real body does not exist
     *
     * @access private
     * @function getBody
     * @returns {HTMLElement|SVGElement} Returns the real body of a document, or an
     * artificially created element that stands in for the body
     */

    function getBody() {
        // After page load injecting a fake body doesn't work so check if body exists
        var body = document.body;

        if (!body) {
            // Can't use the real body create a fake one.
            body = createElement(isSVG ? 'svg' : 'body');
            body.fake = true;
        }

        return body;
    }

    ;

    /**
     * injectElementWithStyles injects an element with style element and some CSS rules
     *
     * @access private
     * @function injectElementWithStyles
     * @param {string} rule - String representing a css rule
     * @param {function} callback - A function that is used to test the injected element
     * @param {number} [nodes] - An integer representing the number of additional nodes you want injected
     * @param {string[]} [testnames] - An array of strings that are used as ids for the additional nodes
     * @returns {boolean}
     */

    function injectElementWithStyles(rule, callback, nodes, testnames) {
        var mod = 'modernizr';
        var style;
        var ret;
        var node;
        var docOverflow;
        var div = createElement('div');
        var body = getBody();

        if (parseInt(nodes, 10)) {
            // In order not to give false positives we create a node for each test
            // This also allows the method to scale for unspecified uses
            while (nodes--) {
                node = createElement('div');
                node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
                div.appendChild(node);
            }
        }

        style = createElement('style');
        style.type = 'text/css';
        style.id = 's' + mod;

        // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
        // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
        (!body.fake ? div : body).appendChild(style);
        body.appendChild(div);

        if (style.styleSheet) {
            style.styleSheet.cssText = rule;
        } else {
            style.appendChild(document.createTextNode(rule));
        }
        div.id = mod;

        if (body.fake) {
            //avoid crashing IE8, if background image is used
            body.style.background = '';
            //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
            body.style.overflow = 'hidden';
            docOverflow = docElement.style.overflow;
            docElement.style.overflow = 'hidden';
            docElement.appendChild(body);
        }

        ret = callback(div, rule);
        // If this is done after page load we don't want to remove the body so check if body exists
        if (body.fake) {
            body.parentNode.removeChild(body);
            docElement.style.overflow = docOverflow;
            // Trigger layout so kinetic scrolling isn't disabled in iOS6+
            docElement.offsetHeight;
        } else {
            div.parentNode.removeChild(div);
        }

        return !!ret;

    }

    ;

    /**
     * Modernizr.mq tests a given media query, live against the current state of the window
     * adapted from matchMedia polyfill by Scott Jehl and Paul Irish
     * gist.github.com/786768
     *
     * @memberof Modernizr
     * @name Modernizr.mq
     * @optionName Modernizr.mq()
     * @optionProp mq
     * @access public
     * @function mq
     * @param {string} mq - String of the media query we want to test
     * @returns {boolean}
     * @example
     * Modernizr.mq allows for you to programmatically check if the current browser
     * window state matches a media query.
     *
     * ```js
     *  var query = Modernizr.mq('(min-width: 900px)');
     *
     *  if (query) {
     *    // the browser window is larger than 900px
     *  }
     * ```
     *
     * Only valid media queries are supported, therefore you must always include values
     * with your media query
     *
     * ```js
     * // good
     *  Modernizr.mq('(min-width: 900px)');
     *
     * // bad
     *  Modernizr.mq('min-width');
     * ```
     *
     * If you would just like to test that media queries are supported in general, use
     *
     * ```js
     *  Modernizr.mq('only all'); // true if MQ are supported, false if not
     * ```
     *
     *
     * Note that if the browser does not support media queries (e.g. old IE) mq will
     * always return false.
     */

    var mq = (function() {
        var matchMedia = window.matchMedia || window.msMatchMedia;
        if (matchMedia) {
            return function(mq) {
                var mql = matchMedia(mq);
                return mql && mql.matches || false;
            };
        }

        return function(mq) {
            var bool = false;

            injectElementWithStyles('@media ' + mq + ' { #modernizr { position: absolute; } }', function(node) {
                bool = (window.getComputedStyle ?
                    window.getComputedStyle(node, null) :
                    node.currentStyle).position == 'absolute';
            });

            return bool;
        };
    })();


    ModernizrProto.mq = mq;



    /**
     * testStyles injects an element with style element and some CSS rules
     *
     * @memberof Modernizr
     * @name Modernizr.testStyles
     * @optionName Modernizr.testStyles()
     * @optionProp testStyles
     * @access public
     * @function testStyles
     * @param {string} rule - String representing a css rule
     * @param {function} callback - A function that is used to test the injected element
     * @param {number} [nodes] - An integer representing the number of additional nodes you want injected
     * @param {string[]} [testnames] - An array of strings that are used as ids for the additional nodes
     * @returns {boolean}
     * @example
     *
     * `Modernizr.testStyles` takes a CSS rule and injects it onto the current page
     * along with (possibly multiple) DOM elements. This lets you check for features
     * that can not be detected by simply checking the [IDL](https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Interface_development_guide/IDL_interface_rules).
     *
     * ```js
     * Modernizr.testStyles('#modernizr { width: 9px; color: papayawhip; }', function(elem, rule) {
     *   // elem is the first DOM node in the page (by default #modernizr)
     *   // rule is the first argument you supplied - the CSS rule in string form
     *
     *   addTest('widthworks', elem.style.width === '9px')
     * });
     * ```
     *
     * If your test requires multiple nodes, you can include a third argument
     * indicating how many additional div elements to include on the page. The
     * additional nodes are injected as children of the `elem` that is returned as
     * the first argument to the callback.
     *
     * ```js
     * Modernizr.testStyles('#modernizr {width: 1px}; #modernizr2 {width: 2px}', function(elem) {
     *   document.getElementById('modernizr').style.width === '1px'; // true
     *   document.getElementById('modernizr2').style.width === '2px'; // true
     *   elem.firstChild === document.getElementById('modernizr2'); // true
     * }, 1);
     * ```
     *
     * By default, all of the additional elements have an ID of `modernizr[n]`, where
     * `n` is its index (e.g. the first additional, second overall is `#modernizr2`,
     * the second additional is `#modernizr3`, etc.).
     * If you want to have more meaningful IDs for your function, you can provide
     * them as the fourth argument, as an array of strings
     *
     * ```js
     * Modernizr.testStyles('#foo {width: 10px}; #bar {height: 20px}', function(elem) {
     *   elem.firstChild === document.getElementById('foo'); // true
     *   elem.lastChild === document.getElementById('bar'); // true
     * }, 2, ['foo', 'bar']);
     * ```
     *
     */

    var testStyles = ModernizrProto.testStyles = injectElementWithStyles;

    /*!
     {
     "name": "@font-face",
     "property": "fontface",
     "authors": ["Diego Perini", "Mat Marquis"],
     "tags": ["css"],
     "knownBugs": [
     "False Positive: WebOS https://github.com/Modernizr/Modernizr/issues/342",
     "False Postive: WP7 https://github.com/Modernizr/Modernizr/issues/538"
     ],
     "notes": [{
     "name": "@font-face detection routine by Diego Perini",
     "href": "http://javascript.nwbox.com/CSSSupport/"
     },{
     "name": "Filament Group @font-face compatibility research",
     "href": "https://docs.google.com/presentation/d/1n4NyG4uPRjAA8zn_pSQ_Ket0RhcWC6QlZ6LMjKeECo0/edit#slide=id.p"
     },{
     "name": "Filament Grunticon/@font-face device testing results",
     "href": "https://docs.google.com/spreadsheet/ccc?key=0Ag5_yGvxpINRdHFYeUJPNnZMWUZKR2ItMEpRTXZPdUE#gid=0"
     },{
     "name": "CSS fonts on Android",
     "href": "https://stackoverflow.com/questions/3200069/css-fonts-on-android"
     },{
     "name": "@font-face and Android",
     "href": "http://archivist.incutio.com/viewlist/css-discuss/115960"
     }]
     }
     !*/

    var blacklist = (function() {
        var ua = navigator.userAgent;
        var wkvers = ua.match(/applewebkit\/([0-9]+)/gi) && parseFloat(RegExp.$1);
        var webos = ua.match(/w(eb)?osbrowser/gi);
        var wppre8 = ua.match(/windows phone/gi) && ua.match(/iemobile\/([0-9])+/gi) && parseFloat(RegExp.$1) >= 9;
        var oldandroid = wkvers < 533 && ua.match(/android/gi);
        return webos || oldandroid || wppre8;
    }());
    if (blacklist) {
        Modernizr.addTest('fontface', false);
    } else {
        testStyles('@font-face {font-family:"font";src:url("https://")}', function(node, rule) {
            var style = document.getElementById('smodernizr');
            var sheet = style.sheet || style.styleSheet;
            var cssText = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : '';
            var bool = /src/i.test(cssText) && cssText.indexOf(rule.split(' ')[0]) === 0;
            Modernizr.addTest('fontface', bool);
        });
    };
    /*!
     {
     "name": "CSS Generated Content",
     "property": "generatedcontent",
     "tags": ["css"],
     "warnings": ["Android won't return correct height for anything below 7px #738"],
     "notes": [{
     "name": "W3C CSS Selectors Level 3 spec",
     "href": "https://www.w3.org/TR/css3-selectors/#gen-content"
     },{
     "name": "MDN article on :before",
     "href": "https://developer.mozilla.org/en-US/docs/Web/CSS/::before"
     },{
     "name": "MDN article on :after",
     "href": "https://developer.mozilla.org/en-US/docs/Web/CSS/::before"
     }]
     }
     !*/

    testStyles('#modernizr{font:0/0 a}#modernizr:after{content:":)";visibility:hidden;font:7px/1 a}', function(node) {
        Modernizr.addTest('generatedcontent', node.offsetHeight >= 7);
    });


    var cssomPrefixes = (ModernizrProto._config.usePrefixes ? omPrefixes.split(' ') : []);
    ModernizrProto._cssomPrefixes = cssomPrefixes;


    /**
     * atRule returns a given CSS property at-rule (eg @keyframes), possibly in
     * some prefixed form, or false, in the case of an unsupported rule
     *
     * @memberof Modernizr
     * @name Modernizr.atRule
     * @optionName Modernizr.atRule()
     * @optionProp atRule
     * @access public
     * @function atRule
     * @param {string} prop - String name of the @-rule to test for
     * @returns {string|boolean} The string representing the (possibly prefixed)
     * valid version of the @-rule, or `false` when it is unsupported.
     * @example
     * ```js
     *  var keyframes = Modernizr.atRule('@keyframes');
     *
     *  if (keyframes) {
     *    // keyframes are supported
     *    // could be `@-webkit-keyframes` or `@keyframes`
     *  } else {
     *    // keyframes === `false`
     *  }
     * ```
     *
     */

    var atRule = function(prop) {
        var length = prefixes.length;
        var cssrule = window.CSSRule;
        var rule;

        if (typeof cssrule === 'undefined') {
            return undefined;
        }

        if (!prop) {
            return false;
        }

        // remove literal @ from beginning of provided property
        prop = prop.replace(/^@/, '');

        // CSSRules use underscores instead of dashes
        rule = prop.replace(/-/g, '_').toUpperCase() + '_RULE';

        if (rule in cssrule) {
            return '@' + prop;
        }

        for (var i = 0; i < length; i++) {
            // prefixes gives us something like -o-, and we want O_
            var prefix = prefixes[i];
            var thisRule = prefix.toUpperCase() + '_' + rule;

            if (thisRule in cssrule) {
                return '@-' + prefix.toLowerCase() + '-' + prop;
            }
        }

        return false;
    };

    ModernizrProto.atRule = atRule;



    /**
     * fnBind is a super small [bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind) polyfill.
     *
     * @access private
     * @function fnBind
     * @param {function} fn - a function you want to change `this` reference to
     * @param {object} that - the `this` you want to call the function with
     * @returns {function} The wrapped version of the supplied function
     */

    function fnBind(fn, that) {
        return function() {
            return fn.apply(that, arguments);
        };
    }

    ;

    /**
     * testDOMProps is a generic DOM property test; if a browser supports
     *   a certain property, it won't return undefined for it.
     *
     * @access private
     * @function testDOMProps
     * @param {array.<string>} props - An array of properties to test for
     * @param {object} obj - An object or Element you want to use to test the parameters again
     * @param {boolean|object} elem - An Element to bind the property lookup again. Use `false` to prevent the check
     */
    function testDOMProps(props, obj, elem) {
        var item;

        for (var i in props) {
            if (props[i] in obj) {

                // return the property name as a string
                if (elem === false) {
                    return props[i];
                }

                item = obj[props[i]];

                // let's bind a function
                if (is(item, 'function')) {
                    // bind to obj unless overriden
                    return fnBind(item, elem || obj);
                }

                // return the unbound function or obj or value
                return item;
            }
        }
        return false;
    }

    ;

    /**
     * Create our "modernizr" element that we do most feature tests on.
     *
     * @access private
     */

    var modElem = {
        elem: createElement('modernizr')
    };

    // Clean up this element
    Modernizr._q.push(function() {
        delete modElem.elem;
    });



    var mStyle = {
        style: modElem.elem.style
    };

    // kill ref for gc, must happen before mod.elem is removed, so we unshift on to
    // the front of the queue.
    Modernizr._q.unshift(function() {
        delete mStyle.style;
    });



    /**
     * domToCSS takes a camelCase string and converts it to kebab-case
     * e.g. boxSizing -> box-sizing
     *
     * @access private
     * @function domToCSS
     * @param {string} name - String name of camelCase prop we want to convert
     * @returns {string} The kebab-case version of the supplied name
     */

    function domToCSS(name) {
        return name.replace(/([A-Z])/g, function(str, m1) {
            return '-' + m1.toLowerCase();
        }).replace(/^ms-/, '-ms-');
    };

    /**
     * nativeTestProps allows for us to use native feature detection functionality if available.
     * some prefixed form, or false, in the case of an unsupported rule
     *
     * @access private
     * @function nativeTestProps
     * @param {array} props - An array of property names
     * @param {string} value - A string representing the value we want to check via @supports
     * @returns {boolean|undefined} A boolean when @supports exists, undefined otherwise
     */

    // Accepts a list of property names and a single value
    // Returns `undefined` if native detection not available
    function nativeTestProps(props, value) {
        var i = props.length;
        // Start with the JS API: http://www.w3.org/TR/css3-conditional/#the-css-interface
        if ('CSS' in window && 'supports' in window.CSS) {
            // Try every prefixed variant of the property
            while (i--) {
                if (window.CSS.supports(domToCSS(props[i]), value)) {
                    return true;
                }
            }
            return false;
        }
        // Otherwise fall back to at-rule (for Opera 12.x)
        else if ('CSSSupportsRule' in window) {
            // Build a condition string for every prefixed variant
            var conditionText = [];
            while (i--) {
                conditionText.push('(' + domToCSS(props[i]) + ':' + value + ')');
            }
            conditionText = conditionText.join(' or ');
            return injectElementWithStyles('@supports (' + conditionText + ') { #modernizr { position: absolute; } }', function(node) {
                return getComputedStyle(node, null).position == 'absolute';
            });
        }
        return undefined;
    };

    // testProps is a generic CSS / DOM property test.

    // In testing support for a given CSS property, it's legit to test:
    //    `elem.style[styleName] !== undefined`
    // If the property is supported it will return an empty string,
    // if unsupported it will return undefined.

    // We'll take advantage of this quick test and skip setting a style
    // on our modernizr element, but instead just testing undefined vs
    // empty string.

    // Property names can be provided in either camelCase or kebab-case.

    function testProps(props, prefixed, value, skipValueTest) {
        skipValueTest = is(skipValueTest, 'undefined') ? false : skipValueTest;

        // Try native detect first
        if (!is(value, 'undefined')) {
            var result = nativeTestProps(props, value);
            if (!is(result, 'undefined')) {
                return result;
            }
        }

        // Otherwise do it properly
        var afterInit, i, propsLength, prop, before;

        // If we don't have a style element, that means we're running async or after
        // the core tests, so we'll need to create our own elements to use

        // inside of an SVG element, in certain browsers, the `style` element is only
        // defined for valid tags. Therefore, if `modernizr` does not have one, we
        // fall back to a less used element and hope for the best.
        var elems = ['modernizr', 'tspan'];
        while (!mStyle.style) {
            afterInit = true;
            mStyle.modElem = createElement(elems.shift());
            mStyle.style = mStyle.modElem.style;
        }

        // Delete the objects if we created them.
        function cleanElems() {
            if (afterInit) {
                delete mStyle.style;
                delete mStyle.modElem;
            }
        }

        propsLength = props.length;
        for (i = 0; i < propsLength; i++) {
            prop = props[i];
            before = mStyle.style[prop];

            if (contains(prop, '-')) {
                prop = cssToDOM(prop);
            }

            if (mStyle.style[prop] !== undefined) {

                // If value to test has been passed in, do a set-and-check test.
                // 0 (integer) is a valid property value, so check that `value` isn't
                // undefined, rather than just checking it's truthy.
                if (!skipValueTest && !is(value, 'undefined')) {

                    // Needs a try catch block because of old IE. This is slow, but will
                    // be avoided in most cases because `skipValueTest` will be used.
                    try {
                        mStyle.style[prop] = value;
                    } catch (e) {}

                    // If the property value has changed, we assume the value used is
                    // supported. If `value` is empty string, it'll fail here (because
                    // it hasn't changed), which matches how browsers have implemented
                    // CSS.supports()
                    if (mStyle.style[prop] != before) {
                        cleanElems();
                        return prefixed == 'pfx' ? prop : true;
                    }
                }
                // Otherwise just return true, or the property name if this is a
                // `prefixed()` call
                else {
                    cleanElems();
                    return prefixed == 'pfx' ? prop : true;
                }
            }
        }
        cleanElems();
        return false;
    }

    ;

    /**
     * testProp() investigates whether a given style property is recognized
     * Property names can be provided in either camelCase or kebab-case.
     *
     * @memberof Modernizr
     * @name Modernizr.testProp
     * @access public
     * @optionName Modernizr.testProp()
     * @optionProp testProp
     * @function testProp
     * @param {string} prop - Name of the CSS property to check
     * @param {string} [value] - Name of the CSS value to check
     * @param {boolean} [useValue] - Whether or not to check the value if @supports isn't supported
     * @returns {boolean}
     * @example
     *
     * Just like [testAllProps](#modernizr-testallprops), only it does not check any vendor prefixed
     * version of the string.
     *
     * Note that the property name must be provided in camelCase (e.g. boxSizing not box-sizing)
     *
     * ```js
     * Modernizr.testProp('pointerEvents')  // true
     * ```
     *
     * You can also provide a value as an optional second argument to check if a
     * specific value is supported
     *
     * ```js
     * Modernizr.testProp('pointerEvents', 'none') // true
     * Modernizr.testProp('pointerEvents', 'penguin') // false
     * ```
     */

    var testProp = ModernizrProto.testProp = function(prop, value, useValue) {
        return testProps([prop], undefined, value, useValue);
    };

    /*!
     {
     "name": "CSS textshadow",
     "property": "textshadow",
     "caniuse": "css-textshadow",
     "tags": ["css"],
     "knownBugs": ["FF3.0 will false positive on this test"]
     }
     !*/

    Modernizr.addTest('textshadow', testProp('textShadow', '1px 1px'));


    /**
     * testPropsAll tests a list of DOM properties we want to check against.
     * We specify literally ALL possible (known and/or likely) properties on
     * the element including the non-vendor prefixed one, for forward-
     * compatibility.
     *
     * @access private
     * @function testPropsAll
     * @param {string} prop - A string of the property to test for
     * @param {string|object} [prefixed] - An object to check the prefixed properties on. Use a string to skip
     * @param {HTMLElement|SVGElement} [elem] - An element used to test the property and value against
     * @param {string} [value] - A string of a css value
     * @param {boolean} [skipValueTest] - An boolean representing if you want to test if value sticks when set
     */
    function testPropsAll(prop, prefixed, elem, value, skipValueTest) {

        var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1),
            props = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

        // did they call .prefixed('boxSizing') or are we just testing a prop?
        if (is(prefixed, 'string') || is(prefixed, 'undefined')) {
            return testProps(props, prefixed, value, skipValueTest);

            // otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
        } else {
            props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
            return testDOMProps(props, prefixed, elem);
        }
    }

    // Modernizr.testAllProps() investigates whether a given style property,
    // or any of its vendor-prefixed variants, is recognized
    //
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testAllProps('boxSizing')
    ModernizrProto.testAllProps = testPropsAll;



    /**
     * prefixed returns the prefixed or nonprefixed property name variant of your input
     *
     * @memberof Modernizr
     * @name Modernizr.prefixed
     * @optionName Modernizr.prefixed()
     * @optionProp prefixed
     * @access public
     * @function prefixed
     * @param {string} prop - String name of the property to test for
     * @param {object} [obj] - An object to test for the prefixed properties on
     * @param {HTMLElement} [elem] - An element used to test specific properties against
     * @returns {string|false} The string representing the (possibly prefixed) valid
     * version of the property, or `false` when it is unsupported.
     * @example
     *
     * Modernizr.prefixed takes a string css value in the DOM style camelCase (as
     * opposed to the css style kebab-case) form and returns the (possibly prefixed)
     * version of that property that the browser actually supports.
     *
     * For example, in older Firefox...
     * ```js
     * prefixed('boxSizing')
     * ```
     * returns 'MozBoxSizing'
     *
     * In newer Firefox, as well as any other browser that support the unprefixed
     * version would simply return `boxSizing`. Any browser that does not support
     * the property at all, it will return `false`.
     *
     * By default, prefixed is checked against a DOM element. If you want to check
     * for a property on another object, just pass it as a second argument
     *
     * ```js
     * var rAF = prefixed('requestAnimationFrame', window);
     *
     * raf(function() {
     *  renderFunction();
     * })
     * ```
     *
     * Note that this will return _the actual function_ - not the name of the function.
     * If you need the actual name of the property, pass in `false` as a third argument
     *
     * ```js
     * var rAFProp = prefixed('requestAnimationFrame', window, false);
     *
     * rafProp === 'WebkitRequestAnimationFrame' // in older webkit
     * ```
     *
     * One common use case for prefixed is if you're trying to determine which transition
     * end event to bind to, you might do something like...
     * ```js
     * var transEndEventNames = {
     *     'WebkitTransition' : 'webkitTransitionEnd', * Saf 6, Android Browser
     *     'MozTransition'    : 'transitionend',       * only for FF < 15
     *     'transition'       : 'transitionend'        * IE10, Opera, Chrome, FF 15+, Saf 7+
     * };
     *
     * var transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];
     * ```
     *
     * If you want a similar lookup, but in kebab-case, you can use [prefixedCSS](#modernizr-prefixedcss).
     */

    var prefixed = ModernizrProto.prefixed = function(prop, obj, elem) {
        if (prop.indexOf('@') === 0) {
            return atRule(prop);
        }

        if (prop.indexOf('-') != -1) {
            // Convert kebab-case to camelCase
            prop = cssToDOM(prop);
        }
        if (!obj) {
            return testPropsAll(prop, 'pfx');
        } else {
            // Testing DOM property e.g. Modernizr.prefixed('requestAnimationFrame', window) // 'mozRequestAnimationFrame'
            return testPropsAll(prop, obj, elem);
        }
    };


    /*!
     {
     "name": "IndexedDB",
     "property": "indexeddb",
     "caniuse": "indexeddb",
     "tags": ["storage"],
     "polyfills": ["indexeddb"]
     }
     !*/
    /* DOC
     Detects support for the IndexedDB client-side storage API (final spec).
     */

    // Vendors had inconsistent prefixing with the experimental Indexed DB:
    // - Webkit's implementation is accessible through webkitIndexedDB
    // - Firefox shipped moz_indexedDB before FF4b9, but since then has been mozIndexedDB
    // For speed, we don't test the legacy (and beta-only) indexedDB

    var indexeddb;
    try {
        indexeddb = prefixed('indexedDB', window);
    } catch (e) {}

    Modernizr.addTest('indexeddb', !!indexeddb);

    if (!!indexeddb) {
        Modernizr.addTest('indexeddb.deletedatabase', 'deleteDatabase' in indexeddb);
    };

    /**
     * testAllProps determines whether a given CSS property is supported in the browser
     *
     * @memberof Modernizr
     * @name Modernizr.testAllProps
     * @optionName Modernizr.testAllProps()
     * @optionProp testAllProps
     * @access public
     * @function testAllProps
     * @param {string} prop - String naming the property to test (either camelCase or kebab-case)
     * @param {string} [value] - String of the value to test
     * @param {boolean} [skipValueTest=false] - Whether to skip testing that the value is supported when using non-native detection
     * @example
     *
     * testAllProps determines whether a given CSS property, in some prefixed form,
     * is supported by the browser.
     *
     * ```js
     * testAllProps('boxSizing')  // true
     * ```
     *
     * It can optionally be given a CSS value in string form to test if a property
     * value is valid
     *
     * ```js
     * testAllProps('display', 'block') // true
     * testAllProps('display', 'penguin') // false
     * ```
     *
     * A boolean can be passed as a third parameter to skip the value check when
     * native detection (@supports) isn't available.
     *
     * ```js
     * testAllProps('shapeOutside', 'content-box', true);
     * ```
     */

    function testAllProps(prop, value, skipValueTest) {
        return testPropsAll(prop, undefined, undefined, value, skipValueTest);
    }
    ModernizrProto.testAllProps = testAllProps;

    /*!
     {
     "name": "CSS Animations",
     "property": "cssanimations",
     "caniuse": "css-animation",
     "polyfills": ["transformie", "csssandpaper"],
     "tags": ["css"],
     "warnings": ["Android < 4 will pass this test, but can only animate a single property at a time"],
     "notes": [{
     "name" : "Article: 'Dispelling the Android CSS animation myths'",
     "href": "https://goo.gl/OGw5Gm"
     }]
     }
     !*/
    /* DOC
     Detects whether or not elements can be animated using CSS
     */

    Modernizr.addTest('cssanimations', testAllProps('animationName', 'a', true));

    /*!
     {
     "name": "Background Size",
     "property": "backgroundsize",
     "tags": ["css"],
     "knownBugs": ["This will false positive in Opera Mini - https://github.com/Modernizr/Modernizr/issues/396"],
     "notes": [{
     "name": "Related Issue",
     "href": "https://github.com/Modernizr/Modernizr/issues/396"
     }]
     }
     !*/

    Modernizr.addTest('backgroundsize', testAllProps('backgroundSize', '100%', true));

    /*!
     {
     "name": "Border Image",
     "property": "borderimage",
     "caniuse": "border-image",
     "polyfills": ["css3pie"],
     "knownBugs": ["Android < 2.0 is true, but has a broken implementation"],
     "tags": ["css"]
     }
     !*/

    Modernizr.addTest('borderimage', testAllProps('borderImage', 'url() 1', true));

    /*!
     {
     "name": "Border Radius",
     "property": "borderradius",
     "caniuse": "border-radius",
     "polyfills": ["css3pie"],
     "tags": ["css"],
     "notes": [{
     "name": "Comprehensive Compat Chart",
     "href": "https://muddledramblings.com/table-of-css3-border-radius-compliance"
     }]
     }
     !*/

    Modernizr.addTest('borderradius', testAllProps('borderRadius', '0px', true));

    /*!
     {
     "name": "Box Shadow",
     "property": "boxshadow",
     "caniuse": "css-boxshadow",
     "tags": ["css"],
     "knownBugs": [
     "WebOS false positives on this test.",
     "The Kindle Silk browser false positives"
     ]
     }
     !*/

    Modernizr.addTest('boxshadow', testAllProps('boxShadow', '1px 1px', true));

    /*!
     {
     "name": "CSS Columns",
     "property": "csscolumns",
     "caniuse": "multicolumn",
     "polyfills": ["css3multicolumnjs"],
     "tags": ["css"]
     }
     !*/


    (function() {

        /* jshint -W053 */
        Modernizr.addTest('csscolumns', function() {
            var bool = false;
            var test = testAllProps('columnCount');
            try {
                if (bool = !!test) {
                    bool = new Boolean(bool);
                }
            } catch (e) {}

            return bool;
        });

        var props = ['Width', 'Span', 'Fill', 'Gap', 'Rule', 'RuleColor', 'RuleStyle', 'RuleWidth', 'BreakBefore', 'BreakAfter', 'BreakInside'];
        var name, test;

        for (var i = 0; i < props.length; i++) {
            name = props[i].toLowerCase();
            test = testAllProps('column' + props[i]);

            // break-before, break-after & break-inside are not "column"-prefixed in spec
            if (name === 'breakbefore' || name === 'breakafter' || name == 'breakinside') {
                test = test || testAllProps(props[i]);
            }

            Modernizr.addTest('csscolumns.' + name, test);
        }


    })();


    /*!
     {
     "name": "Flexbox",
     "property": "flexbox",
     "caniuse": "flexbox",
     "tags": ["css"],
     "notes": [{
     "name": "The _new_ flexbox",
     "href": "http://dev.w3.org/csswg/css3-flexbox"
     }],
     "warnings": [
     "A `true` result for this detect does not imply that the `flex-wrap` property is supported; see the `flexwrap` detect."
     ]
     }
     !*/
    /* DOC
     Detects support for the Flexible Box Layout model, a.k.a. Flexbox, which allows easy manipulation of layout order and sizing within a container.
     */

    Modernizr.addTest('flexbox', testAllProps('flexBasis', '1px', true));

    /*!
     {
     "name": "CSS Reflections",
     "caniuse": "css-reflections",
     "property": "cssreflections",
     "tags": ["css"]
     }
     !*/

    Modernizr.addTest('cssreflections', testAllProps('boxReflect', 'above', true));

    /*!
     {
     "name": "CSS Transforms",
     "property": "csstransforms",
     "caniuse": "transforms2d",
     "tags": ["css"]
     }
     !*/

    Modernizr.addTest('csstransforms', function() {
        // Android < 3.0 is buggy, so we sniff and blacklist
        // http://git.io/hHzL7w
        return navigator.userAgent.indexOf('Android 2.') === -1 &&
            testAllProps('transform', 'scale(1)', true);
    });

    /*!
     {
     "name": "CSS Transforms 3D",
     "property": "csstransforms3d",
     "caniuse": "transforms3d",
     "tags": ["css"],
     "warnings": [
     "Chrome may occassionally fail this test on some systems; more info: https://code.google.com/p/chromium/issues/detail?id=129004"
     ]
     }
     !*/

    Modernizr.addTest('csstransforms3d', function() {
        var ret = !!testAllProps('perspective', '1px', true);
        var usePrefix = Modernizr._config.usePrefixes;

        // Webkit's 3D transforms are passed off to the browser's own graphics renderer.
        //   It works fine in Safari on Leopard and Snow Leopard, but not in Chrome in
        //   some conditions. As a result, Webkit typically recognizes the syntax but
        //   will sometimes throw a false positive, thus we must do a more thorough check:
        if (ret && (!usePrefix || 'webkitPerspective' in docElement.style)) {
            var mq;
            var defaultStyle = '#modernizr{width:0;height:0}';
            // Use CSS Conditional Rules if available
            if (Modernizr.supports) {
                mq = '@supports (perspective: 1px)';
            } else {
                // Otherwise, Webkit allows this media query to succeed only if the feature is enabled.
                // `@media (transform-3d),(-webkit-transform-3d){ ... }`
                mq = '@media (transform-3d)';
                if (usePrefix) {
                    mq += ',(-webkit-transform-3d)';
                }
            }

            mq += '{#modernizr{width:7px;height:18px;margin:0;padding:0;border:0}}';

            testStyles(defaultStyle + mq, function(elem) {
                ret = elem.offsetWidth === 7 && elem.offsetHeight === 18;
            });
        }

        return ret;
    });

    /*!
     {
     "name": "CSS Transitions",
     "property": "csstransitions",
     "caniuse": "css-transitions",
     "tags": ["css"]
     }
     !*/

    Modernizr.addTest('csstransitions', testAllProps('transition', 'all', true));


    // Run each test
    testRunner();

    // Remove the "no-js" class if it exists
    setClasses(classes);

    delete ModernizrProto.addTest;
    delete ModernizrProto.addAsyncTest;

    // Run the things that are supposed to run after the tests
    for (var i = 0; i < Modernizr._q.length; i++) {
        Modernizr._q[i]();
    }

    // Leak Modernizr namespace
    window.Modernizr = Modernizr;


    ;

})(window, document);
/*!
 * Salvattore 1.0.9 by @rnmp and @ppold
 * https://github.com/rnmp/salvattore
 */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.salvattore = factory();
    }
}(this, function() {
    /*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */

    if (!window.matchMedia) {
        window.matchMedia = function() {
            "use strict";

            // For browsers that support matchMedium api such as IE 9 and webkit
            var styleMedia = (window.styleMedia || window.media);

            // For those that don't support matchMedium
            if (!styleMedia) {
                var style = document.createElement('style'),
                    script = document.getElementsByTagName('script')[0],
                    info = null;

                style.type = 'text/css';
                style.id = 'matchmediajs-test';

                script.parentNode.insertBefore(style, script);

                // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
                info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

                styleMedia = {
                    matchMedium: function(media) {
                        var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

                        // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
                        if (style.styleSheet) {
                            style.styleSheet.cssText = text;
                        } else {
                            style.textContent = text;
                        }

                        // Test if media query is true or false
                        return info.width === '1px';
                    }
                };
            }

            return function(media) {
                return {
                    matches: styleMedia.matchMedium(media || 'all'),
                    media: media || 'all'
                };
            };
        }();
    }

    /*! matchMedia() polyfill addListener/removeListener extension. Author & copyright (c) 2012: Scott Jehl. Dual MIT/BSD license */
    (function() {
        "use strict";

        // Bail out for browsers that have addListener support
        if (window.matchMedia && window.matchMedia('all').addListener) {
            return false;
        }

        var localMatchMedia = window.matchMedia,
            hasMediaQueries = localMatchMedia('only all').matches,
            isListening = false,
            timeoutID = 0, // setTimeout for debouncing 'handleChange'
            queries = [], // Contains each 'mql' and associated 'listeners' if 'addListener' is used
            handleChange = function(evt) {
                // Debounce
                clearTimeout(timeoutID);

                timeoutID = setTimeout(function() {
                    for (var i = 0, il = queries.length; i < il; i++) {
                        var mql = queries[i].mql,
                            listeners = queries[i].listeners || [],
                            matches = localMatchMedia(mql.media).matches;

                        // Update mql.matches value and call listeners
                        // Fire listeners only if transitioning to or from matched state
                        if (matches !== mql.matches) {
                            mql.matches = matches;

                            for (var j = 0, jl = listeners.length; j < jl; j++) {
                                listeners[j].call(window, mql);
                            }
                        }
                    }
                }, 30);
            };

        window.matchMedia = function(media) {
            var mql = localMatchMedia(media),
                listeners = [],
                index = 0;

            mql.addListener = function(listener) {
                // Changes would not occur to css media type so return now (Affects IE <= 8)
                if (!hasMediaQueries) {
                    return;
                }

                // Set up 'resize' listener for browsers that support CSS3 media queries (Not for IE <= 8)
                // There should only ever be 1 resize listener running for performance
                if (!isListening) {
                    isListening = true;
                    window.addEventListener('resize', handleChange, true);
                }

                // Push object only if it has not been pushed already
                if (index === 0) {
                    index = queries.push({
                        mql: mql,
                        listeners: listeners
                    });
                }

                listeners.push(listener);
            };

            mql.removeListener = function(listener) {
                for (var i = 0, il = listeners.length; i < il; i++) {
                    if (listeners[i] === listener) {
                        listeners.splice(i, 1);
                    }
                }
            };

            return mql;
        };
    }());

    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

    // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

    // MIT license

    (function() {
        "use strict";

        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
                window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() {
                        callback(currTime + timeToCall);
                    },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());

    // https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent

    if (typeof window.CustomEvent !== "function") {
        (function() {
            "use strict";

            function CustomEvent(event, params) {
                params = params || {
                    bubbles: false,
                    cancelable: false,
                    detail: undefined
                };
                var evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return evt;
            }

            CustomEvent.prototype = window.Event.prototype;

            window.CustomEvent = CustomEvent;
        })();
    }

    /* jshint laxcomma: true */
    var salvattore = (function(global, document, undefined) {
        "use strict";

        var self = {},
            grids = [],
            mediaRules = [],
            mediaQueries = [],
            add_to_dataset = function(element, key, value) {
                // uses dataset function or a fallback for <ie10
                if (element.dataset) {
                    element.dataset[key] = value;
                } else {
                    element.setAttribute("data-" + key, value);
                }
                return;
            };

        self.obtainGridSettings = function obtainGridSettings(element) {
            // returns the number of columns and the classes a column should have,
            // from computing the style of the ::before pseudo-element of the grid.

            var computedStyle = global.getComputedStyle(element, ":before"),
                content = computedStyle.getPropertyValue("content").slice(1, -1),
                matchResult = content.match(/^\s*(\d+)(?:\s?\.(.+))?\s*$/),
                numberOfColumns = 1,
                columnClasses = [];

            if (matchResult) {
                numberOfColumns = matchResult[1];
                columnClasses = matchResult[2];
                columnClasses = columnClasses ? columnClasses.split(".") : ["column"];
            } else {
                matchResult = content.match(/^\s*\.(.+)\s+(\d+)\s*$/);
                if (matchResult) {
                    columnClasses = matchResult[1];
                    numberOfColumns = matchResult[2];
                    if (numberOfColumns) {
                        numberOfColumns = numberOfColumns.split(".");
                    }
                }
            }

            return {
                numberOfColumns: numberOfColumns,
                columnClasses: columnClasses
            };
        };


        self.addColumns = function addColumns(grid, items) {
            // from the settings obtained, it creates columns with
            // the configured classes and adds to them a list of items.

            var settings = self.obtainGridSettings(grid),
                numberOfColumns = settings.numberOfColumns,
                columnClasses = settings.columnClasses,
                columnsItems = new Array(+numberOfColumns),
                columnsFragment = document.createDocumentFragment(),
                i = numberOfColumns,
                selector;

            while (i-- !== 0) {
                selector = "[data-columns] > *:nth-child(" + numberOfColumns + "n-" + i + ")";
                columnsItems.push(items.querySelectorAll(selector));
            }

            columnsItems.forEach(function append_to_grid_fragment(rows) {
                var column = document.createElement("div"),
                    rowsFragment = document.createDocumentFragment();

                column.className = columnClasses.join(" ");

                Array.prototype.forEach.call(rows, function append_to_column(row) {
                    rowsFragment.appendChild(row);
                });
                column.appendChild(rowsFragment);
                columnsFragment.appendChild(column);
            });

            grid.appendChild(columnsFragment);
            add_to_dataset(grid, 'columns', numberOfColumns);

            var columnsChange = new CustomEvent("columnsChange");
            grid.dispatchEvent(columnsChange);
        };


        self.removeColumns = function removeColumns(grid) {
            // removes all the columns from a grid, and returns a list
            // of items sorted by the ordering of columns.

            var range = document.createRange();
            range.selectNodeContents(grid);

            var columns = Array.prototype.filter.call(range.extractContents().childNodes, function filter_elements(node) {
                return node instanceof global.HTMLElement;
            });

            var numberOfColumns = columns.length,
                numberOfRowsInFirstColumn = columns[0].childNodes.length,
                sortedRows = new Array(numberOfRowsInFirstColumn * numberOfColumns);

            Array.prototype.forEach.call(columns, function iterate_columns(column, columnIndex) {
                Array.prototype.forEach.call(column.children, function iterate_rows(row, rowIndex) {
                    sortedRows[rowIndex * numberOfColumns + columnIndex] = row;
                });
            });

            var container = document.createElement("div");
            add_to_dataset(container, 'columns', 0);

            sortedRows.filter(function filter_non_null(child) {
                return !!child;
            }).forEach(function append_row(child) {
                container.appendChild(child);
            });

            return container;
        };


        self.recreateColumns = function recreateColumns(grid) {
            // removes all the columns from the grid, and adds them again,
            // it is used when the number of columns change.

            global.requestAnimationFrame(function render_after_css_mediaQueryChange() {
                self.addColumns(grid, self.removeColumns(grid));
                var columnsChange = new CustomEvent("columnsChange");
                grid.dispatchEvent(columnsChange);
            });
        };


        self.mediaQueryChange = function mediaQueryChange(mql) {
            // recreates the columns when a media query matches the current state
            // of the browser.

            if (mql.matches) {
                Array.prototype.forEach.call(grids, self.recreateColumns);
            }
        };


        self.getCSSRules = function getCSSRules(stylesheet) {
            // returns a list of css rules from a stylesheet

            var cssRules;
            try {
                cssRules = stylesheet.sheet.cssRules || stylesheet.sheet.rules;
            } catch (e) {
                return [];
            }

            return cssRules || [];
        };


        self.getStylesheets = function getStylesheets() {
            // returns a list of all the styles in the document (that are accessible).

            var inlineStyleBlocks = Array.prototype.slice.call(document.querySelectorAll("style"));
            inlineStyleBlocks.forEach(function(stylesheet, idx) {
                if (stylesheet.type !== 'text/css' && stylesheet.type !== '') {
                    inlineStyleBlocks.splice(idx, 1);
                }
            });

            return Array.prototype.concat.call(
                inlineStyleBlocks,
                Array.prototype.slice.call(document.querySelectorAll("link[rel='stylesheet']"))
            );
        };


        self.mediaRuleHasColumnsSelector = function mediaRuleHasColumnsSelector(rules) {
            // checks if a media query css rule has in its contents a selector that
            // styles the grid.

            var i, rule;

            try {
                i = rules.length;
            } catch (e) {
                i = 0;
            }

            while (i--) {
                rule = rules[i];
                if (rule.selectorText && rule.selectorText.match(/\[data-columns\](.*)::?before$/)) {
                    return true;
                }
            }

            return false;
        };


        self.scanMediaQueries = function scanMediaQueries() {
            // scans all the stylesheets for selectors that style grids,
            // if the matchMedia API is supported.

            var newMediaRules = [];

            if (!global.matchMedia) {
                return;
            }

            self.getStylesheets().forEach(function extract_rules(stylesheet) {
                Array.prototype.forEach.call(self.getCSSRules(stylesheet), function filter_by_column_selector(rule) {
                    // rule.media throws an 'not implemented error' in ie9 for import rules occasionally
                    try {
                        if (rule.media && rule.cssRules && self.mediaRuleHasColumnsSelector(rule.cssRules)) {
                            newMediaRules.push(rule);
                        }
                    } catch (e) {}
                });
            });

            // remove matchMedia listeners from the old rules
            var oldRules = mediaRules.filter(function(el) {
                return newMediaRules.indexOf(el) === -1;
            });
            mediaQueries.filter(function(el) {
                return oldRules.indexOf(el.rule) !== -1;
            }).forEach(function(el) {
                el.mql.removeListener(self.mediaQueryChange);
            });
            mediaQueries = mediaQueries.filter(function(el) {
                return oldRules.indexOf(el.rule) === -1;
            });

            // add matchMedia listeners to the new rules
            newMediaRules.filter(function(el) {
                return mediaRules.indexOf(el) == -1;
            }).forEach(function(rule) {
                var mql = global.matchMedia(rule.media.mediaText);
                mql.addListener(self.mediaQueryChange);
                mediaQueries.push({
                    rule: rule,
                    mql: mql
                });
            });

            // swap mediaRules with the new set
            mediaRules.length = 0;
            mediaRules = newMediaRules;
        };


        self.rescanMediaQueries = function rescanMediaQueries() {
            self.scanMediaQueries();
            Array.prototype.forEach.call(grids, self.recreateColumns);
        };


        self.nextElementColumnIndex = function nextElementColumnIndex(grid, fragments) {
            // returns the index of the column where the given element must be added.

            var children = grid.children,
                m = children.length,
                lowestRowCount = 0,
                child, currentRowCount, i, index = 0;
            for (i = 0; i < m; i++) {
                child = children[i];
                currentRowCount = child.children.length + (fragments[i].children || fragments[i].childNodes).length;
                if (lowestRowCount === 0) {
                    lowestRowCount = currentRowCount;
                }
                if (currentRowCount < lowestRowCount) {
                    index = i;
                    lowestRowCount = currentRowCount;
                }
            }

            return index;
        };


        self.createFragmentsList = function createFragmentsList(quantity) {
            // returns a list of fragments

            var fragments = new Array(quantity),
                i = 0;

            while (i !== quantity) {
                fragments[i] = document.createDocumentFragment();
                i++;
            }

            return fragments;
        };


        self.appendElements = function appendElements(grid, elements) {
            // adds a list of elements to the end of a grid

            var columns = grid.children,
                numberOfColumns = columns.length,
                fragments = self.createFragmentsList(numberOfColumns);

            Array.prototype.forEach.call(elements, function append_to_next_fragment(element) {
                var columnIndex = self.nextElementColumnIndex(grid, fragments);
                fragments[columnIndex].appendChild(element);
            });

            Array.prototype.forEach.call(columns, function insert_column(column, index) {
                column.appendChild(fragments[index]);
            });
        };


        self.prependElements = function prependElements(grid, elements) {
            // adds a list of elements to the start of a grid

            var columns = grid.children,
                numberOfColumns = columns.length,
                fragments = self.createFragmentsList(numberOfColumns),
                columnIndex = numberOfColumns - 1;

            elements.forEach(function append_to_next_fragment(element) {
                var fragment = fragments[columnIndex];
                fragment.insertBefore(element, fragment.firstChild);
                if (columnIndex === 0) {
                    columnIndex = numberOfColumns - 1;
                } else {
                    columnIndex--;
                }
            });

            Array.prototype.forEach.call(columns, function insert_column(column, index) {
                column.insertBefore(fragments[index], column.firstChild);
            });

            // populates a fragment with n columns till the right
            var fragment = document.createDocumentFragment(),
                numberOfColumnsToExtract = elements.length % numberOfColumns;

            while (numberOfColumnsToExtract-- !== 0) {
                fragment.appendChild(grid.lastChild);
            }

            // adds the fragment to the left
            grid.insertBefore(fragment, grid.firstChild);
        };


        self.registerGrid = function registerGrid(grid) {
            if (global.getComputedStyle(grid).display === "none") {
                return;
            }

            // retrieve the list of items from the grid itself
            var range = document.createRange();
            range.selectNodeContents(grid);

            var items = document.createElement("div");
            items.appendChild(range.extractContents());


            add_to_dataset(items, 'columns', 0);
            self.addColumns(grid, items);
            grids.push(grid);
        };


        self.init = function init() {
            // adds required CSS rule to hide 'content' based
            // configuration.

            var css = document.createElement("style");
            css.innerHTML = "[data-columns]::before{display:block;visibility:hidden;position:absolute;font-size:1px;}";
            document.head.appendChild(css);

            // scans all the grids in the document and generates
            // columns from their configuration.

            var gridElements = document.querySelectorAll("[data-columns]");
            Array.prototype.forEach.call(gridElements, self.registerGrid);
            self.scanMediaQueries();
        };

        self.init();

        return {
            appendElements: self.appendElements,
            prependElements: self.prependElements,
            registerGrid: self.registerGrid,
            recreateColumns: self.recreateColumns,
            rescanMediaQueries: self.rescanMediaQueries,
            init: self.init,

            // maintains backwards compatibility with underscore style method names
            append_elements: self.appendElements,
            prepend_elements: self.prependElements,
            register_grid: self.registerGrid,
            recreate_columns: self.recreateColumns,
            rescan_media_queries: self.rescanMediaQueries
        };

    })(window, window.document);

    return salvattore;
}));
/**
 * skip-link-focus-fix.js
 *
 * Helps with accessibility for keyboard only users.
 *
 * Learn more: https://git.io/vWdr2
 */
(function() {
    var is_webkit = navigator.userAgent.toLowerCase().indexOf('webkit') > -1,
        is_opera = navigator.userAgent.toLowerCase().indexOf('opera') > -1,
        is_ie = navigator.userAgent.toLowerCase().indexOf('msie') > -1;

    if ((is_webkit || is_opera || is_ie) && document.getElementById && window.addEventListener) {
        window.addEventListener('hashchange', function() {
            var id = location.hash.substring(1),
                element;

            if (!(/^[A-z0-9_-]+$/.test(id))) {
                return;
            }

            element = document.getElementById(id);

            if (element) {
                if (!(/^(?:a|select|input|button|textarea)$/i.test(element.tagName))) {
                    element.tabIndex = -1;
                }

                element.focus();
            }
        }, false);
    }
})();

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
        if ($body.is('.singular')) return;

        if (windowWidth < 480) {
            $('.card__meta').attr('style', '');
        } else {
            $('.card--image').each(function(i, obj) {
                var $cardMeta = $(obj).find('.card__meta');
                $cardMeta.css('marginTop', -($cardMeta.height()));
            });
        }

    }
    $(document).ready(function() {
        $('html').addClass('js');

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

            if (windowWidth > 900) {
                $('.grid').each(function(i, obj) {
                    salvattore.appendElements(obj, $(data.html).filter('.grid__item'));
                    Grid.alignTitles();
                    adjustCardMeta();
                });
            }

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

        if (windowWidth < 900 && Modernizr.touchevents) {
            HandleSubmenusOnTouch.init();
        }

        if (windowWidth > 900) {
            $('ul.nav-menu').ariaNavigation();
        }

        $('.grid, .site-header').css('opacity', 1);

        if ($body.is('.singular')) {
            prepareSingle();
        } else {
            prepareArchive();
        }

        adjustCardMeta();

        $('html').addClass('is--loaded');
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

        if (windowWidth > 900) {
            $('.grid').each(function(i, obj) {
                salvattore.rescanMediaQueries(obj);
            });
        }

        adjustCardMeta();

        resizing = false;
    }
})(jQuery);