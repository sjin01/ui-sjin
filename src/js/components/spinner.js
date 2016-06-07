define(['jquery'], function ($) {
    $.fn.spinner = function (opts) {
        return this.each(function () {
            var defaults = {
                step: 1,//每次加减的数目
                min: NaN,//最小值
                max: NaN//最大值
            };
            var options = $.extend(defaults, opts);
            var keyCodes = {up: 38, down: 40};
            var container = $('<div></div>');
            container.addClass('spinner');
            var textField = $(this);
            var height = textField.outerHeight();
            if(!textField.val()){
                textField.val(0);
            }
            container.data('lastValidValue',textField.val());
            textField.css("height",height);
            textField.bind('keyup paste change', function (e) {
                var field = $(this);
                if (e.keyCode == keyCodes.up) {
                    changeValue(true);
                }
                else if (e.keyCode == keyCodes.down) {
                    changeValue(false);
                }
                else if (field.val() != container.data('lastValidValue')) {
                    validateAndTrigger(field);
                }
            });
            textField.on('blur',function(){
                validateAndTrigger($(this),true);
            });
            textField.wrap(container);

            var increaseButton = $('<button type="button">+</button>').click(
                function () {
                    changeValue(true);
                });
            var decreaseButton = $('<button type="button">-</button>').click(
                function () {
                changeValue(false);
            });
            increaseButton.css("height",height).css("width",height);
            decreaseButton.css("height",height).css("width",height);
            validate(textField);
            textField.before(decreaseButton);
            textField.after(increaseButton);

            function changeValue(isAdd) {
                var delta = isAdd? options.step : -options.step;
                textField.val(parseFloat(textField.val()) + delta);
                validateAndTrigger(textField)
            }

            function validateAndTrigger(field,isBlur) {
                var value = validate(field);
                if (isValid(value)) {
                    container.data('lastValidValue',value);
                    textField.trigger('update', [field, value]);
                }else if(!isBlur  && value!="-" && value!=""){
                    textField.val(container.data('lastValidValue'));
                }
                else if(isBlur){
                    textField.val(container.data('lastValidValue'));
                    validate(field);
                }
            }

            function validate() {
                var value = textField.val();
                var valueNum = parseFloat(value);
                var isNum = !isNaN(valueNum);
                increaseButton.removeAttr('disabled');
                decreaseButton.removeAttr('disabled');
                if (isNum && !isNaN(options.min) && (valueNum-options.step) < options.min) {
                    decreaseButton.attr('disabled', 'disabled');
                }
                if(isNum && !isNaN(options.max) && (valueNum+options.step)>options.max){
                    increaseButton.attr('disabled','disabled');
                }
                return value;
            }

            function isValid(value) {
                var num = parseFloat(value);
                if(isNaN(num)){
                    return false;
                }
                if(!isNaN(options.min) && num < options.min){
                    return false;
                }
                if(!isNaN(options.max) && num > options.max){
                    return false;
                }
                return true;
            }

        })
    }
});
