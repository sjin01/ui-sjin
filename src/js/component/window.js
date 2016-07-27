/**
 * Created by martin on 15/10/27.
 */
define(['jquery', 'text!../template/components.rac', 'ui', "css!../css/component/popup.css"], function($, template, UI) {
    UI.Window = UI.extend(UI, function(options) {
        /**
         * options可选类型:
         *
         * string:为弹窗内容，默认弹出窗口类型为提示窗口
         *
         * object:{
         *   type:'warning',//对话框类型，可选值为:'success','warning','error','confirm'
         *   title:'',//对话框标题 没有则走默认策略
         *   msgTitle:'', // 消息标题 没有则继承 title属性，
         *   message:'',//消息内容
         *   okText:'确定',//确定按钮文本内容
         *   cancelText:'取消',//取消文本内容
         *   notShowMsgTitle:true,   // 默认是false ，修改成true 则不显示 icon & mgstitle
         *   justClose:false,   // 默认是false ，修改成true 则不触发resolve
         *   cancelBtn: true   // 如果它等于true， 则不管是什么类型的弹窗，都会存在两个按钮
         * }
         */

        if (typeof options === 'string') {
            this.msgTitle = options;
            this.title = "提示";
            this.iconClass = 'icon-warning pull-left';
            this.type = 'warning';
        } else if (typeof options === 'object') {
            this.type = options.type || 'success';
            this.message = options.message || '';
            this.okText = options.okText || "确定";
            this.cancelText = options.cancelText || "取消";
            this.title = options.title || '提示';
            if (this.type === 'success') {
                //this.title = this.title||"成功";
                this.iconClass = 'icon-success pull-left';
            } else if (this.type === "warning") {
                //this.title = this.title||"提示";
                this.iconClass = 'icon-warning pull-left';
            } else if (this.type === "error") {
                //this.title = this.title||"错误";
                this.iconClass = 'icon-failure pull-left';
            } else if (this.type === 'confirm') {
                //this.title = this.title||"请确认";
                this.iconClass = 'icon-confirm pull-left';
            }

            this.cancelBtn = options.cancelBtn || false;
            this.notShowMsgTitle = options.notShowMsgTitle || false;

            this.msgTitle = options.msgTitle || this.title; // 获取msg title参数，没有则继承 对话框title
            this.justClose = !!options.justClose;
        } else {
            throw new Error("请检查参数类型！");
        }

        this.show = function() {
            var deferred = $.Deferred();
            var popup = $(template).filter("#window").html();
            popup = $(popup);
            popup.find("#title").html(this.title);
            popup.find("#message_title").html(this.msgTitle); // set msg title
            if (this.message) {
                popup.find("#message_title").css({
                    "font-size": "24px"
                });
            } else {
                popup.find("#message_title").css({
                    "font-size": "18px"
                });
            }
            popup.find("#message_title").css({
                "display": "block",
                "padding-left": "30px",
                "line-height": "1.5em"
            });
            popup.find(".ui-popup-footer").css({
                "line-height": "inherit",
                "height": "inherit",
                "font-size": "0"
            });
            popup.find("#icon").addClass(this.iconClass);
            var self = this;
            popup.find(".icon-close").click(function() {
                popup.remove();
                if (!self.justClose) {
                    deferred.resolve(false);
                }
            });
            popup.find("#message").html(this.message);
            popup.find("#message").css("margin-left", "36px");
            popup.find("#okButton").html(this.okText).click(function() {
                popup.remove();
                deferred.resolve(true);
            });
            popup.find("#okButton").css({
                "margin-left": "20px",
                "font-size": "14px"
            });
            popup.find("#cancelButton").css({
                "font-size": "14px"
            });
            if (this.type === 'confirm' || this.cancelBtn === true) {
                popup.find("#cancelButton").html(this.cancelText).click(function() {
                    popup.remove();
                    deferred.resolve(false);
                });
                if (this.notShowMsgTitle === true) {
                    //确认框不需要message title和icon
                    popup.find("#message_title").remove();
                    popup.find("#icon").remove();
                }
            } else {
                popup.find("#cancelButton").remove();
                popup.find("#okButton").addClass("single-btn");
            }
            if (!this.message) popup.find('#message').remove(); // message没值的时候， 清楚 message 区域
            $(document.body).append(popup);
            return deferred.promise();
        };
    });
    UI.Window.alert = function(options) {
        if (typeof options === 'object' && options.message) {
            options.msgTitle = [options.message, options.message = ''][0]; // message set to msgTitle & message = ''
        }
        var box = new UI.Window(options);
        return box.show();
    };
    UI.Window.confirm = function(options) {
        if (typeof options === 'object' && !options.type) {
            options.type = 'confirm';
        }
        var box = new UI.Window(options);
        return box.show();
    };
    return UI.Window;
});