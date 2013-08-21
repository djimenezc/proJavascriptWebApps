define(['modernizr-2.0.6.js', 'knockout-2.0.0.js'], function() {
    
    return {
                
        detectDeviceFeatures: function(callback) {
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
        
            function setupMediaQuery() {
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
                
                callback(deviceConfig);
            }
            
            if (window.matchMedia) {
                setupMediaQuery();
            } else {
                requirejs(['matchMedia.js'], function() {
                   setupMediaQuery(); 
                });
            }
        }
    };    
});
