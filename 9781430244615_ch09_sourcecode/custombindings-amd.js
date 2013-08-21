define(['utils-amd', 'jquery-1.7.1.js', 'knockout-2.0.0.js'], function(utils) {
  
    ko.bindingHandlers.formatAttr = {
        init: function(element, accessor) {
            $(element).attr(accessor().attr, utils.composeString(accessor()));
        },
        update: function(element, accessor) {       
            $(element).attr(accessor().attr, utils.composeString(accessor()));
        }
    }
     
    ko.bindingHandlers.fadeVisible = {
    
        init: function(element, accessor) {
            $(element)[accessor() ? "show" : "hide"]();        
        },
        
        update: function(element, accessor) {
            if (accessor() && $(element).is(":hidden")) {
                var siblings = $(element).siblings(element.tagName + ":visible");
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
});