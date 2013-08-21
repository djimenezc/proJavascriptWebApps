(function() {
    function createNamespace(namespace) {
        var names = namespace.split('.');
        var obj = window;
        for (var i = 0; i < names.length; i++) {
            if (!obj[names[i]]) {
                obj = obj[names[i]] = {};
            } else {
                obj = obj[names[i]];
            }
        }
        return obj;
    };
    
    var utilsNS = createNamespace("cheeselux.utils");
    
    utilsNS.mapProducts = function(func, data, indexer) {
        $.each(data, function(outerIndex, outerItem) {
            $.each(outerItem[indexer], function(itemIndex, innerItem) {              
                func(innerItem, outerItem);
            });
        });
    }
    
    utilsNS.composeString = function(bindingConfig) {
        var result = bindingConfig.value;
        if (bindingConfig.prefix) { result = bindingConfig.prefix + result; }
        if (bindingConfig.suffix) { result += bindingConfig.suffix;}
        return result;
    }
})();
