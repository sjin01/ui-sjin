define(['jquery'],function($){
    var permissionSelector = '*[permission]';
    var applyGrant = function(root){
        var elements;
        if(root){
            elements = root.find(permissionSelector);
        }else{
            elements = $(permissionSelector);
        }
        var permissionIdArray = [];
        elements.each(function(index,item){
            var elem = $(item);
            elem.hide();
            var permissionId = elem.attr("permission");
            permissionIdArray.push(permissionId);
        });
        $.ajax({
            url:contextPath+'/systemmgr/res/resmg/getUserResByResCode',
            data:{resCodes:permissionIdArray.join(",")},
            dataType:'json',
            success:function(response){
                if(response.code==0){
                    var permissions = response.data;
                    elements.each(function(index,item){
                        var elem = $(item);
                        var permissionId = elem.attr("permission");
                        if(permissions[permissionId]){
                            elem.show();
                        }else{
                            elem.remove();
                        }
                    });
                }
            },
            error:function(){
                throw new Error("获取权限信息失败！请联系管理员！");
            }
        })
    };
    $(function(){
        applyGrant();
    });
    return {
        /**
         * 过滤权限
         * @param rootSelector 权限过滤适用范围，jquery选择器
         */
        filter:function(rootSelector){
            applyGrant($(rootSelector));
        }
    }
});