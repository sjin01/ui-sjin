(function (root, factory) {
    'use strict';
    if (typeof exports === 'object') {
        factory(require('jquery'), require('pikaday'));
    } else if (typeof define === 'function' && define.amd) {
        define('pikaday.jquery', [
            'jquery',
            'lib/pikaday/pikaday'
        ], factory);
    } else {
        factory(root.jQuery, root.Pikaday);
    }
}(this, function ($, Pikaday) {
    'use strict';
    $.fn.pikaday = function () {
        var args = arguments;
        if (!args || !args.length) {
            args = [{}];
        }
        return this.each(function () {
            var self = $(this), plugin = self.data('pikaday');
            if (!(plugin instanceof Pikaday)) {
                if (typeof args[0] === 'object') {
                    var options = $.extend({}, args[0]);
                    options.field = self[0];
                    options.i18n = {
                        previousMonth: '上个月',
                        nextMonth: '下个月',
                        months: [
                            '一月',
                            '二月',
                            '三月',
                            '四月',
                            '五月',
                            '六月',
                            '七月',
                            '八月',
                            '九月',
                            '十月',
                            '十一月',
                            '十二月'
                        ],
                        weekdays: [
                            '星期日',
                            '星期一',
                            '星期二',
                            '星期三',
                            '星期四',
                            '星期五',
                            '星期六'
                        ],
                        weekdaysShort: [
                            '日',
                            '一',
                            '二',
                            '三',
                            '四',
                            '五',
                            '六'
                        ]
                    };
                    self.data('pikaday', new Pikaday(options));
                }
            } else {
                if (typeof args[0] === 'string' && typeof plugin[args[0]] === 'function') {
                    plugin[args[0]].apply(plugin, Array.prototype.slice.call(args, 1));
                }
            }
        });
    };
}));