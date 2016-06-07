
function isNull(_value) {
    return (_value == undefined || _value == "" || _value == null);
}
function fullSelect() {
    $("select[dictCode]").each(function (i, ele) {
        if(ele.length > 0) return;
        var nullOptionName = $(ele).attr("nullOptionName");
        if(isNull(nullOptionName)) nullOptionName = "全部";
        var dictCode = $(ele).attr("dictCode");
        var defaultValue = $(ele).attr("value");
        if (isNull(defaultValue))
            defaultValue = $(ele).attr("defaultValue");
        var needSetDefault = !isNull(defaultValue);
        $(ele).append('<option value="" >' + nullOptionName + '</option>');
        $.ajax({
            type: "POST",
            url: baseURL + "/systemmgr/dictionary/dictmgr/getDictByCode",
            data: "dictCode=" + dictCode,
            dataType: "json",
            //async: false,   //同步请求
            success: function (res) {
                if (res.code == "0") {
                    $(res.data).each(function (i, dictmgrVO) {
                        if (needSetDefault && dictmgrVO.dicItemCode == defaultValue) {
                            $(ele).append('<option value="' + dictmgrVO.dicItemCode + '" selected="selected">' + dictmgrVO.dicItemName + '</option>');
                        } else {
                            $(ele).append('<option value="' + dictmgrVO.dicItemCode + '" >' + dictmgrVO.dicItemName + '</option>');
                        }
                    });
                } else {
                    alert(res.message);
                }
            }
        });
    });

    $("select[tableName]").each(function (i, ele) {
        if(ele.length > 0) return;
        var nullOptionName = $(ele).attr("nullOptionName");
        if(isNull(nullOptionName)) nullOptionName = "全部";
        var tableName = $(ele).attr("tableName");
        var valueField = $(ele).attr("valueField");
        var displayField = $(ele).attr("displayField");
        var defaultValue = $(ele).attr("value");
        if (isNull(defaultValue))
            defaultValue = $(ele).attr("defaultValue");
        var needSetDefault = !isNull(defaultValue);
        $(ele).append('<option value="" >' + nullOptionName + '</option>');
        $.ajax({
            type: "POST",
            url: baseURL + "/systemmgr/dictionary/dictmgr/getSelectByTable?tableName=" + tableName + "&valueField=" + valueField + "&displayField=" + displayField,
            dataType: "json",
            //async: false,   //同步请求
            success: function (res) {
                if (res.code == "0") {
                    $(res.data).each(function (i, dictmgrVO) {
                        if (needSetDefault && dictmgrVO.dicItemCode == defaultValue) {
                            $(ele).append('<option value="' + dictmgrVO.dicItemCode + '" selected="selected">' + dictmgrVO.dicItemName + '</option>');
                        } else {
                            $(ele).append('<option value="' + dictmgrVO.dicItemCode + '" >' + dictmgrVO.dicItemName + '</option>');
                        }
                    });
                } else {
                    alert(res.message);
                }
            }
        });
    });
}

define(["jquery"], function ($) {
    fullSelect();
});
