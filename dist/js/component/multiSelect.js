define(['jquery','text!../template/components.rac','ractive','ui',"css!../css/component/multiSelect.css",'window'],function($,template,Ractive,UI,UIWindow){
    UI.MultiSelect = UI.extend(UI,function(options){
        /**
         * jquery选择器或者jquery对象【输入框】
         */
        this.target = options.target;
        /**
         * 多选组件数据
         */
        this.items = options.items||[];

        /**
         * 多选组件选中值保存容器，jquery选择器或者jquery对象
         */
        this.valueHolder = options.valueHolder;

        /**
         * 用于显示的字段名称
         */
        this.labelField = options.labelField||"name";

        /**
         * 每个条目的值对应的字段名称
         */
        this.valueField = options.valueField||"value";

        /**
         * 用于查询数据的参数名称
         */
        this.paramName = options.paramName;

        /**
         * 数据加载地址
         */
        this.url = options.url;

        /**
         * 多选控件宽度，默认为对应的输入框的宽度，请使用数值类型
         */
        this.width = options.width;

        this.getName = function(){
            return "MultiSelect";
        };

        this.set = function(key,value){
            multiSelect.set(key,value);
        };

        this.on = function(eventName,func){
            multiSelect.on(eventName,func);
        };

        this.update = function(values,labels){
            if(!(values instanceof Array) || !(labels instanceof Array)){
                UIWindow.alert({
                    type:'error',
                    message:"更新多选组件的值时出错：参数类型错误"
                });
                return;
            }
            var valueHolder = this.valueHolder;
            if(typeof valueHolder === "string"){
                valueHolder = $(valueHolder);
            }else if(valueHolder && !(valueHolder instanceof jQuery)){
                UIWindow.alert({
                    type:'error',
                    message:"valueHolder参数类型错误!"
                });
                return;
            }
            if(valueHolder){
                valueHolder.val(values.join(","));
            }
            target.val(labels.join(","));
            multiSelect.fire('update');
        };
        /**
         * 获取当前选中的值
         */
        this.getValue = function(){
            return selectedValues.join(",");
        };

        var multiSelect = null;
        var me = this;
        var selectedValues = [];
        var selectedLabels = [];
        var target = $(this.target);
        target.prop("readonly",true);

        var load = function(){
            $.ajax({
                url:contextPath+me.url,
                type:'post',
                dataType:'json',
                success:function(response){
                    if(response.code===0){
                        multiSelect.set("items",response.data);
                    }
                },
                error:function(XMLHttpRequest, textStatus, errorThrown){
                    UIWindow.alert({
                        type:'error',
                        message:"加载列表信息失败:"+(textStatus||"")+(errorThrown||"")
                    });
                }
            })
        };

        var timer,delay=200;

        var initMultiSelect = function(value){
            multiSelect = new Ractive({
                el:'body',
                template:$(template).filter("#multiSelect").html(),
                data:{
                    items:me.items,
                    _top:target.offset().top+target.outerHeight(),
                    _left:target.offset().left,
                    _width:(me.width || target.outerWidth()),
                    _queryParamValue:value,
                    _show:false,
                    getLabel:function(context){
                        return context[me.labelField];
                    },
                    getValue:function(context){
                        return context[me.valueField];
                    },
                    getId:function(context){
                        if(context._id){
                            return context._id;
                        }
                        context._id = me.generateId();
                        return context._id;
                    }
                },
                onOver:function(){
                    clearTimeout(timer);
                },
                onOut:function(){
                    timer = setTimeout(function(){
                        multiSelect.set("_show",false);
                    },delay);
                },
                append:true
            });
            multiSelect.observe("items.*._checked",function(newValue, oldValue, keypath){
                var items = multiSelect.get('items');
                selectedLabels = [];
                selectedValues = [];
                for(var i=0;i<items.length;i++){
                    var item = items[i];
                    if(item && item._checked){
                        selectedLabels.push(item[me.labelField]);
                        selectedValues.push(item[me.valueField]);
                    }
                }
                me.update(selectedValues,selectedLabels);
            },{init:false});
            target.hover(function(){
                clearTimeout(timer);
                var left = target.offset().left;
                var top = target.offset().top+target.outerHeight();
                var width = target.outerWidth();
                multiSelect.set("_left",left);
                multiSelect.set("_top",top);
                multiSelect.set("_width",me.width || width);
                multiSelect.set("_show",true);
            },function(){
                timer = setTimeout(function(){
                    multiSelect.set("_show",false);
                },delay);
            });
            if(me.items.length==0){
                load();
            }
        };

        initMultiSelect();

    });
    return UI.MultiSelect;
});
