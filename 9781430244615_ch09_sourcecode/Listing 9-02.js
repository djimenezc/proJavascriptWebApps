if (!com) {
    var com = {};
}
com.cheeselux = {};
com.cheeselux.utils = {};

com.cheeselux.utils.mapProducts = function(func, data, indexer) {
    $.each(data, function(outerIndex, outerItem) {
        $.each(outerItem[indexer], function(itemIndex, innerItem) {              
            func(innerItem, outerItem);
        });
    });
}

com.cheeselux.utils.composeString = function(bindingConfig ) {
    var result = bindingConfig.value;
    if (bindingConfig.prefix) { result = bindingConfig.prefix + result; }
    if (bindingConfig.suffix) { result += bindingConfig.suffix;}
    return result;
}
