define('autoComplete', [
    'jquery',
    '../template/components.rac',
    'ractive',
    'ui',
    'is',
    'css!../css/component/autoComplete.css'
], function ($, template, Ractive, UI, is) {
    UI.AutoComplete = UI.extend(UI, function (options) {
        this.target = options.target;
        this.data = options.data || [];
        this.valueHolder = options.valueHolder;
        this.labelField = options.labelField || 'name';
        this.valueField = options.valueField || this.labelField;
        this.readonlyField = options.readonlyField || 'readonly';
        this.paramName = options.paramName;
        this.forceSelection = options.forceSelection !== false;
        this.enableQueryAll = options.enableQueryAll === true;
        this.url = options.url;
        this.prepareParams = options.prepareParams;
        var autoComplete = null;
        var me = this;
        var target = $(this.target);
        var queryParamName = this.paramName || target.attr('name');
        var selectedValue = null;
        var loadTimeout = 0;
        var keepValue = false;
        var load = function () {
            var params = {};
            params[queryParamName] = autoComplete.get('_queryParamValue');
            if (params[queryParamName] == '' && !me.enableQueryAll) {
                autoComplete.set('_show', false);
                return;
            }
            if (typeof me.prepareParams == 'function') {
                var customParams = me.prepareParams();
                params = $.extend(params, customParams);
            }
            var additionParams = autoComplete.get('_additionParams') || {};
            params = $.extend(params, additionParams);
            $.ajax({
                url: contextPath + me.url,
                type: 'post',
                dataType: 'json',
                data: params,
                success: function (response) {
                    var items = response.data;
                    autoComplete.set('items', items);
                    var queryParamValue = autoComplete.get('_queryParamValue');
                    if (items instanceof Array && autoComplete.get('_autoSelect')) {
                        for (var i = 0; i < items.length; i++) {
                            var item = items[i];
                            if (queryParamValue == item[me.labelField]) {
                                me.setValue(item[me.valueField]);
                                break;
                            }
                        }
                    }
                    autoComplete.set('_autoSelect', false);
                    if (queryParamValue) {
                        autoComplete.set('_show', true);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert('加载列表信息失败:' + (textStatus || '') + (errorThrown || ''));
                }
            });
        };
        var clearValue = function () {
            if (me.valueHolder) {
                $(me.valueHolder).val('');
            }
            selectedValue = null;
        };
        var initAutoComplete = function (value) {
            var offset = target.offset() || {
                top: 0,
                left: 0
            };
            autoComplete = new Ractive({
                el: 'body',
                template: $(template).filter('#autoComplete').html(),
                data: {
                    items: me.data,
                    _show: false,
                    _top: offset.top + target.outerHeight() || 0,
                    _left: offset.left,
                    _width: target.outerWidth || 0,
                    _queryParamValue: value,
                    _autoSelect: false,
                    _getLabel: function (context) {
                        if (!context) {
                            return '';
                        }
                        return context[me.labelField];
                    },
                    _isReadonly: function (context) {
                        return context[me.readonlyField] === true;
                    }
                },
                append: true
            });
            autoComplete.on('select', function (event) {
                event.original.preventDefault();
                if (event.original.which && event.original.which != 1) {
                    return false;
                } else if (event.original.button && event.original.button != 1) {
                    return false;
                }
                var elem = event.node;
                var context = event.context;
                if (context[me.readonlyField] === true) {
                    return;
                }
                var originValue = selectedValue;
                selectedValue = context[me.valueField];
                if (me.valueHolder) {
                    $(me.valueHolder).val(selectedValue);
                }
                target.val($(elem).text());
                keepValue = target.val() != autoComplete.get('_queryParamValue');
                autoComplete.set('_queryParamValue', target.val());
                autoComplete.set('_show', false);
                autoComplete.fire('ui.select', event, selectedValue, originValue);
                if (selectedValue != originValue) {
                    autoComplete.fire('ui.change', originValue, selectedValue);
                }
            });
            autoComplete.observe('_queryParamValue _additionParams', function (newValue) {
                if (!keepValue) {
                    clearValue();
                }
                keepValue = false;
                if (loadTimeout) {
                    clearTimeout(loadTimeout);
                }
                loadTimeout = setTimeout(load, 200);
            });
        };
        initAutoComplete();
        target.on('focus', function () {
            var left = target.offset().left;
            var top = target.offset().top + target.outerHeight();
            var width = target.outerWidth();
            autoComplete.set('_left', left);
            autoComplete.set('_top', top);
            autoComplete.set('_width', width);
            if (me.enableQueryAll) {
                autoComplete.set('_show', true);
            } else {
                autoComplete.set('_show', !!target.val());
            }
        });
        var inputEvt = function (event) {
            var event = window.event || event;
            var value = target.val();
            autoComplete.set('_queryParamValue', value);
        };
        if (is.ie(8)) {
            target.off('propertychange').on('propertychange', function () {
                if (window.event.propertyName == 'value') {
                    inputEvt();
                }
            });
        } else {
            target.off('input paste').on('input paste', inputEvt);
        }
        target.on('blur', function () {
            if (target.prop('readonly')) {
                return;
            }
            if (me.forceSelection && !selectedValue) {
                target.val('');
            }
            autoComplete.set('_show', false);
        });
        this.on = function (eventName, func) {
            autoComplete.on(eventName, func);
        };
        this.setLabel = function (label) {
            target.val(label);
            autoComplete.set('_queryParamValue', label);
            autoComplete.set('_autoSelect', true);
        };
        this.setValue = function (value) {
            if (me.valueHolder) {
                $(me.valueHolder).val(value);
            }
            var originValue = selectedValue;
            selectedValue = value;
            if (originValue != selectedValue) {
                autoComplete.fire('ui.change', originValue, selectedValue);
            }
        };
        this.setData = function (data) {
            autoComplete.set('items', data);
        };
        this.setAdditionParams = function (additionParams) {
            autoComplete.set('_additionParams', additionParams);
        };
        this.getValue = function () {
            return selectedValue;
        };
    });
    return UI.AutoComplete;
});