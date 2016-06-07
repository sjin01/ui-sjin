/**
 * Created by martin on 15/6/8.
 */
define(function(){
    var getId = function(){
        var id = 1;
        return function(){
            return id++;
        };
    }();
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
    UI.prototype.generateId = function(){
        if(typeof this.getName !== 'function'){
            throw Error("请实现getName函数");
        }
        var name = this.getName();
        return "_"+name+getId();
    };
    return UI;
});