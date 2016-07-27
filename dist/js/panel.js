define('panel', [
    'jquery',
    'pagination',
    '../template/components.rac',
    'ractive',
    'ui',
    'is'
], function ($, Pagination, template, Ractive, UI, is) {
    UI.Panel = UI.extend(UI, function (options) {
        this.target = options.target;
        this.el = options.el;
        this.posClass = options.posClass;
        this.needSwitch = options.needSwitch !== false;
        this.data = options.data || [];
        var testData = [
            {
                'name': '螺纹钢',
                'value': 'dgag'
            },
            {
                'name': '螺纹钢1',
                'value': 'dgag1'
            },
            {
                'name': '螺纹钢2',
                'value': 'dgag2'
            },
            {
                'name': '螺纹钢3',
                'value': 'dgag3'
            },
            {
                'name': '螺纹钢4',
                'value': 'dgag4'
            }
        ];
        this.forceSelection = options.forceSelection !== false;
        this.urlA = options.urlA;
        this.urlB = options.urlB;
        this.panelPageList = options.panelPageList || {};
        this._panelPageList = {};
        $.extend(true, this._panelPageList, this.panelPageList);
        this.paramName = options.paramName;
        this.prepareParams = options.prepareParams;
        this.valueHolder = options.valueHolder || $(this.target);
        this.labelField = options.labelField || 'name';
        this.valueField = options.valueField || this.labelField;
        var me = this;
        var target = $(this.target);
        var queryParamName = this.paramName || target.attr('name');
        var selectedValue = null;
        var loadTimeout = 0;
        var panelA = null;
        var panelB = null;
        var KEYCODE_ENTER = 13;
        var KEYCODE_UP = 38;
        var KEYCODE_DOWN = 40;
        this.detach = function () {
            target.off();
            if (panelA) {
                panelA.detach();
                panelA = null;
            }
            if (panelB) {
                panelB.detach();
                panelB = null;
            }
        };
        var load = function (__options) {
            var params = {};
            var url = '';
            if (__options.urlA) {
                url = __options.urlA;
            } else {
                url = __options.urlB;
                params[queryParamName] = __options.panel.get('_queryParamValue');
                if (params[queryParamName] == '') {
                    return;
                }
            }
            if (typeof me.prepareParams == 'function') {
                var customParams = me.prepareParams();
                params = $.extend(params, customParams);
            }
            $.ajax({
                url: contextPath + url,
                type: 'post',
                dataType: 'json',
                data: params,
                success: function (response) {
                    __options.panel.set('items', response.data);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                }
            });
        };
        var keepValue = function () {
            var inputValue = target.val();
            if (panelA) {
                if (panelA.get('items') && panelA.get('items').length > 0) {
                    for (var i = 0; i < panelA.get('items').length; i++) {
                        if (inputValue == panelA.get('items')[i][me.labelField]) {
                            return true;
                        }
                    }
                }
            }
            if (panelB) {
                if (me.panelPageList.localItems && me.panelPageList.localItems.length > 0) {
                    for (var i = 0; i < me.panelPageList.localItems.length; i++) {
                        if (inputValue == me.panelPageList.localItems[i][me.labelField]) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        var setValue = function (_selectedValue, _targetVal, _valueHolderVal) {
            selectedValue = _selectedValue;
            target.val(_targetVal);
            if (me.valueHolder) {
                $(me.valueHolder).val(_valueHolderVal);
            }
        };
        var clearValue = function () {
            selectedValue = null;
            target.val('');
            if (me.valueHolder) {
                $(me.valueHolder).val('');
            }
        };
        var selectEvt = function (_panel, event, data) {
            if ('panelA' === _panel.get('panelName')) {
                target.data('isPanelASelect', true);
            }
            target.data('isPanelSelect', true);
            if (data && data.labelField) {
                selectedValue = data.valueField;
                setValue(selectedValue, data.labelField, selectedValue);
            } else if (event) {
                event.original.preventDefault();
                if (event.original.which && event.original.which != 1) {
                    return false;
                } else if (event.original.button && event.original.button != 1) {
                    return false;
                }
                var elem = event.node;
                var context = event.context;
                selectedValue = context[me.valueField];
                setValue(selectedValue, $(elem).text(), selectedValue);
            } else {
                clearValue();
            }
            _panel.set('_show', false);
            return false;
        };
        var inputEvt = function (event) {
            var value = target.val();
            if (panelA) {
                panelA.set('_show', false);
            }
            if (!target.data('isPanelASelect')) {
                if (!panelB) {
                    appendPanelBToDom(value, false);
                }
                if (value || !value && panelB.get('_queryParamValue')) {
                    panelB.set('_show', true);
                    if (value != panelB.get('_queryParamValue')) {
                        panelB.set('_queryParamValue', value);
                    }
                }
            }
            target.data('isPanelASelect', false);
            return false;
        };
        var doFilter = function (newValue) {
            var newItems = [];
            if (me.panelPageList && me.panelPageList.localItems && me.panelPageList.localItems.length > 0) {
                var localItems = me.panelPageList.localItems;
                for (var i = 0; i < localItems.length; i++) {
                    var localItem = localItems[i];
                    if (localItem[me.labelField].indexOf(newValue) != -1) {
                        newItems.push(localItem);
                    }
                }
                me._panelPageList = { 'localItems': newItems };
            }
        };
        var chooseFirst = function (panelB) {
            if (panelB) {
                if ($(panelB.find('.panel-page-list')).find('.panel-list a') && $(panelB.find('.panel-page-list')).find('.panel-list a').length > 0) {
                    $(panelB.find('.panel-page-list')).find('.panel-list a').each(function (index, domEle) {
                        if ($(this).hasClass('hover')) {
                            var _labelFieldStr = $(this).text();
                            var _valueFieldStr = $(this).attr('valueField');
                            var data = {
                                'labelField': _labelFieldStr,
                                'valueField': _valueFieldStr
                            };
                            panelB.pagination.fire('select', null, data);
                        }
                    });
                }
                panelB.set('_show', false);
            }
        };
        var initPanel = function (_options) {
            var panel = new Ractive({
                el: _options.el,
                template: $(template).filter(_options.panelId).html(),
                append: true,
                data: {
                    panelName: _options.panelName,
                    el: _options.el,
                    _class: _options.posClass,
                    _show: true,
                    _queryParamValue: _options._queryParamValue,
                    getLabel: function (context) {
                        if (!context) {
                            return '';
                        }
                        return context[me.labelField];
                    },
                    getValue: function (context) {
                        if (!context) {
                            return '';
                        }
                        return context[me.valueField];
                    }
                }
            });
            clearValue();
            panel.on('select', function (event) {
                selectEvt(panel, event, null);
            });
            panel.on('panelClick', function (event) {
                if (event && event.node && event.node.setCapture) {
                    event.node.setCapture();
                }
                if (!target.data('isPanelSelect')) {
                    panel.set('_show', true);
                }
                target.data('isPanelSelect', false);
                return false;
            });
            panel.on('mouseout', function (event) {
                if (event && event.node && event.node.releaseCapture) {
                    event.node.releaseCapture();
                }
            });
            if ('panelB' === panel.get('panelName')) {
                panel.observe('_queryParamValue', function (newValue, oldValue) {
                    if (newValue || oldValue) {
                        if (!newValue) {
                            panel.set('_show', false);
                            target.trigger('focus');
                        } else {
                            doFilter(newValue);
                            var pagination = new Pagination($.extend({
                                target: panel.find('.panel-page-list'),
                                pageSize: 10,
                                template: $(template).filter('#panelListTpl'),
                                isShowNoData: false,
                                getLabel: function (context) {
                                    if (!context) {
                                        return '';
                                    }
                                    return context[me.labelField];
                                },
                                getValue: function (context) {
                                    if (!context) {
                                        return '';
                                    }
                                    return context[me.valueField];
                                },
                                actions: me.actions
                            }, me._panelPageList));
                            $(panel.find('.panel-page-list')).find('.page_size').hide();
                            $(panel.find('.panel-page-list')).find('.page_total').hide();
                            pagination.on('select', function (event, data) {
                                selectEvt(panel, event, data);
                            });
                            panel.pagination = pagination;
                        }
                    }
                });
            }
            return panel;
        };
        var appendPanelAToDom = function (_queryParamValue, isShow) {
            panelA = initPanel({
                panelName: 'panelA',
                el: me.el,
                panelId: '#searchPanelA',
                posClass: me.posClass,
                _queryParamValue: _queryParamValue,
                urlA: me.urlA
            });
            panelA.set('_show', isShow);
        };
        var appendPanelBToDom = function (_queryParamValue, isShow) {
            panelB = initPanel({
                panelName: 'panelB',
                el: me.el,
                panelId: '#searchPanelB',
                posClass: me.posClass,
                _queryParamValue: _queryParamValue,
                urlB: me.urlB
            });
            panelB.set('_show', isShow);
        };
        if (me.needSwitch) {
            appendPanelAToDom('', false);
        }
        appendPanelBToDom('', false);
        target.off('focus').on('focus', function (event) {
            var value = target.val() || void 0;
            if (me.needSwitch) {
                value = void 0;
                if (value) {
                    target.trigger('input');
                } else {
                    if (panelB) {
                        panelB.set('_show', false);
                    }
                    if (!panelA) {
                        appendPanelAToDom('', true);
                    }
                    panelA.set('_show', true);
                    if (me.urlA) {
                        if (!panelA.get('items') || panelA.get('items').length <= 0) {
                            if (loadTimeout) {
                                clearTimeout(loadTimeout);
                            }
                            var _load = function () {
                                var param = {
                                    'urlA': me.urlA,
                                    'panel': panelA
                                };
                                load(param);
                            };
                            loadTimeout = setTimeout(_load, 100);
                        }
                    }
                }
            }
            return false;
        });
        if (is.ie(8)) {
            target.off('propertychange').on('propertychange', function () {
                if (window.event.propertyName == 'value') {
                    inputEvt();
                }
            });
        } else {
            target.off('input paste').on('input paste', inputEvt);
        }
        var keydownEvent = function (event) {
            var keyCode = event.keyCode;
            if (KEYCODE_UP === keyCode) {
                if (target.get(0).setCapture) {
                    target.get(0).setCapture();
                }
                if (panelB && $(panelB.find('.panel-page-list')).find('.panel-list a') && $(panelB.find('.panel-page-list')).find('.panel-list a').length > 1) {
                    $(panelB.find('.panel-page-list')).find('.panel-list a').each(function (index, domEle) {
                        if ($(this).hasClass('hover')) {
                            if (0 == index) {
                                $(this).removeClass('hover').nextAll().last().addClass('hover');
                                return false;
                            } else {
                                $(this).removeClass('hover').prev().addClass('hover');
                                return false;
                            }
                        }
                    });
                }
                return false;
            } else if (KEYCODE_DOWN === keyCode) {
                if (target.get(0).setCapture) {
                    target.get(0).setCapture();
                }
                if (panelB && $(panelB.find('.panel-page-list')).find('.panel-list a') && $(panelB.find('.panel-page-list')).find('.panel-list a').length > 1) {
                    $(panelB.find('.panel-page-list')).find('.panel-list a').each(function (index, domEle) {
                        if ($(this).hasClass('hover')) {
                            if (index == $(this).siblings().length) {
                                $(this).removeClass('hover').prevAll().last().addClass('hover');
                                return false;
                            } else {
                                $(this).removeClass('hover').nextAll().first().addClass('hover');
                                return false;
                            }
                        }
                    });
                }
                return false;
            } else if (KEYCODE_ENTER === keyCode) {
                if (target.get(0).setCapture) {
                    target.get(0).setCapture();
                }
                chooseFirst(panelB);
                return false;
            } else {
                if (target.get(0).releaseCapture) {
                    target.get(0).releaseCapture();
                }
            }
        };
        if (target.get(0).attachEvent) {
            target.get(0).attachEvent('onkeydown', keydownEvent);
        } else {
            target.off('keydown').on('keydown', keydownEvent);
        }
        target.off('mousewheel DOMMouseScroll mousedown').on('mousewheel DOMMouseScroll mousedown', function () {
            if (target.get(0).releaseCapture) {
                target.get(0).releaseCapture();
            }
        });
        target.off('blur').on('blur', function (event) {
            if (target.prop('readonly')) {
                return false;
            }
            if (panelA && panelA.get('_show')) {
                panelA.set('_show', false);
            }
            if (panelB && panelB.get('_show')) {
                chooseFirst(panelB);
            }
            if (me.forceSelection && !keepValue()) {
                clearValue();
            }
            return false;
        });
        this.on = function (eventName, func) {
            panel.on(eventName, func);
        };
        this.getValue = function () {
            return selectedValue;
        };
    });
    return UI.Panel;
});