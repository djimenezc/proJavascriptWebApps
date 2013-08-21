
function enhanceViewModel() {

    cheeseModel.selectedCategory =
              ko.observable(cheeseModel.products[0].category);                               
                                      
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