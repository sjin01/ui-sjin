/**
 * Created by martin on 6/24/15.
 */
define(['jquery','text!../../template/components.rac','ractive','ui',"css!../css/component/popup.css"],function($,template,Ractive,UI){
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

        this.show = options.show != void(0) ? !!options.show : true;
        /**
         * 自定义事件
         */
        this.actions = options.actions||{};
        var me = this;
        var stopResize = false;//防止无限调用resize方法
        var adjustSize = function(popup){
            var $center = $(popup.find('.popup_center'));
            var $content = $(popup.find('.popup_content'));
            var paddingVertical = $center.outerHeight()-$content.outerHeight(true);
            var titleHeight = $(popup.find('.popup_title')).outerHeight(true);
            var $contents = $content.children();
            var contentRealHeight = 0;
            $.each($contents,function(index,elem){
                contentRealHeight += $(elem).outerHeight(true);
            });
            var popupHeight = contentRealHeight+titleHeight+paddingVertical;
            popup.set("height",popupHeight+"px");
        };
        var customDomChange = me.actions && me.actions.ondomchange;
        me.actions && (me.actions.ondomchange = void(0));
        var popup = new Ractive($.extend({
            el:'body',
            template:$(template).filter("#popup").html(),
            partials:{template:$(me.template).html()},
            data: $.extend({
                width:me.width,
                height:me.height,
                show:me.show
            },me.data),
            append:true,
            ondomchange:function(){
                if(typeof customDomChange === 'function'){
                    customDomChange.call(this);
                }
                if(stopResize){
                    stopResize = false;
                    return;
                }
                stopResize = true;
                adjustSize(this);
            }
        },me.actions));
        popup.on("close",function(event){
            this.teardown();
        });
        popup.on("stopPropagation",function(event){
            event.original.stopPropagation();
        });
        this.adjustSize = function(){
            adjustSize(popup);
        };
        this.close = function(){
            popup.fire('close');
        };
        this.on = function(eventName,func){
            popup.on(eventName,func);
        };
        this.set = function(path,data){
            popup.set(path,data);
        };
        this.fire = function(eventName){
            popup.fire(eventName);
        };
        this.onchange = function(key,callback){
            popup.observe(key,callback);
        }
    });
    return UI.Popup;
});