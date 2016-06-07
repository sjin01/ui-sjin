/**
 * Created by martin on 6/24/15.
 */
define(['jquery','text!../template/components.rac','ractive','ui'],function($,template,Ractive,UI){
    UI.Popup = UI.extend(UI,function(options){
        /**
         * 弹出框内容模板,jQuery选择器
         * @type {string}
         */
        this.template = options.template||"";
        /**
         * 对话框宽度,如:"50%","10em","700px"等
         * @type {string}
         */
        this.width = options.width||"50%";
        /**
         * 对话框高度,如:"50%","10em","700px"等
         * @type {string}
         */
        this.height = options.height||"50%";
        /**
         * 弹出框模板数据
         * @type {object}
         */
        this.data = options.data||{};
        /**
         * 自定义事件
         */
        this.actions = options.actions||{};
        var me = this;
        var popup = new Ractive($.extend({
            el:'body',
            template:$(template).filter("#popup").html(),
            partials:{template:$(me.template).html()},
            data: $.extend({
                width:me.width,
                height:me.height
            },me.data),
            append:true
        },me.actions));
        popup.on("close",function(event){
            this.teardown();
        });
        popup.on("stopPropagation",function(event){
        	event.original.stopPropagation();
        });
        this.close = function(){
        	popup.fire('close');
        }
        this.on = function(eventName,func){
        	popup.on(eventName,func);
        },
        this.set = function(path,data){
            popup.set(path,data);
        },
        this.fire = function(eventName){
        	popup.fire(eventName);
        }
    });
    return UI.Popup;
});