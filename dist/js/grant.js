define('grant', ['jquery'], function ($) {
    var permissionSelector = '*[permission]';
    var applyGrant = function (root) {
        var elements;
        if (root) {
            elements = root.find(permissionSelector);
        } else {
            elements = $(permissionSelector);
        }
        var permissionIdArray = [];
        elements.each(function (index, item) {
            var elem = $(item);
            elem.hide();
            var permissionId = elem.attr('permission');
            permissionIdArray.push(permissionId);
        });
        $.ajax({
            url: contextPath + '/systemmgr/res/resmg/getUserResByResCode',
            data: { resCodes: permissionIdArray.join(',') },
            dataType: 'json',
            success: function (response) {
                if (response.code == 0) {
                    var permissions = response.data;
                    elements.each(function (index, item) {
                        var elem = $(item);
                        var permissionId = elem.attr('permission');
                        if (permissions[permissionId]) {
                            elem.show();
                        } else {
                            elem.remove();
                        }
                    });
                }
            },
            error: function () {
                throw new Error('获取权限信息失败\uFF01请联系管理员\uFF01');
            }
        });
    };
    $(function () {
        applyGrant();
    });
    return {
        filter: function (rootSelector) {
            applyGrant($(rootSelector));
        }
    };
});