/**
 * Created by martin on 15/6/26.
 * 自动完成组件
 */
define(['jquery', 'text!../../template/components.rac', 'ractive', 'ui', 'is', "css!../css/component/autoComplete.css"], function($, template, Ractive, UI, is) {
    UI.AutoComplete = UI.extend(UI, function(options) {
        /**
         * jquery选择器或者jquery对象【输入框】
         */
        this.target = options.target;
        /**
         * 自动完成组件数据
         */
        this.data = options.data || [];

        /**
         * autoComplete选中值保存容器，jquery选择器或者jquery对象
         */
        this.valueHolder = options.valueHolder;

        /**
         * 用于显示的字段名称
         */
        this.labelField = options.labelField || "name";

        /**
         * 每个条目的值对应的字段名称
         */
        this.valueField = options.valueField || this.labelField;

        /**
         * 用于标识当前条目是否只读
         */
        this.readonlyField = options.readonlyField || "readonly";

        /**
         * 用于查询数据的参数名称
         */
        this.paramName = options.paramName;

        /**
         * 强制结果值必须来自下拉列表中的某项
         */
        this.forceSelection = options.forceSelection !== false;

        /**
         * 允许查询所有选择项
         */
        this.enableQueryAll = options.enableQueryAll === true;

        /**
         * 数据加载地址
         */
        this.url = options.url;

        /**
         * 自定义额外查询参数，返回javascript Object类型，参数名为键，参数值为值
         */
        this.prepareParams = options.prepareParams;

        var autoComplete = null;
        var me = this;
        var target = $(this.target);
        var queryParamName = this.paramName || target.attr("name");
        var selectedValue = null;
        var loadTimeout = 0;
        var keepValue = false;

        var load = function() {
            var params = {};
            params[queryParamName] = autoComplete.get("_queryParamValue");
            if (params[queryParamName] == "" && !me.enableQueryAll) {
                autoComplete.set("_show", false);
                return;
            }
            if (typeof me.prepareParams == "function") {
                var customParams = me.prepareParams();
                params = $.extend(params, customParams);
            }
            var additionParams = autoComplete.get("_additionParams") || {};
            params = $.extend(params, additionParams);
            $.ajax({
                url: contextPath + me.url,
                type: 'post',
                dataType: 'json',
                data: params,
                success: function(response) {
                    var items = response.data;
                    autoComplete.set("items", items);
                    var queryParamValue = autoComplete.get("_queryParamValue");
                    if (items instanceof Array && autoComplete.get("_autoSelect")) {
                        for (var i = 0; i < items.length; i++) {
                            var item = items[i];
                            if (queryParamValue == item[me.labelField]) {
                                me.setValue(item[me.valueField]);
                                break;
                            }
                        }
                    }
                    autoComplete.set("_autoSelect", false);
                    if (queryParamValue) {
                        autoComplete.set("_show", true);
                    }
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    alert("加载列表信息失败:" + (textStatus || "") + (errorThrown || ""));
                }
            })
        };

        var clearValue = function() {
            if (me.valueHolder) {
                $(me.valueHolder).val("");
            }
            selectedValue = null;
        };
        var initAutoComplete = function(value) {
            var offset = target.offset() || {
                top: 0,
                left: 0
            };
            autoComplete = new Ractive({
                el: 'body',
                template: $(template).filter("#autoComplete").html(),
                data: {
                    items: me.data,
                    _show: false,
                    _top: offset.top + target.outerHeight() || 0,
                    _left: offset.left,
                    _width: target.outerWidth || 0,
                    _queryParamValue: value,
                    _autoSelect: false,
                    _getLabel: function(context) {
                        if (!context) {
                            return "";
                        }
                        return context[me.labelField];
                    },
                    _isReadonly: function(context) {
                        return context[me.readonlyField] === true;
                    }
                },
                append: true
            });
            autoComplete.on("select", function(event) {
                event.original.preventDefault();
                if (event.original.which && event.original.which != 1) {
                    return false; //非鼠标左键点击
                } else if (event.original.button && event.original.button != 1) {
                    return false; //非鼠标左键点击
                }
                var elem = event.node;
                var context = event.context;
                if (context[me.readonlyField] === true) { //只读记录不可选中
                    return;
                }
                var originValue = selectedValue;
                selectedValue = context[me.valueField];
                if (me.valueHolder) {
                    $(me.valueHolder).val(selectedValue);
                }
                target.val($(elem).text());
                keepValue = target.val() != autoComplete.get("_queryParamValue");
                autoComplete.set("_queryParamValue", target.val());
                autoComplete.set("_show", false);
                autoComplete.fire("ui.select", event, selectedValue, originValue);
                if (selectedValue != originValue) {
                    autoComplete.fire("ui.change", originValue, selectedValue);
                }
            });
            autoComplete.observe("_queryParamValue _additionParams", function(newValue) {
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
        target.on("focus", function() {
            var left = target.offset().left;
            var top = target.offset().top + target.outerHeight();
            var width = target.outerWidth();
            autoComplete.set("_left", left);
            autoComplete.set("_top", top);
            autoComplete.set("_width", width);
            if (me.enableQueryAll) {
                autoComplete.set("_show", true);
            } else {
                autoComplete.set("_show", !!target.val());
            }
        });

        var inputEvt = function(event) {
            var event = window.event || event;
            var value = target.val();
            autoComplete.set("_queryParamValue", value);
            //autoComplete.set("_show",true);
        };

        /*输入框绑定输入粘贴事件*/
        if (is.ie(8)) {
            target.off("propertychange").on("propertychange", function() {
                if (window.event.propertyName == 'value') { //只在value改变时，才触发事件
                    inputEvt();
                }
            });
        } else {
            target.off("input paste").on("input paste", inputEvt);
        }

        target.on("blur", function() {
            if (target.prop("readonly")) {
                return;
            }
            if (me.forceSelection && !selectedValue) {
                target.val("");
            }
            autoComplete.set("_show", false);
        });

        this.on = function(eventName, func) {
            autoComplete.on(eventName, func);
        };

        /**
         * 手动设置自动完成组件label,用于初始时选中某项
         * @param label 当前选中项对应的label
         */
        this.setLabel = function(label) {
            target.val(label);
            autoComplete.set("_queryParamValue", label);
            autoComplete.set("_autoSelect", true); //标记为自动选中，以使数据加载完成后自动选中对应项
        };

        /**
         * 更新自动下拉组件的值，不会选中对应的项，如需要选中对应项，请使用setLabel
         * @param value
         */
        this.setValue = function(value) {
            if (me.valueHolder) {
                $(me.valueHolder).val(value);
            }
            var originValue = selectedValue;
            selectedValue = value;
            if (originValue != selectedValue) {
                autoComplete.fire("ui.change", originValue, selectedValue);
            }
        };
        /**
         * 手动设置完成组件数据
         * @param data
         */
        this.setData = function(data) {
            autoComplete.set("items", data);
        };
        /**
         * 设置额外查询参数，使自动完成组件更新数据项
         * @param additionParams javascript plain object {key:value}
         */
        this.setAdditionParams = function(additionParams) {
            autoComplete.set("_additionParams", additionParams);
        };
        /**
         * 获取当前选中的值
         */
        this.getValue = function() {
            return selectedValue;
        }
    });
    return UI.AutoComplete;
});