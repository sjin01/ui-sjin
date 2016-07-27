define('is', [], function () {
    var isIE = function (ver) {
        var b = document.createElement('b');
        b.innerHTML = '<!--[if IE ' + ver + ']><i></i><![endif]-->';
        return b.getElementsByTagName('i').length === 1;
    };
    return { ie: isIE };
});