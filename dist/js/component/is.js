/**
 * Created by kai.zuo on 2016/4/12.
 */

define([], function(){
    var isIE = function(ver){
        var b = document.createElement('b')
        b.innerHTML = '<!--[if IE ' + ver + ']><i></i><![endif]-->'
        return b.getElementsByTagName('i').length === 1
    };

    return {
        ie: isIE
    }
});
