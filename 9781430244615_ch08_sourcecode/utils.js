
function checkForVersionPreference() {
    var previousDecision;
    if (localStorage && localStorage["cheeseLuxMode"]) {
        previousDecision = localStorage["cheeseLuxMode"];
    } else {
        previousDecision = getCookie("cheeseLuxMode");
    }
    if (!previousDecision && cheeseModel.device.mobile) {
        location.href = "/askmobile.html";
    } else if (location.pathname == "/mobile.html" && previousDecision == "desktop") {
        location.href = "/example.html";
    } else if (location.pathname != "/mobile.html" && previousDecision == "mobile") {        
        location.href = "/mobile.html";
    }
}

function getCookie(name) {
    var val;
    $.each(document.cookie.split(';'), function(index, elem) {
        var cookie = $.trim(elem);
        if (cookie.indexOf(name) == 0) {
            val = cookie.slice(name.length + 1);
        }
    })
    return val;
}

function detectDeviceFeatures(callback) {
    var deviceConfig = {};

    deviceConfig.landscape = ko.observable();
    deviceConfig.portrait = ko.computed(function() {
        return !deviceConfig.landscape();
    });    
    
    var setOrientation = function() {
        deviceConfig.landscape(window.innerWidth > window.innerHeight);
    }
    setOrientation();
    
    $(window).bind("orientationchange resize", function() {
        setOrientation();
    });
    
    setInterval(setOrientation, 500);
    
    if (window.matchMedia) {
        var orientQuery = window.matchMedia('screen AND (orientation:landscape)')
        if (orientQuery.addListener) {
            orientQuery.addListener(setOrientation);
        }
    }

    Modernizr.load([{
        test: window.matchMedia,
        nope: 'matchMedia.js',
        complete: function() {           
            var screenQuery = window.matchMedia('screen AND (max-width: 500px)');
            deviceConfig.smallScreen = ko.observable(screenQuery.matches);                           
            if (screenQuery.addListener) {
                screenQuery.addListener(function(mq) {              
                    deviceConfig.smallScreen(mq.matches);
                });
            }
            deviceConfig.largeScreen = ko.computed(function() {
                return !deviceConfig.smallScreen();
            });
            
            setInterval(function() {
                deviceConfig.smallScreen(window.innerWidth <= 500);
            }, 500);
        }
    }, {
        test: Modernizr.touch,
        yep: 'jquery.touchSwipe-1.2.5.js',     
        callback: function() {            
            $('html').swipe({
                swipeLeft: advanceCategory,
                swipeRight: advanceCategory
            });
        }
    },{
        complete: function() {
            deviceConfig.mobile = Modernizr.touch && deviceConfig.smallScreen();
            
            deviceConfig.smallAndLandscape = ko.computed(function() {
                return deviceConfig.smallScreen() && deviceConfig.landscape();
            });
            deviceConfig.smallAndPortrait = ko.computed(function() {
                return deviceConfig.smallScreen() && deviceConfig.portrait();
            });
           
            callback(deviceConfig);
        }
    }]);
};

function getIndexOfCategory(category) {
    var result = -1;
    for (var i = 0; i < cheeseModel.products.length; i++) {
        if (cheeseModel.products[i].category == category ||
                cheeseModel.products[i].shortName == category) {
            result = i;
            break;
        }
    }
    return result;
}

function getCategoryDirection(newCat) {
    var currentIndex = getIndexOfCategory(cheeseModel.selectedCategory());
    var newIndex = getIndexOfCategory(newCat);
    return newIndex < currentIndex;
}

function advanceCategory(e, dir) {
    var cIndex = -1;
    for (var i = 0; i < cheeseModel.products.length; i++) {
        if (cheeseModel.products[i].category == cheeseModel.selectedCategory()) {
            cIndex = i;
            break;
        }
    }
    cIndex = (dir == "left" ? cIndex-1 : cIndex + 1) % (cheeseModel.products.length);
    if (cIndex < 0) {
        cIndex = cheeseModel.products.length -1;
    }
    cheeseModel.selectedCategory(cheeseModel.products[cIndex].category)
}

function enhanceViewModel() {

    cheeseModel.selectedCategory = ko.observable(cheeseModel.products[0].category);                               
                                      
    mapProducts(function(item) {
        item.quantity = ko.observable(0);                
        item.subtotal = ko.computed(function() {       
            return this.quantity() * this.price;
        }, item);
    }, cheeseModel.products, "items");
        
    cheeseModel.total = ko.computed(function() {
        var total = 0;
        mapProducts(function(elem) {
            total += elem.subtotal();
        }, cheeseModel.products, "items");
        return total;
    });
    
    var history = cheeseModel.history = {};
    history.index = 0;
    history.categories = [cheeseModel.selectedCategory()];
    cheeseModel.selectedCategory.subscribe(function(newValue) {
        if (newValue != history.categories[history.index]) {       
            history.index++;
            history.categories.push(newValue);
        }
    })
};


function mapProducts(func, data, indexer) {
    $.each(data, function(outerIndex, outerItem) {
        $.each(outerItem[indexer], function(itemIndex, innerItem) {              
            func(innerItem, outerItem);
        });
    });
}

function composeString(bindingConfig ) {
    var result = bindingConfig.value;
    if (bindingConfig.prefix) { result = bindingConfig.prefix + result; }
    if (bindingConfig.suffix) { result += bindingConfig.suffix;}
    return result;
}

ko.bindingHandlers.formatAttr = {
    init: function(element, accessor) {
        $(element).attr(accessor().attr, composeString(accessor()));
    },
    update: function(element, accessor) {       
        $(element).attr(accessor().attr, composeString(accessor()));
    }
}

ko.bindingHandlers.formatText = {
    update: function(element, accessor) {       
        $(element).text(composeString(accessor()));
    }
}

ko.bindingHandlers.ifAttr = {
    update: function(element, accessor) {
        if (accessor().test) {
            $(element).attr(accessor().attr, accessor().value);
        } else {
            $(element).removeAttr(accessor().attr);
        }
    }
}

ko.bindingHandlers.fadeVisible = {

    init: function(element, accessor) {
        $(element)[accessor() ? "show" : "hide"]();        
    },
    
    update: function(element, accessor) {
        if (accessor() && $(element).is(":hidden")) {
            var siblings = $(element).siblings(":visible");
            if (siblings.length) {
                siblings.fadeOut("fast", function() {
                    $(element).fadeIn("fast");
                })
            } else {
                $(element).fadeIn("fast");
            }
        } 
    }    
}

ko.bindingHandlers.selected = {
    init: function(element, accessor) {
        if (accessor()) {
            $(element).siblings("[selected]").removeAttr("selected");
            $(element).attr("selected", "selected");
        } 
    },
    update: function(element, accessor) {
        if (accessor()) {
            $(element).siblings("[selected]").removeAttr("selected");
            $(element).attr("selected", "selected");
        } 
    } 
}

