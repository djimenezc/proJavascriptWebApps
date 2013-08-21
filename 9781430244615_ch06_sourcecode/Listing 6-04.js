
var DBO = {
    dbVersion: 31
}

function setupDatabase(data, callback) {
    var indexDB = window.indexedDB || window.mozIndexedDB;
    var req = indexDB.open("CheeseDB", DBO.dbVersion);
    
req.onupgradeneeded = function(e) {
    var db = req.result;

    var existingStores = db.objectStoreNames;
    for (var i = 0; i < existingStores.length; i++) {
        db.deleteObjectStore(existingStores[i]);
    }
    
    var objectStore = db.createObjectStore("products", {keyPath: "id"});
    objectStore.createIndex("category", "category", {unique: false});
    
    $.each(data, function(index, item) {
        var currentCategory = item.category;
        $.each(item.items, function(index, item) {
            item.category = currentCategory;
            objectStore.add(item);
        });
    });
};

req.onsuccess = function(e) {
    DBO.db = this.result;
    callback();
};    
};

function getProductByID(id, callback) {
    var transaction = DBO.db.transaction(["products"]);
    var objectStore = transaction.objectStore("products");
    var req = objectStore.get(id);
    req.onsuccess = function(e) {
        callback(this.result);    
    };
}

function getProductsByDescription(text, callback) {
    var searchTerm = text.toLowerCase();
    var results = [];
    var transaction = DBO.db.transaction(["products"]);
    var objectStore = transaction.objectStore("products");
    objectStore.openCursor().onsuccess = function(e) {
        var cursor = this.result;
        if (cursor) {
            if (cursor.value.description.toLowerCase().indexOf(searchTerm) > -1) {
                results.push(cursor.value);
            }
            cursor.continue();
        } else {
            callback(results);
        }
    };
};

function getProductsByCategory(searchCat, callback) {
    var results = [];
    var transaction = DBO.db.transaction(["products"]);
    var objectStore = transaction.objectStore("products");
    var keyRange = IDBKeyRange.only(searchCat);
    var index = objectStore.index("category");
    index.openCursor(keyRange).onsuccess = function(e) {
        var cursor = this.result;
        if (cursor) {
            results.push(cursor.value);
            cursor.continue();
        } else {
            callback(results);
        }
    };
};


ko.persistentObservable = function(keyName, initialValue, useSession) {
    var storageObject = useSession ? sessionStorage : localStorage
    var obItem = ko.observable(storageObject[keyName] || initialValue);
    
    $(window).bind("storage", function(e) {
        if (e.originalEvent.key == keyName) {
            obItem(e.originalEvent.newValue);           
        }
    });
    obItem.subscribe(function(newValue) {
        storageObject[keyName] = newValue;    
    });
    return obItem;
}


function enhanceViewModel() {

    cheeseModel.selectedCategory
        = ko.persistentObservable("selectedCategory", cheeseModel.products[0].category);                               
                                      
    mapProducts(function(item) {
        item.quantity = ko.persistentObservable(item.id + "_quantity", 0);                
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

function createDialog(message) {
    $('<div>' + message + '</div>').dialog({
        modal: true,
        title: "Ajax Error",            
        buttons: [{text: "OK",
            click: function() {$(this).dialog("close")}}]
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