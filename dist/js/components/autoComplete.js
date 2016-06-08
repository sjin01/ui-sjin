/**
 * Created by martin on 15/6/26.
 * 自动完成组件
 */
define(['jquery','text!../../template/components.rac','ractive','ui'],function($,template,Ractive,UI){
    UI.AutoComplete = UI.extend(UI,function(options){
        /**
         * jquery选择器或者jquery对象【输入框】
         */
        this.target = options.target;
        /**
         * 自动完成组件数据
         */
        this.data = options.data||[];

        /**
         * autoComplete选中值保存容器，jquery选择器或者jquery对象
         */
        this.valueHolder = options.valueHolder;

        /**
         * 用于显示的字段名称
         */
        this.labelField = options.labelField||"name";

        /**
         * 每个条目的值对应的字段名称
         */
        this.valueField = options.valueField||this.labelField;

        /**
         * 用于查询数据的参数名称
         */
        this.paramName = options.paramName;

        /**
         * 强制结果值必须来自下拉列表中的某项
         */
        this.forceSelection = options.forceSelection||true;
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

        var load = function(){
            var params = {};
            params[queryParamName]=autoComplete.get("_queryParamValue");
            if(params[queryParamName]==""){
            	return;
            }
            if(typeof me.prepareParams == "function"){
            	var customParams = me.prepareParams();
                params = $.extend(params,customParams);
            }
            $.ajax({
                url:contextPath+me.url,
                type:'post',
                dataType:'json',
                data:params,
                success:function(response){
                    autoComplete.set("items",response.data);
                },
                error:function(XMLHttpRequest, textStatus, errorThrown){
                    alert("加载列表信息失败:"+(textStatus||"")+(errorThrown||""));
                }
            })
        };

        var clearValue = function(){
            if(me.valueHolder){
                $(me.valueHolder).val("");
            }
            selectedValue = null;
        };
        var initAutoComplete = function(value){
            autoComplete = new Ractive({
                el:'body',
                template:$(template).filter("#autoComplete").html(),
                data:{
                    items:me.data,
                    _show:true,
                    _top:target.offset().top+target.outerHeight(),
                    _left:target.offset().left,
                    _width:target.outerWidth(),
                    _queryParamValue:value,
                    getLabel:function(context){
                    	if(!context){
                    		return "";
                    	}
                        return context[me.labelField];
                    }
                },
                append:true
            });
            autoComplete.on("select",function(event){
                event.original.preventDefault();
                if(event.original.which!=1){
                    return;//非鼠标左键点击
                }
                var elem = event.node;
                var context = event.context;
                selectedValue = context[me.valueField];
                if(me.valueHolder){
                    $(me.valueHolder).val(selectedValue);
                }
                target.val($(elem).text());
                keepValue = target.val() != autoComplete.get("_queryParamValue");
                autoComplete.set("_queryParamValue",target.val());
                autoComplete.set("_show",false);
                autoComplete.fire("ui.select",event,selectedValue);
            });
            autoComplete.observe("_queryParamValue",function(newValue){
            	if(!keepValue){
            		clearValue();
            	}
            	keepValue = false;
                autoComplete.set("_show",!!newValue);
                if(loadTimeout){
                    clearTimeout(loadTimeout);
                }
                loadTimeout = setTimeout(load,200);
            });
        };
        target.on("focus",function(){
            var left = target.offset().left;
            var top = target.offset().top+target.outerHeight();
            var width = target.outerWidth();
            if(autoComplete){
            	autoComplete.set("_left",left);
                autoComplete.set("_top",top);
                autoComplete.set("_width",width);
            }
        });
        /*输入框内容改变触发自动完成功能*/
        target.on("input paste",function(){
            var value= target.val();
            if(!autoComplete){
                initAutoComplete(value);
            }
            autoComplete.set("_queryParamValue",value);
        });

        target.on("blur",function(){
            if(target.prop("readonly")){
                return;
            }
            if(me.forceSelection && !selectedValue){
                target.val("");
            }
            if(autoComplete){
            	autoComplete.set("_show",false);
            }
        });

        this.on = function(eventName,func){
            autoComplete.on(eventName,func);
        };
        /**
         * 获取当前选中的值
         */
        this.getValue = function(){
            return selectedValue;
        }
    });
    return UI.AutoComplete;
});
