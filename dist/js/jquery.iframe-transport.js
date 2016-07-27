define('jquery-iframe-transport', ['jquery'], function () {
    (function ($, undefined) {
        'use strict';
        $.ajaxPrefilter(function (options, origOptions, jqXHR) {
            if (options.iframe) {
                options.originalURL = options.url;
                return 'iframe';
            }
        });
        $.ajaxTransport('iframe', function (options, origOptions, jqXHR) {
            var form = null, iframe = null, name = 'iframe-' + $.now(), files = $(options.files).filter(':file:enabled'), markers = null, accepts = null;
            function cleanUp() {
                files.each(function (i, file) {
                    var $file = $(file);
                    $file.data('clone').replaceWith($file);
                });
                form.remove();
                iframe.one('load', function () {
                    iframe.remove();
                });
                iframe.attr('src', 'javascript:false;');
            }
            options.dataTypes.shift();
            options.data = origOptions.data;
            if (files.length) {
                form = $('<form enctype=\'multipart/form-data\' method=\'post\'></form>').hide().attr({
                    action: options.originalURL,
                    target: name
                });
                if (typeof options.data === 'string' && options.data.length > 0) {
                    $.error('data must not be serialized');
                }
                $.each(options.data || {}, function (name, value) {
                    if ($.isPlainObject(value)) {
                        name = value.name;
                        value = value.value;
                    }
                    $('<input type=\'hidden\' />').attr({
                        name: name,
                        value: value
                    }).appendTo(form);
                });
                $('<input type=\'hidden\' value=\'IFrame\' name=\'X-Requested-With\' />').appendTo(form);
                if (options.dataTypes[0] && options.accepts[options.dataTypes[0]]) {
                    accepts = options.accepts[options.dataTypes[0]] + (options.dataTypes[0] !== '*' ? ', */*; q=0.01' : '');
                } else {
                    accepts = options.accepts['*'];
                }
                $('<input type=\'hidden\' name=\'X-HTTP-Accept\'>').attr('value', accepts).appendTo(form);
                markers = files.after(function (idx) {
                    var $this = $(this), $clone = $this.clone().prop('disabled', true);
                    $this.data('clone', $clone);
                    return $clone;
                }).next();
                files.appendTo(form);
                return {
                    send: function (headers, completeCallback) {
                        iframe = $('<iframe src=\'javascript:false;\' name=\'' + name + '\' id=\'' + name + '\' style=\'display:none\'></iframe>');
                        iframe.one('load', function () {
                            iframe.one('load', function () {
                                var doc = this.contentWindow ? this.contentWindow.document : this.contentDocument ? this.contentDocument : this.document, root = doc.documentElement ? doc.documentElement : doc.body, textarea = root.getElementsByTagName('textarea')[0], type = textarea && textarea.getAttribute('data-type') || null, status = textarea && textarea.getAttribute('data-status') || 200, statusText = textarea && textarea.getAttribute('data-statusText') || 'OK', content = {
                                        html: root.innerHTML,
                                        text: type ? textarea.value : root ? root.textContent || root.innerText : null
                                    };
                                cleanUp();
                                completeCallback(status, statusText, content, type ? 'Content-Type: ' + type : null);
                            });
                            form[0].submit();
                        });
                        $('body').append(form, iframe);
                    },
                    abort: function () {
                        if (iframe !== null) {
                            iframe.unbind('load').attr('src', 'javascript:false;');
                            cleanUp();
                        }
                    }
                };
            }
        });
    }(jQuery));
    return;
});