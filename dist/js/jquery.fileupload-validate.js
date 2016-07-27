(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define('jquery-fileupload', [
            'jquery',
            'lib/jquery/fileupload/jquery.fileupload-process'
        ], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'));
    } else {
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';
    $.blueimp.fileupload.prototype.options.processQueue.push({
        action: 'validate',
        always: true,
        acceptFileTypes: '@',
        maxFileSize: '@',
        minFileSize: '@',
        maxNumberOfFiles: '@',
        disabled: '@disableValidation'
    });
    $.widget('blueimp.fileupload', $.blueimp.fileupload, {
        options: {
            getNumberOfFiles: $.noop,
            messages: {
                maxNumberOfFiles: '文件数量超过上限',
                acceptFileTypes: '文件类型不匹配',
                maxFileSize: '文件太大',
                minFileSize: '文件太小'
            }
        },
        processActions: {
            validate: function (data, options) {
                if (options.disabled) {
                    return data;
                }
                var dfd = $.Deferred(), settings = this.options, file = data.files[data.index], fileSize;
                if (options.minFileSize || options.maxFileSize) {
                    fileSize = file.size;
                }
                if ($.type(options.maxNumberOfFiles) === 'number' && (settings.getNumberOfFiles() || 0) + data.files.length > options.maxNumberOfFiles) {
                    file.error = settings.i18n('maxNumberOfFiles');
                } else if (options.acceptFileTypes && !(options.acceptFileTypes.test(file.type) || options.acceptFileTypes.test(file.name))) {
                    file.error = settings.i18n('acceptFileTypes');
                } else if (fileSize > options.maxFileSize) {
                    file.error = settings.i18n('maxFileSize');
                } else if ($.type(fileSize) === 'number' && fileSize < options.minFileSize) {
                    file.error = settings.i18n('minFileSize');
                } else {
                    delete file.error;
                }
                if (file.error || data.files.error) {
                    data.files.error = true;
                    dfd.rejectWith(this, [data]);
                    alert(file.error);
                } else {
                    dfd.resolveWith(this, [data]);
                }
                return dfd.promise();
            }
        }
    });
}));