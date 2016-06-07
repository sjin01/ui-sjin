define(['jquery', 'moment', 'pikaday.jquery','validate.zh'], function($, Moment, Pikaday) {
    // 添加验证信息样式
    $.validator.setDefaults({
        showErrors: function(map, list) {
            this.currentElements.removeClass('error_input').parent().find('[class="error_info"]').remove();
            $.each(list, function(index, error) {
                var tip = '<span class="error_info"><i></i>'+error.message+'</span>';
                $(error.element).addClass('error_input').parent().append(tip);
            });
        }
    });
  	 $('#begDate').pikaday({
           firstDay: 1,
           onSelect: function() {
               startDate = this.getDate();
               updateStartDate();
           }
       });
       $('#endDate').pikaday({
           firstDay: 1,
           onSelect: function() {
               endDate = this.getDate();
               updateEndDate();
           }
       });
       var startPicker = $('#begDate').data('pikaday'),
       endPicker = $('#endDate').data('pikaday'),
       updateStartDate = function() {
           startPicker.setStartRange(startDate);
           endPicker.setStartRange(startDate);
           endPicker.setMinDate(startDate);
       },
       updateEndDate = function() {
           startPicker.setEndRange(endDate);
           startPicker.setMaxDate(endDate);
           endPicker.setEndRange(endDate);
       },
       _startDate = startPicker.getDate(),
       _endDate = endPicker.getDate();

		if (_startDate) {
		    startDate = _startDate;
		    updateStartDate();
		}
		
		if (_endDate) {
		    endDate = _endDate;
		    updateEndDate();
		}
  });
