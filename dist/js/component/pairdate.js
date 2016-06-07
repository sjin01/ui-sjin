define(['jquery','pikaday.jquery','moment'],function($){
	var pairDate = function (){
        this.clear = function(){
            this.startPicker.setDate(null);
            this.startDate = null;
            this.updateStartDate();
            this.endPicker.setDate(null);
            this.endDate = null;
            this.updateEndDate();
            return this;
        };

        this.init = function(beg,end){
            var me = this;
            this.startDate = $(beg).val();
            this.endDate = $(end).val();
            this.startPicker = $(beg).pikaday({
                firstDay: 1,
                maxDate: new Date(),
                onSelect: function() {
                    me.startDate = this.getDate();
                    me.updateStartDate();
                }
            }).data('pikaday');
            this.endPicker = $(end).pikaday({
                firstDay: 1,
                maxDate: new Date(),
                onSelect: function() {
                    me.endDate = this.getDate();
                    me.updateEndDate();
                }
            }).data('pikaday');
            this.updateStartDate = function() {
                this.startPicker.setStartRange(this.startDate);
                this.endPicker.setStartRange(this.startDate);
                this.endPicker.setMinDate(this.startDate);
            };
            this.updateEndDate = function() {
                this.startPicker.setEndRange(this.endDate);
                this.startPicker.setMaxDate(this.endDate);
                this.endPicker.setEndRange(this.endDate);
            };
            if (this.startDate) {
                this.updateStartDate();
            }
            if (this.endDate) {
                this.updateEndDate();
            }
            return this;
        };
    };
    return new pairDate();
});