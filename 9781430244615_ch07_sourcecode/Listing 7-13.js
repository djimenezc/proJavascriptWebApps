function detectDeviceFeatures(callback, smallLimit) {
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
            var screenQuery = window.matchMedia('screen AND (max-width: ' + (smallLimit || '500') + 'px)');
            deviceConfig.smallScreen = ko.observable(screenQuery.matches);
            if (screenQuery.addListener) {
                screenQuery.addListener(function(mq) {     
                    deviceConfig.smallScreen(mq.matches);
                });
            }
            deviceConfig.largeScreen = ko.computed(function() {
                return !deviceConfig.smallScreen();
            });            
        }
    }, {
        test: Modernizr.touch,
        yep: 'jquery.touchSwipe-1.2.5.js',     
        callback: function() {            
            $('html').swipe({
                swipeLeft: advanceCategory,
                swipeRight: advanceCategory
            })
        }
    },{
        complete: function() {
            callback(deviceConfig);
        }
    }]);
};

function advanceCategory(e, dir) {
    if (cheeseModel.device.smallScreen() && cheeseModel.device.landscape()) {
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
    
    } else {
        var history = cheeseModel.history;
        if (dir == "left" && history.index > 0) {
            location.href = "#category/" + history.categories[--history.index];
        } else if (dir == "right" && history.index < history.categories.length -1) {
            location.href = "#category/" + history.categories[++history.index];
        }
    }
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

