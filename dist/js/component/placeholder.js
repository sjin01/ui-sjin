define(['jquery'], function ($) {
	var pwdPhInputTmpl = '<input type="text" class="placeholder placeholderHid" name="password" placeholder="输入密码" value="输入密码">';
	var placeholder = function(){
		if(!placeholderSupport()){   // 判断浏览器是否支持 placeholder
			$(document).delegate("[placeholder]","focus", function(){
		    	var input = $(this);
		        if (input.val() == input.attr('placeholder')) {
		            if(input.hasClass("placeholderHid")){
		            	input.prev().show().focus();
		            	input.remove();
		            }else{
		            	input.val('');
			            input.removeClass('placeholder');
		            }
		        }
		    }).delegate("[placeholder]","blur", function(){
		    	var input = $(this);
		        if (input.val() == '' || input.val() == input.attr('placeholder')) {
		        	if(input.attr("type") == "password"){
						if(!input.next().hasClass("placeholderHid")){
							$(pwdPhInputTmpl).insertAfter(input);
							input.next().val(input.attr('placeholder'))
								.attr({
									"placeholder": input.attr('placeholder'),
									"name": input.attr('name'),
									"id": input.attr('id'),
								});
						}
		        		input.hide();
		        	}else{
		        		input.addClass('placeholder');
			            input.val(input.attr('placeholder'));
		        	}
		        }
		    });
			$('[placeholder]').blur();
		};
	}
	
	var placeholderSupport = function() {
	    return 'placeholder' in document.createElement('input');
	}
	
	var removePlaceHolderVal = function(){
		if(!placeholderSupport()){
			$('input').each(function(domEle, index){
				if($(this).val() == $(this).attr("placeholder")){
					$(this).val('');
				}
			});
		}
	}
	
	return {
		placeholder: placeholder,
		placeholderSupport: placeholderSupport,
		removePlaceHolderVal: removePlaceHolderVal
    };
});
