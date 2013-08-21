define(['jquery-1.7.1.js'], function() {
    return {
        mapProducts: function(func, data, indexer) {            
            $.each(data, function(outerIndex, outerItem) {
                $.each(outerItem[indexer], function(itemIndex, innerItem) {              
                    func(innerItem, outerItem);
                });
            });
        },
        composeString: function(bindingConfig) {
            var result = bindingConfig.value;
            if (bindingConfig.prefix) { result = bindingConfig.prefix + result; }
            if (bindingConfig.suffix) { result += bindingConfig.suffix;}
            return result;
        }
    };    
});
