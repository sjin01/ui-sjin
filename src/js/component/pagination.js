define(["jquery","ractive","text!../template/components.rac",'ui','ractive-slide',"jquery-pagination","css!../css/component/pagination.css"],function($,Ractive,template,UI,Slide){

    var sortDecorator = function (node,sortKey) {
        var me = this;
        var elem = $(node);
        var headTitle = elem.text();
        elem.empty();
        var headWrapper = $("<div class='sortable'>"+headTitle+"<i></i></div>");
        elem.append(headWrapper);
        elem.click(function(){
            var className = headWrapper.get(0).className;
            elem.closest("tr").find("div[class^='sort']").removeClass().addClass("sortable");
            if(className == 'sortable'){
                headWrapper.removeClass('sortable').addClass('sort_asc');
            }else if(className.indexOf('sort_asc')>-1){
                headWrapper.removeClass('sort_asc').addClass('sort_desc');
            }else{
                headWrapper.removeClass('sort_desc').addClass('sort_asc');
            }
            me.sort(sortKey);
        });
        return {
            teardown: function () {
                //啥也不干
            }
        };
    };

    UI.Pagination = UI.extend(UI,function(options){
        var defaults = {
            target:null,//树绑定的DOM元素对应的jquery选择器、dom元素或者jquery对象
            localItems:[],//本地对象数组，用于前端分页
            items:[],//当前页记录
            pageNo:1,//当前页计数
            pageSize:15,//当前页最多可显示的记录数
            sortAsc:true,//排序方向
            sortKey:"",//排序属性名
            isShowNoData:true,//是否显示没数据时的提示信息
            pageSizeArray:[15,30,50],//可供选择的每页大小
            template:"",//分页所对应的视图,jQuery选择器
            dataUrl:"",//数据接口地址
            queryParams:{},//查询参数,JSON格式或者url参数形式
            actions:{},
            total:0//总记录条数
        };

        var lazyLoad = (typeof options.items === 'undefined');

        var me = $.extend(defaults,options);

        if(me.localItems.length>0){
            me.total = me.localItems.length;
        }
        var delay = 50;
        var lastLoadTime =0;

        var ractiveSettings = $.extend({
            el: me.target,
            template: $(template).filter("#pagination").html(),
            partials: { content: $(me.template).html() },
            data: me,
            transitions: {
                slide: Slide
            },
            decorators: {
                sort: sortDecorator
            },
            sort:function(sortKey){
                var pervKey = this.get("sortKey");
                var prevSort = this.get("sortAsc");
                if(pervKey==sortKey){
                    this.set("sortAsc",!prevSort);
                }else{
                    this.set("sortKey",sortKey);
                    this.set("sortAsc",true);
                }
                load();
                return false;
            }
        },me.actions);
        var ractive = new Ractive(ractiveSettings);

        var load = function(){
            var currentTime = (new Date()).getTime();
            if(currentTime-lastLoadTime<delay){
                return;
            }
            lastLoadTime = currentTime;
            var params = {
                pageNo:me.pageNo,
                pageSize:me.pageSize,
                sortAsc:me.sortAsc,
                sortKey:me.sortKey
            };
            /**********************远程分页************************/
            if(me.localItems.length==0 && me.dataUrl){
                params = $.param(params);
                var queryParams = ractive.get("queryParams");
                if(typeof queryParams==="string" && !!queryParams){
                    params = params+"&"+queryParams;
                }else if(!!$.param(queryParams)){
                    params = params+"&"+$.param(queryParams);
                }

                $.ajax({
                    type:"POST",
                    url:me.dataUrl,
                    data:params,
                    dataType:"json"
                }).done(function(response){
                    var data = response.data;
                    ractive.set(data);
                }).fail(function( jqxhr, textStatus, error) {
                    throw new Error("加载分页数据失败:"+error);
                });
            }
            /*******************本地分页*****************************/
            else{
                var total = me.localItems.length;
                var startIndex = (params.pageNo-1)*params.pageSize;
                if(startIndex>total-1 || startIndex<0){
                    startIndex = 0;
                    me.pageNo = 1;
                }
                var endIndex = startIndex + params.pageSize;
                if(endIndex>=total){
                    endIndex = total;
                }
                var items = me.localItems.slice(startIndex,endIndex);
                ractive.set({
                    items:items,//当前页记录
                    pageNo: me.pageNo,
                    pageSize: me.pageSize,
                    total:total,
                    sortAsc: me.sortAsc,
                    sortKey: me.sortKey
                });
            }
        };
        ractive.observe("pageNo pageSize",function(){
            load();
        },{init:lazyLoad});

        ractive.on('complete change', function () {
            $(me.target).find(".pagination").pagination({
                items: ractive.get("total"),
                itemsOnPage: ractive.get("pageSize"),
                currentPage: ractive.get("pageNo"),
                onPageClick: function(pageNumber){
                    ractive.set("pageNo",pageNumber);
                }
            });
        });
        ractive.on("goClick",function(event){
            var pageNo = $(event.node).parent().find("input").val();
            pageNo = parseInt(pageNo);
            if(isNaN(pageNo) || pageNo <= 0 ){
                pageNo = ractive.get("pageNo");
            }
            ractive.set("pageNo",pageNo);
        });
        ractive.on("changePageSize",function(event){
            var pageSize = $(event.node).text();
            pageSize = parseInt(pageSize);
            ractive.set("pageSize",pageSize);
        });
        this.setQueryParams = function(queryParams,forceUpdate){
            var params = queryParams;
            if(forceUpdate){
                if(typeof params==="string" && !!params){
                    params = params+"&_r="+Math.random();
                }else if(typeof params === "object"){
                    params = params || {};
                    params._r = Math.random();
                }
            }
            ractive.set("queryParams",params);
            load();
        };
        this.refresh = function(){
            load();
        };
        this.observe = function(variable,func,init){
            ractive.observe(variable,func,{init:!!init});
        };
        this.on = function(eventName,func){
            ractive.on(eventName,func);
        };
        this.fire = function(eventName,event, data){
            ractive.fire(eventName,event, data);
        };
        this.get = function(){
            return ractive.get.apply(ractive,arguments);
        };
        this.set = function(){
            ractive.set.apply(ractive,arguments);
        };
        this.getUrlParams = function(){
            var params = {
                pageNo:me.pageNo,
                pageSize:me.pageSize,
                sortAsc:me.sortAsc,
                sortKey:me.sortKey
            };
            params = $.param(params);
            var queryParams = ractive.get("queryParams");
            if(typeof queryParams==="string" && !!queryParams){
                params = params+"&"+queryParams;
            }else if(!!$.param(queryParams)){
                params = params+"&"+$.param(queryParams);
            }
            return params;
        }
    });

    return UI.Pagination;
});