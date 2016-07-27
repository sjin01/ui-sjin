define('htmleditor', [
    'tinymce',
    'jquery'
], function (tinymce, $) {
    var htmlEditor = function (opts) {
        var defaults = {
            language: 'zh_CN',
            selector: '#textarea',
            theme: 'modern',
            plugins: [
                'advlist autolink lists link charmap print preview hr anchor pagebreak',
                'searchreplace wordcount visualblocks visualchars code fullscreen',
                'insertdatetime media nonbreaking save table contextmenu directionality',
                'emoticons paste textcolor colorpicker textpattern imageupload'
            ],
            toolbar1: 'insertfile undo redo | styleselect | bold italic | fontselect fontsizeselect | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link imageupload ',
            toolbar2: 'print preview media | forecolor backcolor emoticons',
            image_advtab: true,
            fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
            font_formats: '宋体=SimSun,宋体;仿宋=Arial,仿宋;微软雅黑=Arial,Microsoft YaHei,微软雅黑,sans-serif;黑体=Arial,黑体;楷体=Arial,楷体;',
            style_formats_merge: true,
            style_formats: [{
                    title: '行高',
                    items: [
                        {
                            title: '100%',
                            selector: 'p,div,h1,h2,h3,h4,h5,h6',
                            styles: {
                                lineHeight: '100%',
                                'marginTop': '0',
                                'marginBottom': '0'
                            }
                        },
                        {
                            title: '120%',
                            selector: 'p,div,h1,h2,h3,h4,h5,h6',
                            styles: {
                                lineHeight: '120%',
                                'marginTop': '0',
                                'marginBottom': '0'
                            }
                        },
                        {
                            title: '150%',
                            selector: 'p,div,h1,h2,h3,h4,h5,h6',
                            styles: {
                                lineHeight: '150%',
                                'marginTop': '0',
                                'marginBottom': '0'
                            }
                        },
                        {
                            title: '180%',
                            selector: 'p,div,h1,h2,h3,h4,h5,h6',
                            styles: {
                                lineHeight: '180%',
                                'marginTop': '0',
                                'marginBottom': '0'
                            }
                        },
                        {
                            title: '200%',
                            selector: 'p,div,h1,h2,h3,h4,h5,h6',
                            styles: {
                                lineHeight: '200%',
                                'marginTop': '0',
                                'marginBottom': '0'
                            }
                        }
                    ]
                }],
            relative_urls: false,
            imageUploadUrl: ''
        };
        var options = $.extend(defaults, opts);
        tinymce.init(options);
        return tinymce;
    };
    return htmlEditor;
});