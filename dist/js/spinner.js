define('spinner', [
    'jquery',
    'css!../css/component/spinner.css'
], function ($) {
    $.fn.spinner = function (opts) {
        return this.each(function () {
            var textField = $(this);
            var defaults = {
                step: 1,
                min: NaN,
                max: NaN
            };
            var options = $.extend(defaults, opts);
            var keyCodes = {
                up: 38,
                down: 40
            };
            var increaseButton;
            var decreaseButton;
            if (!$(this).data('spinner')) {
                var container = $('<div></div>');
                container.addClass('spinner');
                var height = textField.outerHeight();
                if (!textField.val()) {
                    textField.val(0);
                }
                container.data('lastValidValue', textField.val());
                textField.css('height', height);
                textField.bind('keyup paste change', function (e) {
                    var field = $(this);
                    if (e.keyCode == keyCodes.up) {
                        changeValue(true);
                    } else if (e.keyCode == keyCodes.down) {
                        changeValue(false);
                    } else if (field.val() != container.data('lastValidValue')) {
                        validateAndTrigger(field);
                    }
                });
                textField.on('blur', function () {
                    validateAndTrigger($(this), true);
                });
                textField.wrap(container);
                increaseButton = $('<button type="button" onClick="changeValueAdd(this)">+</button>').click(function () {
                    changeValue(true);
                });
                decreaseButton = $('<button type="button" onClick="changeValueReduce(this)">-</button>').click(function () {
                    changeValue(false);
                });
                var borderHeight = 2;
                increaseButton.css('height', height).css('width', height).css('line-height', height - borderHeight + 'px');
                decreaseButton.css('height', height).css('width', height).css('line-height', height - borderHeight + 'px');
                textField.before(decreaseButton);
                textField.after(increaseButton);
                $(this).data('increaseButton', increaseButton);
                $(this).data('decreaseButton', decreaseButton);
            } else {
                increaseButton = $(this).data('increaseButton');
                decreaseButton = $(this).data('decreaseButton');
            }
            validate(textField);
            $(this).data('spinner', true);
            function changeValue(isAdd) {
                var delta = isAdd ? options.step : -options.step;
                textField.val(parseFloat(textField.val()) + delta);
                validateAndTrigger(textField);
            }
            function validateAndTrigger(field, isBlur) {
                var value = validate(field);
                if (isValid(value)) {
                    container.data('lastValidValue', value);
                    textField.trigger('update', [
                        field,
                        value
                    ]);
                } else if (!isBlur && value != '-' && value != '') {
                    textField.val(container.data('lastValidValue'));
                    textField.trigger('update', [
                        field,
                        value
                    ]);
                } else if (isBlur) {
                    textField.val(container.data('lastValidValue'));
                    textField.trigger('update', [
                        field,
                        value
                    ]);
                    validate(field);
                }
            }
            function validate(textField) {
                var value = textField.val();
                var valueNum = parseFloat(value);
                var isNum = !isNaN(valueNum) && /^\d+\.?\d*$/.test(value);
                increaseButton.removeAttr('disabled');
                decreaseButton.removeAttr('disabled');
                if (isNum && !isNaN(options.min) && valueNum - options.step < options.min) {
                    decreaseButton.attr('disabled', 'disabled');
                }
                if (isNum && !isNaN(options.max) && valueNum + options.step > options.max) {
                    increaseButton.attr('disabled', 'disabled');
                }
                return value;
            }
            function isValid(value) {
                var num = parseFloat(value);
                if (isNaN(num) || !/^\d+\.?\d*$/.test(value)) {
                    return false;
                }
                if (!isNaN(options.min) && num < options.min) {
                    return false;
                }
                if (!isNaN(options.max) && num > options.max) {
                    return false;
                }
                return true;
            }
        });
    };
});