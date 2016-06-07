/**
 * Created by martin on 15/6/8.
 */
define(function(){
    function UI(){

    };
    UI.clone = function (object) {
        var F = function () {
        };
        F.prototype = object;
        return new F();
    };
    UI.extend = function (superClass,subClass) {
        var clonedPrototype = this.clone(superClass.prototype);
        clonedPrototype.constructor = subClass;
        subClass.prototype = clonedPrototype;
        return subClass;
    };
    return UI;
});