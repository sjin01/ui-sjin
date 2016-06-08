/**
 * Created by martin on 15/6/8.
 */
define(['jquery','text!../../template/components.rac','ractive','ui'],function($,template,Ractive,UI){
    UI.Tree = UI.extend(UI,function(options){
    	/**
    	 * 支持事件:labelClick
    	 */
        this.target = options.target;//树绑定的DOM元素对应的jquery选择器、dom元素或者jquery对象
        this.detailUrl = options.detailUrl;//结点对应的子节点数据加载地址
        this.url = options.url;//树数据加载地址
        this.data = options.data || [];//树数据
        this.labelField = options.labelField||"name";//显示名称
        /**
         * 结点值，默认情况下在点击某结点时会将此字段值传送给后端以加载子节点
         * 请求url形式为:detailUrl/{{valueField的值}}
         */
        this.valueField = options.valueField||"id";
        this.childrenField = options.childrenField||"children";
        /**
         * function getDetailParams(context){ return 加载子节点时所需要的额外的查询参数}
         */
        this.getDetailParams = options.getDetailParams||function(){};
        /**
         * 加载树根结点时的查询参数
         */
        this.queryParams = options.queryParams||{};
        this.actions = options.actions || {};
        var me = this;
        var treeTemplate = $(template).filter("#tree").html();
        var treeData = {};
        treeData[me.childrenField]=me.data;
        var ractiveSettings = $.extend({
            el:me.target,
            template:treeTemplate,
            partials:{subTree:treeTemplate},
            data: $.extend(treeData,{
                _isRoot:true,
                _expandAll:false,
                showSubtree:function(item){
                  if(typeof item._isOpen == "undefined"){
                      return this.get("_expandAll");
                  }
                  return !!item._isOpen;
                },
                getLabel:function(item){
                    return item[me.labelField];
                },
                getChildren:function(item){
                    return item[me.childrenField];
                },
                getTriangleClass:function(item){
                    var expandAll = !!this.get("_expandAll");
                	if(typeof item._isOpen == 'undefined'  && !item.hasChildren){
                		return "empty_triangle";
                	}
                	if(typeof item._isOpen == 'undefined'  && expandAll && item.hasChildren){
                		return "open_triangle";
                	}
                    if(!item._isOpen){
                        return "close_triangle";
                    }
                    var children = item[me.childrenField];
                    if((typeof children!=='undefined' && children.length==0) || !item.hasChildren){
                        return "empty_triangle";
                    }
                    return "open_triangle";
                }
            })
        },me.actions);
        var elem = new Ractive(ractiveSettings);
        var loadRoot = function(){
        	$.ajax({
                url:me.url,
                type:'post',
                data:me.queryParams,
                dataType:'json',
                success:function(response){
                    elem.set(me.childrenField,response.data[me.childrenField]);
                    elem.set("_expandAll",response.data.expandAll);
                },
                error:function(){

                }
            });
        };
        if(me.data.length==0){
        	loadRoot();
        }
        elem.on("nodeClick",function(event){
        	var node = $(event.node);
        	if(node.hasClass('empty_triangle')){
        		return;
        	}
            var context = event.context;
            var ractive = this;
            var keypath = event.keypath;
            var isOpen = (typeof context._isOpen == "undefined")?(!!this.get("_expandAll")):context._isOpen;
            ractive.set(keypath+"._isOpen",!isOpen);
            if(typeof context[me.childrenField]!=='undefined'){
                return true;
            }
            $.ajax({
                url:me.detailUrl+"/"+context[me.valueField],
                data:me.getDetailParams(context),
                type:"post",
                dataType:'json',
                success:function(response){
                    ractive.set(keypath+"."+me.childrenField,response.data[me.childrenField]);
                },
                error:function(){

                }
            });
        });
        this.on = function(eventName,func){
        	return elem.on(eventName,func);
        };
        this.setQueryParams = function(queryParams){
        	me.queryParams = queryParams;
        	loadRoot();
        };
        this.refresh = function(){
        	loadRoot();
        }
    });
    return UI.Tree;
});