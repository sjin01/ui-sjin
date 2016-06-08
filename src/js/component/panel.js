/**
 * Created by kai.zuo on 2016/3/23.
 * 首页搜索面板组件
 */
define(['jquery', 'pagination','text!../../template/components.rac','ractive','ui','is'],function($, Pagination,template,Ractive,UI,is){
    UI.Panel = UI.extend(UI,function(options){
        //jquery选择器或者jquery对象【输入框】
        this.target = options.target;
        //面板添加到的父dom元素【容器】
        this.el = options.el;
        //定位样式
        this.posClass = options.posClass;
        //是否需要在输入时切换面板
        this.needSwitch = options.needSwitch !== false;
        //数据：data = [{"name":"test", "url":"baidu.com"}]
        this.data = options.data || [];
        var testData = [
            {"name" : "螺纹钢",  "value" : "dgag"},
            {"name" : "螺纹钢1", "value" : "dgag1"},
            {"name" : "螺纹钢2", "value" : "dgag2"},
            {"name" : "螺纹钢3", "value" : "dgag3"},
            {"name" : "螺纹钢4", "value" : "dgag4"}
        ];

        /**
         * 强制结果值必须来自下拉列表中的某项
         */
        this.forceSelection = options.forceSelection !== false;
        /**
         * 数据加载地址
         */
        this.urlA = options.urlA;//panelA
        this.urlB = options.urlB;//panelB
        this.panelPageList = options.panelPageList || {};//分页总列表数据
        this._panelPageList = {};
        $.extend(true, this._panelPageList, this.panelPageList);//深拷贝
        /**
         * 用于查询数据的参数名称
         */
        this.paramName = options.paramName;
        /**
         * 自定义额外查询参数，返回javascript Object类型，参数名为键，参数值为值
         */
        this.prepareParams = options.prepareParams;
        /**
         * panel 选中值保存容器，jquery选择器或者jquery对象(隐藏域)
         */
        this.valueHolder = options.valueHolder || $(this.target);
        /**
         * 用于显示的字段名称
         */
        this.labelField = options.labelField || "name";

        /**
         * 每个条目的值对应的字段名称
         */
        this.valueField = options.valueField || this.labelField;


        var me = this;
        var target = $(this.target);
        var queryParamName = this.paramName || target.attr("name");
        var selectedValue = null;
        var loadTimeout = 0;
        var panelA = null;
        var panelB = null;

        var KEYCODE_ENTER = 13;
        var KEYCODE_UP = 38;
        var KEYCODE_DOWN = 40;

        //将panel从dom树中删除
        this.detach = function(){
            target.off();//移除所有事件：IE8，propertychange多次触发
            if(panelA){
                panelA.detach();
                panelA = null;
            }
            if(panelB){
                panelB.detach();
                panelB = null;
            }
        };

        //ajax加载数据
        var load = function(__options){
            var params = {};
            var url = "";
            if(__options.urlA){
                url = __options.urlA;
            }else{
                url = __options.urlB;
                params[queryParamName] = __options.panel.get("_queryParamValue");
                if(params[queryParamName]==""){
                    return;
                }
            }

            if(typeof me.prepareParams == "function"){
                var customParams = me.prepareParams();
                params = $.extend(params,customParams);
            }
            $.ajax({
                url:contextPath + url,
                type:'post',
                dataType:'json',
                data:params,
                success:function(response){
                    __options.panel.set("items",response.data);
                },
                error:function(XMLHttpRequest, textStatus, errorThrown){
                    //console.log("加载列表信息失败:"+(textStatus||"")+(errorThrown||""));
                    //__options.panel.set("items",testData);
                }
            })
        };

        //输入框中的值是否在面板中存在
        var keepValue = function(){
            //debugger;
            var inputValue = target.val();
            if(panelA){
                if(panelA.get("items") && panelA.get("items").length > 0){
                    for(var i = 0; i < panelA.get("items").length; i++){
                        if(inputValue == panelA.get("items")[i][me.labelField]){
                            return true;
                        }
                    }
                }
            }
            if(panelB){
                if(me.panelPageList.localItems && me.panelPageList.localItems.length > 0){
                    for(var i = 0; i < me.panelPageList.localItems.length; i++){
                        if(inputValue == me.panelPageList.localItems[i][me.labelField]){
                            return true;
                        }
                    }
                }
            }
            return false;
        };

        //设置值
        var setValue = function(_selectedValue, _targetVal, _valueHolderVal){
            selectedValue = _selectedValue;
            target.val(_targetVal);
            if(me.valueHolder){
                $(me.valueHolder).val(_valueHolderVal);
            }
        };

        //清空值
        var clearValue = function(){
            selectedValue = null;
            target.val("");
            if(me.valueHolder){
                $(me.valueHolder).val("");
            }
        };

        //panel选中事件
        var selectEvt = function(_panel, event, data){
            //console.log("select event");
            //debugger;
            if("panelA" === _panel.get("panelName")){
                target.data("isPanelASelect", true);
            }
            target.data("isPanelSelect", true);
            if(data && data.labelField){
                selectedValue = data.valueField;
                setValue(selectedValue, data.labelField, selectedValue);
            }else if(event){
                event.original.preventDefault();
                if(event.original.which && event.original.which!=1){
                    return false;//非鼠标左键点击
                }else if(event.original.button && event.original.button!=1){
                    return false;//非鼠标左键点击
                }
                var elem = event.node;
                var context = event.context;
                selectedValue = context[me.valueField];
                setValue(selectedValue, $(elem).text(), selectedValue);
            }else{
                clearValue();
            }
            //debugger;
            _panel.set("_show",false);
            return false;//阻止默认行为和冒泡；
        };

        //输入框输入事件
        var inputEvt = function(event){
            //console.log("txtinput paste");
            var value= target.val();
            //debugger;
            if(panelA){
                panelA.set("_show", false);
            }
            if( !target.data("isPanelASelect") ){
                if(!panelB){
                    appendPanelBToDom(value, false);
                }
                if(value || (!value && panelB.get("_queryParamValue"))){
                    panelB.set("_show", true);
                    //debugger;
                    if(value != panelB.get("_queryParamValue")){
                        panelB.set("_queryParamValue",value);
                    }
                }
            }
            target.data("isPanelASelect", false);
            return false;//阻止默认行为和冒泡；
        };

        //分页数据过滤
        var doFilter = function(newValue){
            //console.log("doFilter[newValue=" + newValue + "]");
            var newItems = [];
            if(me.panelPageList && me.panelPageList.localItems
                && me.panelPageList.localItems.length > 0){
                var localItems = me.panelPageList.localItems;
                for(var i = 0; i < localItems.length; i++){
                    var localItem = localItems[i];
                    if(localItem[me.labelField].indexOf(newValue) != -1){
                        newItems.push(localItem);
                    }
                }
                //debugger;
                me._panelPageList = {"localItems" : newItems};
            }
        };

        var chooseFirst = function(panelB){
            if(panelB){
                if($(panelB.find(".panel-page-list")).find(".panel-list a") &&
                    $(panelB.find(".panel-page-list")).find(".panel-list a").length > 0 ){
                    $(panelB.find(".panel-page-list")).find(".panel-list a").each(function(index, domEle){
                        if($(this).hasClass("hover")){
                            var _labelFieldStr = $(this).text();
                            var _valueFieldStr = $(this).attr("valueField");
                            var data = {
                                "labelField" : _labelFieldStr,
                                "valueField" : _valueFieldStr
                            };
                            panelB.pagination.fire("select", null, data);
                        }
                    });
                }
                panelB.set("_show", false);
            }
        };

        //初始化panel
        var initPanel = function(_options){
            var panel = new Ractive({
                el:_options.el,
                template:$(template).filter(_options.panelId).html(),
                append:true,
                data: {
                    panelName : _options.panelName,
                    el:_options.el,
                    _class : _options.posClass,
                    //items:me.data,
                    _show:true,
                    _queryParamValue:_options._queryParamValue,
                    getLabel:function(context){
                        if(!context){
                            return "";
                        }
                        return context[me.labelField];
                    },
                    getValue:function(context){
                        if(!context){
                            return "";
                        }
                        return context[me.valueField];
                    }
                }
            });

            //初始化时，先清空输入框的值
            clearValue();

            panel.on("select", function(event){
                //debugger;
                selectEvt(panel, event, null);
            });
            panel.on("panelClick", function(event){
                //console.log("panelClick");
                //debugger;
                if (event && event.node && event.node.setCapture){
                    event.node.setCapture();//IE8
                }
                if(!target.data("isPanelSelect")){
                    panel.set("_show", true);
                }
                target.data("isPanelSelect", false);
                return false;
            });
            panel.on("mouseout", function(event){
                if(event && event.node && event.node.releaseCapture){
                    event.node.releaseCapture();
                }
            });

            if("panelB" === panel.get("panelName")){
                panel.observe("_queryParamValue",function(newValue, oldValue){
                    //debugger;
                    //console.log("observe");
                    if(newValue || oldValue){
                        //debugger;
                        if(!newValue){//清空了输入框内容
                            //debugger;
                            panel.set("_show", false);
                            target.trigger("focus");
                        }else{
                            //console.log("pagination");
                            doFilter(newValue);
                            var pagination = new Pagination($.extend({
                                target: panel.find(".panel-page-list"),
                                pageSize : 10,
                                //dataUrl: _options.urlB,
                                template: $(template).filter('#panelListTpl'),
                                isShowNoData: false,
                                getLabel:function(context){
                                    if(!context){
                                        return "";
                                    }
                                    return context[me.labelField];
                                },
                                getValue:function(context){
                                    if(!context){
                                        return "";
                                    }
                                    return context[me.valueField];
                                },
                                actions: me.actions
                            }, me._panelPageList));
                            $(panel.find(".panel-page-list")).find(".page_size").hide();
                            $(panel.find(".panel-page-list")).find(".page_total").hide();
                            pagination.on("select", function(event, data){
                                //debugger;
                                selectEvt(panel, event, data);
                            });
                            panel.pagination = pagination;
                        }
                    }
                });
            }
            return panel;
        };

        var appendPanelAToDom = function(_queryParamValue, isShow){
            panelA = initPanel({
                panelName : "panelA",
                el : me.el,
                panelId : "#searchPanelA",
                posClass : me.posClass,
                _queryParamValue: _queryParamValue,
                urlA: me.urlA
            });

            panelA.set("_show",isShow);
            //if(!$(me.el).data("panelAs")){
            //    $(me.el).data("panelAs", [panelA]);
            //}else{
            //    $(me.el).data("panelAs").push(panelA);
            //}
        };

        var appendPanelBToDom = function(_queryParamValue, isShow){
            panelB = initPanel({
                panelName : "panelB",
                el : me.el,
                panelId : "#searchPanelB",
                posClass : me.posClass,
                _queryParamValue: _queryParamValue,
                urlB: me.urlB
            });
            panelB.set("_show",isShow);
            //if(!$(me.el).data("panelBs")){
            //    $(me.el).data("panelBs", [panelB]);
            //}else{
            //    $(me.el).data("panelBs").push(panelB);
            //}
        };

        if(me.needSwitch){
            appendPanelAToDom("", false);
        }
        appendPanelBToDom("", false);

        target.off("focus").on("focus", function(event){
            //debugger;
            //console.log("focus");
            var value= target.val() || void(0);
            if(me.needSwitch){
                value = void(0); //只要聚焦就弹出panelA
                if(value){
                    //debugger;
                    target.trigger("input");
                }else{
                    if(panelB){
                        panelB.set("_show", false);
                    }
                    //debugger;
                    if(!panelA){
                        appendPanelAToDom("", true);
                    }
                    panelA.set("_show", true);
                    if(me.urlA){
                        if(!panelA.get("items") || panelA.get("items").length <= 0){
                            if(loadTimeout){
                                clearTimeout(loadTimeout);
                            }
                            var _load = function(){
                                var param = {"urlA": me.urlA, "panel" : panelA};
                                load(param);
                            };
                            loadTimeout = setTimeout(_load, 100);
                        }
                    }
                }
            }
            //event.stopPropagation();

            return false;//阻止默认行为和冒泡；
        });

        /*输入框绑定输入粘贴事件*/
        if(is.ie(8)){
            target.off("propertychange").on("propertychange", function(){
                if(window.event.propertyName == 'value'){//只在value改变时，才触发事件
                    inputEvt();
                }
            });
        }else{
            target.off("input paste").on("input paste", inputEvt);
        }


        var keydownEvent = function(event){
            var keyCode = event.keyCode;
            if(KEYCODE_UP === keyCode){
                //console.log("key up");
                //debugger;
                if(target.get(0).setCapture){//IE8
                    target.get(0).setCapture();
                }
                if(panelB && $(panelB.find(".panel-page-list")).find(".panel-list a") &&
                    $(panelB.find(".panel-page-list")).find(".panel-list a").length > 1 ){
                    $(panelB.find(".panel-page-list")).find(".panel-list a").each(function(index, domEle){
                        if($(this).hasClass("hover")){
                            if(0 == index){//第一个
                                $(this).removeClass("hover").nextAll().last().addClass("hover");
                                return false;
                            }else{//其他
                                $(this).removeClass("hover").prev().addClass("hover");
                                return false;
                            }
                        }
                    });
                }
                return false;
            }else if(KEYCODE_DOWN === keyCode){
                //console.log("key down");
                //debugger;
                if(target.get(0).setCapture){//IE8
                    target.get(0).setCapture();
                }
                if(panelB && $(panelB.find(".panel-page-list")).find(".panel-list a") &&
                    $(panelB.find(".panel-page-list")).find(".panel-list a").length > 1 ){
                    $(panelB.find(".panel-page-list")).find(".panel-list a").each(function(index, domEle){
                        if($(this).hasClass("hover")){
                            if(index == $(this).siblings().length){//最后一个
                                //debugger;
                                $(this).removeClass("hover").prevAll().last().addClass("hover");
                                return false;//跳出循环
                            }else{//其他
                                $(this).removeClass("hover").nextAll().first().addClass("hover");
                                return false;
                            }
                        }
                    });
                }
                return false;
            }else if(KEYCODE_ENTER === keyCode){
                //console.log("key enter");
                //debugger;
                if(target.get(0).setCapture){//IE8
                    target.get(0).setCapture();
                }
                chooseFirst(panelB);
                return false;
            }else{
                if(target.get(0).releaseCapture){//IE8
                    target.get(0).releaseCapture();
                }
            }
        };

        if(target.get(0).attachEvent){
            target.get(0).attachEvent("onkeydown", keydownEvent);
        }else{
            target.off("keydown").on("keydown", keydownEvent);
        }

        target.off("mousewheel DOMMouseScroll mousedown").on("mousewheel DOMMouseScroll mousedown", function(){
            if(target.get(0).releaseCapture){//IE8
                target.get(0).releaseCapture();
            }
        });

        target.off("blur").on("blur",function(event){
            //console.log("blur");
            //debugger;
            if(target.prop("readonly")){
                return false;
            }
            if(panelA && panelA.get("_show")){
                panelA.set("_show", false);
            }
            if(panelB && panelB.get("_show")){
                chooseFirst(panelB);
            }
            if(me.forceSelection && !keepValue()){
                //debugger;
                clearValue();
            }
            return false;
        });

        this.on = function(eventName,func){
            panel.on(eventName,func);
        };
        /**
         * 获取当前选中的值
         */
        this.getValue = function(){
            return selectedValue;
        }
        //debugger;


    });
    return UI.Panel;
});