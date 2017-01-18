 
utils = angular.module('utils',[]);

/**
 * Filter for capitalize input strings
 */
utils.filter('capitalize', function(){
    return function(input){
        if (!input) 
            return undefined
        else
            return input.charAt(0).toUpperCase() + input.toLowerCase().slice(1);

    };
});


/**
 * Filter used to fill a string with occurrences of a character until it have the informed size
 * @param {Char} char the character to be added
 * @param {Number} size the desired size for the string
 * @param {boolean|undefined} append if informed, the characters will be added to the end of the string instead of the start 
 */
utils.filter('pad', function(){
    return function(input, char, size, append){
        var pad = input;
        for (var i = 0; i < size; i++){
            if (append)                
                pad += ""+char;
            else
                pad = ""+char+pad;
        }
        if (append)
            return pad.slice(0,size);
        else
            return pad.slice(pad.length-size,pad.length);
    };
});

/**
 * Similar to Angular OrderBy filter, but keeps the original input when filter = '' or undefined
 */
utils.filter('sortBy', ['$filter',function($filter){
    return function(input,field,reverse){
        
        if (!input)
            return undefined;

        if (!field || (field === ''))
            return input;

        return $filter('orderBy')(input,field,reverse);
    };
}]);


/**
 * Scroll to a element in the screen
 * @param {Object|Number} element o elemento ou seletor do elemento para o qual se desseja rolar a tela
 * @param {Number|undefined} offset o offset em relação ao elemento que se deseja rolar. Opicional
 * @param {Number|undefined} scrollTime tempo de rolagem. Se não for informado, considera-se 600ms
 */
utils.factory('$scrollTo',function($window){
    return function(element,offset,scrollTime){
        var el = (element instanceof Object) ? element : $(element);
        var time = scrollTime ? scrollTime : 600;
        if (!offset){
            offset = 0;
        }
        if (el.offset() && el.offset().top){
            $('body,html').animate({scrollTop:el.offset().top + offset},time);
        }
    }
})

/**
 * Scroll up the page
 * @param {Number|undefined} offset o offset em relação ao topo para onde se deseja rolar. Opicional
 * @param {Number|undefined} scrollTime tempo de rolagem. Se não for informado, considera-se 600ms
 */
utils.factory('$scrollTop',function($window){
    return function(offset,scrollTime){
        var time = scrollTime ? scrollTime : 600;
        if (!offset){
            offset = 0;
        }
        $('body,html').animate({scrollTop:0 + offset},time);
    }
})


/**
 * Scroll to the element if the expression is evaluated true
 * The attribute timeOut is used to set the time before trigger the scroll
 * The default timeOut is 200ms
 */
utils.directive('scrollIf', ['$scrollTo','$timeout',function ($scrollTo,$timeout) {
  return function(scope, element, attrs) {
    scope.$watch(attrs.scrollIf, function(value) {
      if (value) {
        var el = $(element);
        $timeout(function(){
            el = document.getElementById(element.attr('id'));
            el.scrollIntoView();
        },attrs.timeOut ? Number(attrs.timeOut) : 300);
      }
    });
  }
}]);

/**
 * The inputs marked with this directive will have its text selected automatically when seting focus
 * to the field.
 */
utils.directive('selectOnFocus', ['$window', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('focus', function () {
                if (!$window.getSelection().toString()) {
                    // Required for mobile Safari
                    this.setSelectionRange(0, this.value.length)
                }
            });
        }
    };
}]);

/**
 * Directive that creates a currency input
 */
utils.directive('currencyInput', function() {
    return {
        restrict: 'A',
        scope: {
            field: '=ngModel',
            class: '@'
        },
        replace: false,
        link: function(scope, input, attrs) {
            var format = function(){
                var inputVal = input.val();

                if (inputVal == "."){
                    inputVal = "0.";
                }

                //clearing left side zeros
                while ((inputVal.charAt(0) == '0')&&(inputVal.length > 1)&&(inputVal.charAt(1) != '.')) {
                    inputVal = inputVal.substr(1);
                }

                inputVal = inputVal.replace(/[^\d.\',']/g, '');

                var point = inputVal.indexOf(".");
                if (point >= 0) {
                    inputVal = inputVal.slice(0, point + 3);
                }

                var decimalSplit = inputVal.split(".");
                var intPart = decimalSplit[0];
                var decPart = decimalSplit[1];

                intPart = intPart.replace(/[^\d]/g, '');
                if (intPart.length > 3) {
                    var intDiv = Math.floor(intPart.length / 3);
                    while (intDiv > 0) {
                        var lastComma = intPart.indexOf(",");
                        if (lastComma < 0) {
                            lastComma = intPart.length;
                        }

                        if (lastComma - 3 > 0) {
                            intPart = intPart.slice(0,lastComma-3) + "," + intPart.slice(lastComma-3);
                            //intPart = intPart.splice(lastComma - 3, 0, ",");
                        }
                        intDiv--;
                    }
                }

                if (decPart === undefined) {
                    decPart = "";
                }
                else {
                    decPart = "." + decPart;
                }
                var res = intPart + decPart;

                input.val(res);
                var result = res.replace(',', '');
                scope.$apply(function() {scope.field = result});
                scope.$apply(function() {scope.field = result});
            };

            $(input).bind('keyup', function(e) {
                format();
            });

        }
    };
});

/**
 * Directive that creates a decimal formating input
 */
utils.directive('decimalInput', function() {
    return {
        restrict: 'A',
        scope: {
            field: '=ngModel',
            decimalSize: '=decimalInput',
            class: '@'
        },
        replace: false,
        link: function(scope, input, attrs) {
            var format = function(){
                var inputVal = input.val(); 

                //clearing left side zeros
                while (inputVal.charAt(0) == '0') {
                    inputVal = inputVal.substr(1);
                }

                inputVal = inputVal.replace(/[^\d.\',']/g, '');

                var point = inputVal.indexOf(".");
                if (point >= 0) {
                    inputVal = inputVal.slice(0, point + (scope.decimalSize ? scope.decimalSize + 1 : inputVal.length - point));
                }

                var decimalSplit = inputVal.split(".");
                var intPart = decimalSplit[0];
                var decPart = decimalSplit[1];

                intPart = intPart.replace(/[^\d]/g, '');
                if (intPart.length > 3) {
                    var intDiv = Math.floor(intPart.length / 3);
                    while (intDiv > 0) {
                        var lastComma = intPart.indexOf(",");
                        if (lastComma < 0) {
                            lastComma = intPart.length;
                        }

                        if (lastComma - 3 > 0) {
                            intPart = intPart.slice(0,lastComma-3) + "," + intPart.slice(lastComma-3);
                            //intPart = intPart.splice(lastComma - 3, 0, ",");
                        }
                        intDiv--;
                    }
                }

                if (decPart === undefined) {
                    decPart = "";
                }
                else {
                    decPart = "." + decPart;
                }
                var res = intPart + decPart;

                input.val(res);
                var result = res.replace(',', '');
                scope.$apply(function() {scope.field = result});
                scope.$apply(function() {scope.field = result});
            };

            $(input).bind('keyup', function(e) {
                format();
            });

        }
    };
});

/**
 * When initializing the view, sets the focus to the input marked with this directive
 */
utils.directive('autoFocus', ['$timeout',function($timeout) {
    return {
        restrict: 'A',
        scope: {

        },
        replace: false,
        link: function(scope, input, attrs) {
            $(input).focus();
            $timeout(function(){$(input).select();},300);
        }
    };
}]);

/**
 * Service with utilities
 */
utils.factory('utils',function(){

   return new function(){
        var self = this;

        /**
         * Clones an object
         * @param {Object} obj the object to clone
         * @param {Boolean} recursive if true, this function will be called recursively when the
         *                  returned value of a cloned property are an object too (clone inner objects)
         * @return {Object} a new instance of Object containing all the attributes of the
         *                  cloned object;
         */
        this.cloneObj = function(obj,recursive){
            if (obj instanceof Array)
                var clone = [];
            else
                var clone = {};
            
            for (var i in obj){
                clone[i] = obj[i];
                if ((recursive) && (clone[i] instanceof Object)){
                    clone[i] = self.cloneObj(clone[i],recursive);
                }
            }
            return clone;
        };
        
        /**
         * Copy all the properties from a object to another
         * @param {Object} orig the with the properties to copy (origin object)
         * @param {Object} dest the destination object
         * @param {Boolean} recursive if true, this function will be called recursively when the
         *                  returned value of a copyed property are an object too (clone inner objects)
         * @return {Object} a new instance of Object containing all the attributes of the
         *                  cloned object;
         */
        this.copyProperties = function(orig,dest){
            for (var i in orig){
                dest[i] = orig[i];
            }
        };        
   };

});

/**
 * The element marked with this directive will scroll the page to the element passed as parameter (selector)
 */
utils.directive('scrollTop', ['$window', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var time = attrs.scrollTime ? attrs.scrollTime : 600;
            element.on('click', function () {
                $('body,html').animate({scrollTop:0},time);
            });
        }
    };
}]);

/**
 * The element marked with this directive will scroll down to bottom when clicked
 */
utils.directive('scrollBottom', ['$window', function ($window) {
    return {
        restrict: 'A',        
        link: function (scope, element, attrs) {
            var time = attrs.scrollTime ? attrs.scrollTime : 600;
            element.on('click', function () {
                $('body,html').animate({scrollTop:$(document).height()},time);
            });
        }
    };
}]);

/**
 * The element marked with this directive will scroll down to bottom when clicked
 * Or it will roll down que amount informed as parameter to the directive
 */
utils.directive('scrollTo', ['$window', function ($window) {
    return {
        restrict: 'A',        
        link: function (scope, element, attrs) {
            element.on('click', function () {
                var el = $(attrs.scrollTo);
                var offset = attrs.scrollToOffset ? Number(attrs.scrollToOffset) : 0;
                var time = attrs.scrollTime ? attrs.scrollTime : 600;
                $('body,html').animate({scrollTop:el.offset().top + offset},time);
            });
        }
    };
}]);


/**
 * The button marked with this directive will scroll up to top
 */
utils.directive('rollTopButton', ['$window', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.fadeOut();
            $(window).scroll(function () {
                if ($(this).scrollTop() > 300) {
                    element.fadeIn();
                } else {
                    element.fadeOut();
                }
            });
            element.on('click', function () {
                $('body,html').animate({scrollTop:0},600);
            });
        }
    };
}]);


/**
 * The element marked with dis directive will be fixed when scroll down
 */
utils.directive('scrollDownFixed', ['$window', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            
            var t = $('scrollDownFixedStyleAdded');
            if (!t || (t.length <! 0)){
                $('body').append('<input type="hidden" id="scrollDownFixedStyleAdded">');
                $('head').append('<style>' + 
                        'md-tabs.md-tab-fixed-top > md-tabs-wrapper,'+
                        'md-toolbar.md-tab-fixed-top {'+
                            'top: 0;'+
                            'position: fixed;'+
                            'right: 0;'+
                            'z-index: 1030;'+
                            'left: 0;'+
                        '}'+
                    '</style>');    
            }
            element.removeClass('md-tab-fixed-top');
            $(window).scroll(function () {
                if (!scope.scrolltop)
                    scope.scrolltop = element.position().top  + element.offset().top;
                if ($(this).scrollTop() > scope.scrolltop) {
                    element.addClass('md-tab-fixed-top');                    
                } else {
                    element.removeClass('md-tab-fixed-top');
                }
            });
        }
    };
}]);


/**
 * Service with utilities
 */
utils.factory('dateUtils',function(){

   return new function(){
        var self = this;

        /**
         * Convert the date to string using the brazilian format
         * @param {Date} date the date to be converted
         * @param {String} the divider to be used. If not informed, "/" is assumed
         * @return the truncated date.
         */
        this.toBrStr = function(date,divider){
            if (!divider) divider = "/";
            var month = ""+(date.getMonth() + 1);
            var dateStr = ((""+date.getDate()).length > 1 ? date.getDate() : "0"+date.getDate())+ divider + (month.length > 1 ? month : "0"+month) + divider +date.getFullYear();
            return dateStr;
        };

        /**
         * Truncates a datetime obj (ignore hours, minutes, seconds and milisseconds)
         * @param {Date} date the date to be truncated
         * @return the truncated date.
         */
        this.truncateDate = function(date){
            var dt = new Date(date);
            dt.setHours(0);
            dt.setMinutes(0);
            dt.setSeconds(0);
            dt.setMilliseconds(0);
            return dt;
        };

        /**
         * Compares two dates, ignoring the time.
         * @param {Date} dateA the first date
         * @param {Date} dateB the second date
         * @return {Number} a positive number if dateA > dateB; 
         *                  a negative number if dateA < dateB;
         *                  0 if dateA == dateB
         */
        this.compareDate = function(dateA,dateB){
            var dtA = self.truncateDate(dateA);
            var dtB = self.truncateDate(dateB);
            return dtA.getTime() - dtB.getTime();
        };

        /**
         * Compares two dates, considering time
         * @param {Date} dateA the first date
         * @param {Date} dateB the second date
         * @return {Number} a positive number if dateA > dateB; 
         *                  a negative number if dateA < dateB;
         *                  0 if dateA == dateB
         */
        this.compareDateTime = function(dateA,dateB){
            return dateA.getTime() - dateB.getTime();
        };

        /**
         * Compares two dates, to see if is the same day (ignores time)
         * @param {Date} dateA the first date
         * @param {Date} dateB the second date
         * @return {Boolean} true if is dateA and dateB are the same day 
         */
        this.isSameDay = function(dateA,dateB){
            return self.compareDate(dateA,dateB) == 0;
        };

        /**
         * Tells if the informed date is today
         * @param {Date} date the date to check if is today
         * @return {Boolean} true if date is today
         */
        this.isToday = function(date){
            return self.isSameDay(date,new Date());
        };

        /**
         * Tells if the informed date is before today
         * @param {Date} date the date to check if is today
         * @return {Boolean} true if date is before today
         */
        this.isPastDay = function(date){
            return self.compareDate(date,new Date()) < 0;
        };

        /**
         * Tells if the informed date is after today
         * @param {Date} date the date to check if is today
         * @return {Boolean} true if date is after today
         */
        this.isFutureDay = function(date){
            return self.compareDate(date,new Date()) > 0;
        };
   };

});