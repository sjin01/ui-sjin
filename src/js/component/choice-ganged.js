/**
 * Created by shijing.guan on 2016/8/17.
 */
define(['jquery', 'ractive', 'ui', 'is', "css!/css/life/component/choice-ganged.css"], function ($, Ractive, UI, is) {

    var choiceGanged = function (options) {

        /**
         * validate params ...
         */
        if(!options.target || !options.tabs || options.tabs.length<=0){
            throw new Error("参数异常: options:{target:'', tabs[{name:'',getItems:function(){}, callback:function(){}}, {...}]}");
        }
        /**
         * params ...
         * @type {*|string}
         */
        var target = options.target;
        var tabList = options.tabs;
        var width = options.width || '400';

        var TEMPLATE = {
            parent: '<div class="choice-ganged-box"></div>',
            main: '<div class="choice-ganged-main"></div>',
            tabs: '<div class="tabs"></div>',
            content: '<div class="choice-content"></div>'
        };

        var $target = $(target);
        var $parent, $main, $tabs;

        /**
         * init -- 操作 dom
         */
        (function () {
            // 包一层 父div 用于选择区域部分的 定位
            $target.wrap(TEMPLATE.parent);
            $parent = $target.parent('.choice-ganged-box');

            // main
            $parent.append(TEMPLATE.main);
            $main = $target.next('.choice-ganged-main');
            $main.css({width: width + 'px'});

            // tabs
            $main.append(TEMPLATE.tabs);
            $tabs = $main.find('.tabs');

            // tabs data
            for (var i = 0; i < tabList.length; i++) {
                var tabItem = tabList[i];
                $tabs.append('<div class="tab'+(i==0?' cur':'')+'" data-index="'+i+'">'+tabItem.name+'</div>');

                // content  一个tab 对应一个 唯一ID 的 content
                $main.append('<div class="choice-content'+(i==0?' cur':'')+'" id="choice-content-'+i+'"></div>');
            }

        })();

        /**
         * init -- Events
         */
        (function () {
            /**
             * 绑定 input focus 事件
             */
            $target.on('focus', function (){
                $main.addClass('cur');
                switchoverTabs(0);
                loadCurData();
            });
            /**
             * 绑定 tabs 的点击事件
             */
            $tabs.find('.tab').off('click').on('click', function () {
                var checkedIndex = $(this).attr('data-index');   // 点击选择的 index
                // 必须每次重新获取
                var $curTab = $tabs.find('.tab.cur');   // 当前的 tab
                var index = $curTab.attr('data-index'); // 当前的 index
                // 如果选择是 当前的，或者当前之后的，pass掉；只响应当前之前的tab
                if(parseInt(checkedIndex) < parseInt(index)){
                    switchoverTabs( parseInt(checkedIndex) );
                }
            });
        })();

        /**
         * 装载 当前 版面的数据
         */
        var loadCurData = function (prevChoice, data){
            var $curTab = $tabs.find('.tab.cur');   // 当前的 tab
            var index = $curTab.attr('data-index'); // 当前的 index
            var $content = $main.find('#choice-content-'+index);  // 当前的content版面 -- 根据当前index获取

            var tabItem = tabList[index];           // 对应的配置项

            // 获取数据
            var tabData;
            if(data){
                tabData = data;
            }else{
                tabData = tabItem.getItems(prevChoice);       // 根据配置项定义获取数据的方法获取
            }

            // 处理数据
            if (tabData && tabData.data && tabData.data.length>0)  {

                if(!tabData.showField) tabData.showField = 'name';

                $content.html('');
                for (var i = 0; i < tabData.data.length; i++){
                    var item = tabData.data[i];

                    $content.append('<div class="item"><a href="javascript:void(0)" data-index="'+i+'">'+item[tabData.showField]+'</a></div>');
                }

                // 绑定其 点击事件
                $content.find('.item a').off('click').on('click',function (){
                    // 回调整个对象
                    var choiceObj = tabData.data[$(this).attr('data-index')];

                    if(tabItem.callback) tabItem.callback(choiceObj);
                    toNext(index, choiceObj);
                });

            }

            /*
             * Fn: 选择 -- 切换下一个 tab
             */
            var toNext = function (curIndex, curChoiceObj){
                // 假设长度为3，当前下标要小于 2才行， 否则认为 已经没有next了
                if(parseInt(curIndex) >=0 && parseInt(curIndex) < (tabList.length-1)){
                    switchoverTabs( (parseInt(curIndex)+1) ); //  切换 tab
                    loadCurData(curChoiceObj);  // 装载 当前版面数据；----- 点击事件触发式递归
                }
            }
        };

        /**
         * Fn ：切换 tabs
         * @param index
         */
        var switchoverTabs = function (index){
            $tabs.find('.tab').removeClass('cur');
            $tabs.find('.tab[data-index="'+index+'"]').addClass('cur');

            $main.find('.choice-content').removeClass('cur');
            $main.find('#choice-content-'+index).addClass('cur');
        };

        return {
            close : function (){
                if($main.hasClass('cur')) $main.removeClass('cur');
            },
            setCurData : function (data){
                loadCurData(null, data);
            }
        }
    };




    UI.ChoiceGanged = UI.extend(UI, choiceGanged);
    return UI.ChoiceGanged;
});