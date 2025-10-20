// Global Counter
window.globalCnt = window.globalCnt || 
	{
		loading: 0, // Using loading_spin 
		ajax: 0, // Not using loading_spin
	}; 


var au = {};

$(function() {
	// Apply message data
	// usage> <span th:utext="${_msg['cm_welcome']?:'Welcome, Anonymous user'}" msgreplace th:data-name="${session.user.name}"></span>
	// If the message is 'Welcome, {name}', {name} is replaced by data-name attribute. 
	$.each($("[msgreplace]"), function(idx, o) {
		let html = $(o).html();
		const params = $(o).data();
		for (const key in params) {
			html = html.replaceAll(`{${key}}`, params[key]);
		}
		$(o).html(html);
	});	
});

au.aesopColor = ['#cac494', '#ebc39e', '#cfcecc', '#f0efe0', '#ece3d3', '#ded8d4', '#f5ece4', '#f7f1ec', '#e9f0e3', '#ebeadf', '#fefef2', '#c2c2af', '#c2c2af'];

au.msgSrc = function(id , value) {
	// message-source 사용 구현 필요
	return value;
};
	
// 비동기 AJAX
au.ajaxPost = function(url, param, cbFunction, errCbFunction){
	var processDataCheck = true;
	if (param != null && param.length > 0 && (param.toString().indexOf("=") > -1 )) {
		processDataCheck = false;
	}
	var ajaxObj = {
		url: url,
		data: param,
		type: 'post',
		dataType: 'json',
		processData: processDataCheck,
		beforeSend: function() {
			au.fnSetLoading("on");
		},
		complete: function() {
			au.fnSetLoading("off");
		},
		success: function (data) {
			cbFunction(data);
		},
		error: function (e) {
			if(errCbFunction) {
				errCbFunction(e);
			} else {
				au.errorAlert(e);
			}
		}
	};
	
	// json 방식이면 contentType을 변경 하고 json을 string으로 변경해서 넘긴다.
	// java controller에서 받을 때는 @RequestBody HashMap<String, Object> paramMap 로 받으면 됨
	if(typeof param == "object" ){
		ajaxObj.contentType = "application/json";
		ajaxObj.data = JSON.stringify(ajaxObj.data);
	}
	return $.ajax(ajaxObj);
};
	
	// 비동기 AJAX ( 로딩바 없음. )
au.ajaxPost2 = function(url, param, cbFunction, errCbFunction){
	var processDataCheck = true;
	if (param != null && param.length > 0 && (param.toString().indexOf("=") > -1 )) {
		processDataCheck = false;
	}
	var ajaxObj = {
		url: url,
		data: param,
		type: 'post',
		dataType: 'json',
		processData: processDataCheck,
		success: function (data) {
			cbFunction(data);
		}, 
		error: function (e) {
			if(errCbFunction) {
				errCbFunction(e);
			} else {
				au.errorAlert(e);
			}
		}
	};
	
	// json 방식이면 contentType을 변경 하고 json을 string으로 변경해서 넘긴다.
	// java controller에서 받을 때는 @RequestBody HashMap<String, Object> paramMap 로 받으면 됨
	if(typeof param == "object" ){
		ajaxObj.contentType = "application/json";
		ajaxObj.data = JSON.stringify(ajaxObj.data);
	}
	return $.ajax(ajaxObj);	
};

au.ajaxGet = function(url, param, cbFunction, errCbFunction){
	var processDataCheck = true;
	if (param != null && param.length > 0 && (param.toString().indexOf("=") > -1 )) {
		processDataCheck = false;
	}
	var ajaxObj = {
		url: url,
		data: param,
		type: 'get',
		dataType: 'json',
		processData: processDataCheck,
		beforeSend: function() {
			au.fnSetLoading("on");
		},
		complete: function() {
			au.fnSetLoading("off");
		},
		success: function (data) {
			cbFunction(data);
		},
		error: function (e) {
			if(errCbFunction) {
				errCbFunction(e);
			} else {
				au.errorAlert(e);
			}
		}
	};
	
	// json 방식이면 contentType을 변경 하고 json을 string으로 변경해서 넘긴다.
	// java controller에서 받을 때는 @RequestBody HashMap<String, Object> paramMap 로 받으면 됨
	if(typeof param == "object" ){
		ajaxObj.contentType = "application/json";
		ajaxObj.data = JSON.stringify(ajaxObj.data);
	}
	return $.ajax(ajaxObj);
};
	
// 비동기 AJAX ( 로딩바 없음. )
au.ajaxGet2 = function(url, param, cbFunction, errCbFunction){
	var processDataCheck = true;
	if (param != null && param.length > 0 && (param.toString().indexOf("=") > -1 )) {
		processDataCheck = false;
	}
	var ajaxObj = {
		url: url,
		data: param,
		type: 'get',
		dataType: 'json',
		processData: processDataCheck,
		success: function (data) {
			cbFunction(data);
		}, 
		error: function (e) {
			if(errCbFunction) {
				errCbFunction(e);
			} else {
				au.errorAlert(e);
			}
		}
	};
	
	// json 방식이면 contentType을 변경 하고 json을 string으로 변경해서 넘긴다.
	// java controller에서 받을 때는 @RequestBody HashMap<String, Object> paramMap 로 받으면 됨
	if(typeof param == "object" ){
		ajaxObj.contentType = "application/json";
		ajaxObj.data = JSON.stringify(ajaxObj.data);
	}
	return $.ajax(ajaxObj);	
};

au.ajaxPostNonAsync = function(url, param, cbFunction, errCbFunction){
	var processDataCheck = true;
	if (param != null && param.length > 0 && (param.toString().indexOf("=") > -1 )) {
		processDataCheck = false;
	}
	var ajaxObj = {
		url: url,
		data: param,
		type: 'post',
		async: false,
		dataType: 'json',
		processData: processDataCheck,
		success: function (data) {
			cbFunction(data);
		}, 
		error: function (e) {
			if(errCbFunction) {
				errCbFunction(e);
			} else {
				au.errorAlert(e);
			}
		}
	};
	
	// json 방식이면 contentType을 변경 하고 json을 string으로 변경해서 넘긴다.
	// java controller에서 받을 때는 @RequestBody HashMap<String, Object> paramMap 로 받으면 됨
	if(typeof param == "object" ){
		ajaxObj.contentType = "application/json";
		ajaxObj.data = JSON.stringify(ajaxObj.data);
	}
	return $.ajax(ajaxObj);
};
	
au.sjaxPost = function(url, param, cbFunction, errCbFunction){
	var processDataCheck = true;
	if (param != null && param.length > 0 && (param.toString().indexOf("=") > -1 || param[0].indexOf("=") > -1 )) {
		processDataCheck = false;
	}
	return $.ajax({
		url: url,
		data: param,
		type: 'post',
		async: false,
		dataType: 'json',
		processData: processDataCheck,
		success: function (data) {
			cbFunction(data);
		}, error: function (e) {
			if(errCbFunction) {
				errCbFunction(e);
			} else {
				au.errorAlert(e);
			}
		}
	});
};

au.fnAutoComplete = function(id,div,url,color,cbFunction,focusFlag, masterCd){
	$(id).on("keydown", function(){
		if(event.keyCode==13){
			return false;
		}
	});
	
	$(id).autocomplete({
		
		//appendTo: div,
		
		/* 검색 결과 글자 스타일 */
		create: function() {
			
			$(this).data('ui-autocomplete')._renderItem = function (ul, item) {
				
				var re = new RegExp(escapeRegExp($.trim(this.term)), "ig");
				var matches = item.label.matchAll(re);
				var t = "";
				var lastIdx = 0;
				for(var match of matches) {
					t += item.label.slice(lastIdx, match.index);
					t += "<span style='font-weight:600;color:"+color+";'>"+match[0]+"</span>";
					lastIdx = match.index + match[0].length;
				}
				t += item.label.slice(lastIdx);
				
				//하단 메세지 숨김
				$('.ui-helper-hidden-accessible').remove();
				
				return $("<li></li>")
					.data("item.autocomplete", item)
					.append("<a>" + t + "</a>")
					.appendTo(ul);
			};
		
		},
		
		/* true: 글자순서대로 찾기 / false: 입력한 글자 모두 찾기 */
		matchContains: true,
		
		autoFill:false,
		scroll:false,
		mustMatch:false,
		
		selectFirst:false,
		
		focus: function (event, ui) {
			event.preventDefault(); // without this: keyboard movements reset the input to ''
		},
		
		/* 선택 이벤트 */
		select: function( event, ui ) {
			
			event.preventDefault();
			
			//하단 메세지 숨김
			$('.ui-helper-hidden-accessible').remove();
			
			/* 데이터 없을 경우 */
			if(ui.item.value == '　'){
				
				$(id).val('');
				
			}else{
				autoCompleteIsSelect = true;
				cbFunction(ui.item.label,ui.item.value,ui.item.tempMap);
				if(focusFlag == null || focusFlag){
					$(event.target).blur();
				}
			}
			return false;
		},
		
		/* 조회 최소 글자 수 */
		minLength: 2,
		
		/* 검색 결과 오픈 시 호출 */
		open: function(event, ui){
			$(this).parents(".box-quicksearch").addClass("active");
			autoCompIdx = 1;
		},
		
		/* 검색 결과 종료 시 호출 */
		close: function(event, ui){
			$(this).parents(".box-quicksearch").removeClass("active");
			autoCompleteIsSelect = false;
		},

		/* 데이터 */
		source: function( request, response ) {
			//deptSearchYY
			var YY = '';
			if($(id).hasClass('deptSearchYY')){
				YY = $('#deptSearchYY').val();
			}
			
			$.ajax({
				url: url,
				dataType: "json",
				data: {
					search_word: $(id).val().replace(/(^\s*)|(\s*$)/g, ""),
					'YY': YY,
					MASTER_CD: masterCd,
					ADDINFO: $(id).data("addinfo")
				},
				success: function( data ) {
					
					/* 데이터 없을 경우 */
					if(data.length == 0){
						data.push({
							CD_NM: "No data",
							CD: '　',
						});
					}
					
					response( $.map( data, function( item ) {
						
						 return {
							 label: item.CD_NM,
							 value: item.CD,
							 tempMap: item
						 }	
					}));
				}
			});
		}
		
	});
};

au.fnAutoCompleteIndex = function(id,div,url,color,cbFunction, index){
	$(id).autocomplete({
		
		//appendTo: div,
		
		/* 검색 결과 글자 스타일 */
		create: function() {
			
			$(this).data('ui-autocomplete')._renderItem = function (ul, item) {
				
				var re = new RegExp(escapeRegExp($.trim(this.term)), "ig");
				var matches = item.label.matchAll(re);
				var t = "";
				var lastIdx = 0;
				for(var match of matches) {
					t += item.label.slice(lastIdx, match.index);
					t += "<span style='font-weight:600;color:"+color+";'>"+match[0]+"</span>";
					lastIdx = match.index + match[0].length;
				}
				t += item.label.slice(lastIdx);
				
				//하단 메세지 숨김
				$('.ui-helper-hidden-accessible').remove();
				
				return $("<li></li>")
					.data("item.autocomplete", item)
					.append("<a>" + t + "</a>")
					.appendTo(ul);
			};
		
		},
		
		/* true: 글자순서대로 찾기 / false: 입력한 글자 모두 찾기 */
		matchContains: true,
		
		autoFill:false,
		scroll:false,
		mustMatch:false,
		
		selectFirst:false,
		
		
		focus: function (event, ui) {
			event.preventDefault(); // without this: keyboard movements reset the input to ''
		},
		
		/* 선택 이벤트 */
		select: function( event, ui ) {
			
			//하단 메세지 숨김
			$('.ui-helper-hidden-accessible').remove();
			
			/* 데이터 없을 경우 */
			if(ui.item.value == '　'){
				
				$(id).val('');
				
			}else{
				cbFunction(ui.item.label,ui.item.value, index, ui.item.tempMap);
			}
			
			event.preventDefault();
			return false;
		},
		
		/* 조회 최소 글자 수 */
		minLength: 2,
		
		/* 검색 결과 오픈 시 호출 */
		open: function(event, ui){
			$(this).parents(".box-quicksearch").addClass("active");
		},
		
		/* 검색 결과 종료 시 호출 */
		close: function(event, ui){
			$(this).parents(".box-quicksearch").removeClass("active");
		},
		
		/* 데이터 */
		source: function( request, response ) {
			$.ajax({
				url: url,
				dataType: "json",
				data: {
					search_word: $(id).val(),
					ADDINFO: $(id).data("addinfo")
				},
				success: function( data ) {
					
					/* 데이터 없을 경우 */
					if(data.length == 0){
						data.push({
							CD_NM: "No data",
							CD: '　',
						});
					}
					
					response( $.map( data, function( item ) {
						
						 return {
							 label: item.CD_NM,
							 value: item.CD,
							 tempMap: item
						 }	
					}));
				}
			});
		}
		
	});
};

au.fnAutoCompleteItem = function(id,div,url,color,cbFunction){
	$(id).autocomplete({
		
		//appendTo: div,
		
		/* 검색 결과 글자 스타일 */
		create: function() {
			
			$(this).data('ui-autocomplete')._renderItem = function (ul, item) {
				
				var re = new RegExp(escapeRegExp($.trim(this.term)), "ig");
				var matches = item.label.matchAll(re);
				var t = "";
				var lastIdx = 0;
				for(var match of matches) {
					t += item.label.slice(lastIdx, match.index);
					t += "<span style='font-weight:600;color:"+color+";'>"+match[0]+"</span>";
					lastIdx = match.index + match[0].length;
				}
				t += item.label.slice(lastIdx);
				
				//하단 메세지 숨김
				$('.ui-helper-hidden-accessible').remove();
				
				return $("<li></li>")
					.data("item.autocomplete", item)
					.append("<a>" + t + "</a>")
					.appendTo(ul);
			};
		
		},
		
		/* true: 글자순서대로 찾기 / false: 입력한 글자 모두 찾기 */
		matchContains: true,
		
		autoFill:false,
		scroll:false,
		mustMatch:false,
		
		selectFirst:false,
		
		
		focus: function (event, ui) {
			event.preventDefault(); // without this: keyboard movements reset the input to ''
		},
		
		/* 선택 이벤트 */
		select: function( event, ui ) {
			
			//하단 메세지 숨김
			$('.ui-helper-hidden-accessible').remove();
			
			/* 데이터 없을 경우 */
			if(ui.item.value == '　'){
				
				$(id).val('');
				
			}else{
				autoCompleteIsSelect = true;
				cbFunction(ui.item.label,ui.item.value);
			}
			
			event.preventDefault();
			return false;
		},
		
		/* 조회 최소 글자 수 */
		minLength: 2,
		
		/* 검색 결과 오픈 시 호출 */
		open: function(event, ui){
			$(this).parents(".box-quicksearch").addClass("active");
		},
		
		/* 검색 결과 종료 시 호출 */
		close: function(event, ui){
			$(this).parents(".box-quicksearch").removeClass("active");
			autoCompleteIsSelect = false;
		},

		/* 데이터 */
		source: function( request, response ) {
			var itemTypes = '';
			var comp = $("#comp").val();
			var site = $("#site").val();
			if($("#itemType").length >0 ){
				itemTypes =$("#itemType").val(); 
			}else{
				$('input:checkbox[name="CHECK_GROUP1"]').each(function(){
					if($(this).attr("checked")=="checked"){
						itemTypes += $(this).val();
					}
					//console.log(itemTypes);
				});
				$('input:checkbox[name="CHECK_GROUP2"]').each(function(){
					if($(this).attr("checked")=="checked"){
						itemTypes += $(this).val();
					}
					//console.log(itemTypes);
				});
			}
			$.ajax({
				url: url,
				dataType: "json",
				data: {
					search_word: $(id).val(),
					search_type: itemTypes,
					COMP: comp,
					SITE: site,
					ADDINFO: $(id).data("addinfo")
				},
				success: function( data ) {
					
					/* 데이터 없을 경우 */
					if(data.length == 0){
						data.push({
							CD_NM: "No data",
							CD: '　',
						});
					}
					
					response( $.map( data, function( item ) {
						
						 return {
							 label: item.CD_NM,
							 value: item.CD
						 }	
					}));
				}
			});
		}
		
	});
};

au.fnAutoCompleteItem2 = function(id,div,url,color,cbFunction){
	$(id).autocomplete({
		
		//appendTo: div,
		
		/* 검색 결과 글자 스타일 */
		create: function() {
			
			$(this).data('ui-autocomplete')._renderItem = function (ul, item) {
				
				var re = new RegExp(escapeRegExp($.trim(this.term)), "ig");
				var matches = item.label.matchAll(re);
				var t = "";
				var lastIdx = 0;
				for(var match of matches) {
					t += item.label.slice(lastIdx, match.index);
					t += "<span style='font-weight:600;color:"+color+";'>"+match[0]+"</span>";
					lastIdx = match.index + match[0].length;
				}
				t += item.label.slice(lastIdx);
				
				//하단 메세지 숨김
				$('.ui-helper-hidden-accessible').remove();
				
				return $("<li></li>")
					.data("item.autocomplete", item)
					.append("<a>" + t + "</a>")
					.appendTo(ul);
			};
		
		},
		
		/* true: 글자순서대로 찾기 / false: 입력한 글자 모두 찾기 */
		matchContains: true,
		
		autoFill:false,
		scroll:false,
		mustMatch:false,
		
		selectFirst:false,
		
		
		focus: function (event, ui) {
			event.preventDefault(); // without this: keyboard movements reset the input to ''
		},
		
		/* 선택 이벤트 */
		select: function( event, ui ) {
			
			//하단 메세지 숨김
			$('.ui-helper-hidden-accessible').remove();
			
			/* 데이터 없을 경우 */
			if(ui.item.value == '　'){
				
				$(id).val('');
				
			}else{
				autoCompleteIsSelect = true;
				cbFunction(ui.item.label,ui.item.value);
			}
			
			event.preventDefault();
			return false;
		},
		
		/* 조회 최소 글자 수 */
		minLength: 2,
		
		/* 검색 결과 오픈 시 호출 */
		open: function(event, ui){
			$(this).parents(".box-quicksearch").addClass("active");
		},
		
		/* 검색 결과 종료 시 호출 */
		close: function(event, ui){
			$(this).parents(".box-quicksearch").removeClass("active");
			autoCompleteIsSelect = false;
		},

		/* 데이터 */
		source: function( request, response ) {
			var itemTypes = '';
			var comp = $("#comp").val();
			var site = $("#site").val();
			if($("#itemType").length >0 ){
				itemTypes =$("#itemType").val(); 
			}else{
				$('input:checkbox[name="CHECK_GROUP1"]').each(function(){
					if($(this).attr("checked")=="checked"){
						itemTypes += $(this).val();
					}
				});
				$('input:checkbox[name="CHECK_GROUP2"]').each(function(){
					if($(this).attr("checked")=="checked"){
						itemTypes += $(this).val();
					}
				});
			}
			$.ajax({
				url: url,
				dataType: "json",
				data: {
					search_word: $(id).val(),
					search_type: itemTypes,
					COMP: comp,
					SITE: site,
					ADDINFO: $(id).data("addinfo")
				},
				success: function( data ) {
					
					/* 데이터 없을 경우 */
					if(data.length == 0){
						data.push({
							CD_NM: "No data",
							CD: '　',
						});
					}
					
					response( $.map( data, function( item ) {
						
						 return {
							 label: item.CD_NM,
							 name: item.ENG_NM,
							 value: item.CD
						 }	
					}));
				}
			});
		}
		
	});
};

au.serializeJson = function(id) {
	var o = {};
	var a = $("#"+id).serializeArray();
	$.each(a, function() {
		if (o[this.name]) {
			if (!o[this.name].push) {
				o[this.name] = [o[this.name]];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});
	return o;
};

au.formCheck = function (obj, isEssential, maxLength, isKor, msg, minLength) {
	var formValue = $(obj).val();
	var formType = $(obj).prop('type');
	
	if (isEssential == 'Y') {
		var isCheck = true; 

		switch (formType) {
			case 'text':
				if ($.trim(formValue) == '' || $.trim(formValue) == null) {
					$(obj).val('').focus();
					isCheck = false;
				}
				else if(minLength != undefined && minLength != null && minLength != 0 && minLength != '0') {
					if(minLength > Number(au.getStrLength($.trim(formValue)))) {
						alert("[" + msg + "] " + "Minimum Length" + " (" + minLength + "Char)");
						$(obj).focus();
						return false;
					}
				}
				break;
			case 'checkbox':
				if ($(obj + ':checked').length > 0) {
					isCheck = true;
					break;
				}
				if ($('input:checkbox[id="' + obj.replace('#', '') + '"]:checked').length == 0) {
					isCheck = false;
				}
				break;
			case 'radio':
				if ($(obj + ':checked').length > 0) {
					isCheck = true;
					break;
				}
				if ($('input:radio[id="' + obj.replace('#', '') + '"]:checked').length == 0) {
					isCheck = false;
				}
				break;
			default:
				if (formValue == '' || formValue == null || $.trim(formValue) == '') {
					$(obj).focus();
					isCheck = false;
				}
				break;
		}
		if (!isCheck) {
			alert("[" + msg + "] " + "Need value");
			$(obj).focus();
			return false;
		}
	}
	
	if (maxLength > 0) {
		if (maxLength < Number(au.getStrLength(formValue))) {
			alert("[" + msg + "] "+ Number(maxLength) + ' ' + "Can't over");
			$(obj).focus();
			return false;
		}
	}
	
	
	return true;
};

au.formCheckToast = function (obj, isEssential, maxLength, isKor, msg, minLength) {
	var formValue = $(obj).val();
	var formType = $(obj).prop('type');
	
	if (isEssential == 'Y') {
		var isCheck = true; 

		switch (formType) {
			case 'text':
				if ($.trim(formValue) == '' || $.trim(formValue) == null) {
					$(obj).val('').focus();
					isCheck = false;
				}
				else if(minLength != undefined && minLength != null && minLength != 0 && minLength != '0') {
					if(minLength > Number(au.getStrLength($.trim(formValue)))) {
						M.toast({html: "[" + msg + "] " + $.APISMsg("COMM_950","항목은 최소 입력 글자수 제한 대상입니다.") + " (" + minLength + "Char)"});
						$(obj).focus();
						return false;
					}
				}
				break;
			case 'checkbox':
				if ($(obj + ':checked').length > 0) {
					isCheck = true;
					break;
				}
				if ($('input:checkbox[id="' + obj.replace('#', '') + '"]:checked').length == 0) {
					isCheck = false;
				}
				break;
			case 'radio':
				if ($(obj + ':checked').length > 0) {
					isCheck = true;
					break;
				}
				if ($('input:radio[id="' + obj.replace('#', '') + '"]:checked').length == 0) {
					isCheck = false;
				}
				break;
			default:
				if (formValue == '' || formValue == null || $.trim(formValue) == '') {
					$(obj).focus();
					isCheck = false;
				}
				break;
		}
		if (!isCheck) {
			M.toast({html: "[" + msg + "] " + $.APISMsg("COMM_489","항목은 필수 입력값입니다.")});
			$(obj).focus();
			return false;
		}
	}
	
	if (maxLength > 0) {
		if (maxLength < Number(au.getStrLength(formValue))) {
			M.toast({html: "[" + msg + "] " + Number(maxLength) + ' ' + "Can't over"});
			$(obj).focus();
			return false;
		}
	}
	
	
	return true;
};

au.getStrLength = function (str) {
	var len = 0;
	
	if (au.NVL(str) == '') {
		return 0;
	}
	else {
		for (var i = 0; i < str.length; i++) {
			var chr = str.charCodeAt(i);
			len = len + 1;
		}

		return len;
	}
};

au.getStrByteLength = function(str) {
	var byteLength = 0;

	for (var i = 0; i < str.length; i++) {
		var charCode = str.charCodeAt(i);

		if (charCode <= 0x7F) {
			byteLength += 1;
		} else if (charCode <= 0x7FF) {
			byteLength += 2;
		} else if (charCode <= 0xFFFF) {
			byteLength += 3;
		} else if (charCode <= 0x10FFFF) {
			byteLength += 4;
		}
	}

	return byteLength;
};

au.formLengthCheckTarget = function(){
	var text = $(this).val();
	var len = au.getStrLength( text );
	var title = $(this).attr("data-title").trim();
	if(title == '') title = $.APISMsg("TECH_COMM","의견");
	$("#"+$(this).attr("data-count")+" em:eq(0)").text(len);
	var maxLen = 0;
	if(!isNaN($(this).attr("maxbyte"))) {
		maxLen = $(this).attr("maxbyte");
	} else {
		maxLen = $("#"+$(this).attr("data-count")+" em:eq(1)").text().trim();
	}
	if(len > maxLen){
		alert( title+' '+maxLen+ ' ' + "Can't over");
		$(this).val(text.substr(0,maxLen)); 
		len = au.getStrLength($(this).val());
		$("#"+$(this).attr("data-count")+" em:eq(0)").text(len);
	}
};
au.formByteLengthCheckTarget = function(){
	var text = $(this).val();
	var len = au.getStrByteLength( text );
	var title = $(this).attr("data-title").trim();
	if(title == '') title = $.APISMsg("TECH_COMM","의견");
	$("#"+$(this).attr("data-count")+" em:eq(0)").text(len);
	var maxLen = 0;
	if(!isNaN($(this).attr("maxbyte"))) {
		maxLen = $(this).attr("maxbyte");
	} else {
		maxLen = $("#"+$(this).attr("data-count")+" em:eq(1)").text().trim();
	}
	if(len > maxLen){
		alert( title+' '+maxLen+ ' ' + "Can't over");
		$(this).val(text.substr(0,maxLen)); 
		len = au.getStrLength($(this).val());
		$("#"+$(this).attr("data-count")+" em:eq(0)").text(len);
	}
};
	
au.formLengthPrint = function (input){
	var $input = null;
	if(typeof(input) == "string"){
		$input = $(input);
	}else{
		$input = input;
	}
	var $printElement = au.getNearEmTagElement($input);
	au.printStrValLength($input, $printElement);
	
	$input.on("input", function(){
		var $printElement = au.getNearEmTagElement($input);
		au.printStrValLength($input, $printElement);
	});
};
au.formLengthPrintNew = function (input){
	var $input = null;
	if(typeof(input) == "string"){
		$input = $(input);
	}else{
		$input = input;
	}
	var $printElement = au.getNearEmTagElementNew($input);
	au.printStrValLength($input, $printElement);
	
	$input.on("input", function(){
		var $printElement = au.getNearEmTagElementNew($input);
		au.printStrValLength($input, $printElement);
	});
};
au.formByteLengthPrintNew = function (input){
	var $input = null;
	if(typeof(input) == "string"){
		$input = $(input);
	}else{
		$input = input;
	}
	var $printElement = au.getNearEmTagElementNew($input);
	au.printStrValByteLength($input, $printElement);
	
	$input.on("input", function(){
		var $printElement = au.getNearEmTagElementNew($input);
		au.printStrValByteLength($input, $printElement);
	});
};

au.getNearEmTagElement = function ($searchTarget){
	var em = null;
	var searchParent = $searchTarget.parent();
	for(var i = 0; i < 5; i++){
		if(searchParent.find("em").length > 0){
			em = searchParent.find("em")[0];
			break;
		}else{
			searchParent = searchParent.parent();
		}
	}
	return $(em);
}
	
au.getNearEmTagElementNew = function ($searchTarget){
	var em = null;
	var $newTarget = $searchTarget.parent().prev();
	if($newTarget.find(".count em").length > 0){
		return $newTarget.find("em").eq(0);
	} 
	return null;
};
// $inputElement의 글자수를 $printElement의 text로 출력
au.printStrValLength = function ($inputElement, $printElement){
	var text = $inputElement.val();
	var len = au.getStrLength( text );
	$printElement.text(len);
};
au.printStrValByteLength = function ($inputElement, $printElement){
	var text = $inputElement.val();
	var len = au.getStrByteLength( text );
	$printElement.text(len);
};
	
/**
 * name으로 찾은 form list에 대한
 * ui text, textarea length 를 가장 가까운 em 태그에 출력한다.
 * oninput event시 동일 기능 적용
 */
au.formLengthPrintByName = function (inputName, max){
	var arr = $(inputName);
	for(var i = 0 ; i < arr.length ; i++){
		var $input = $(arr[i]);
		au.formLengthPrint($input);
		
		$input.on("input", null);		// 초기화
		$input.on("input", function(event){
			au.formLengthPrint($input);
		});
	}
};

// NVL for string type
au.NVL = function(obj, replace){	
	obj = $.trim(obj);
	
	if(replace == null || replace == undefined) replace = '';
	var ret = obj;
	if(typeof obj == "undefined" ) ret = replace;
	else if(!obj || "null" == obj || "undefined" == obj || "NULL" == obj || "NaN" == obj) ret = replace;
	else if(null == obj || undefined == obj || NaN == obj) ret = replace;
	else if(obj.length == 0 ) ret = replace;

	return ret;
};
// NVL for number type
au.NVL2 = function(obj, replace){	
	var ret = au.NVL(obj, replace);
	ret = parseFloat(ret);
	if(ret == null || ret == undefined || isNaN(ret)) {
		ret = 0;
	}
	return ret;
};

au.getTodayDate = function() {
	var year = au.getYear();
	var month = au.getMonth();
	var day = au.getDay();
	var ymd = year + "-" +month + "-" + day;

	return ymd;
};

au.getTodayDate2 = function() {
	var year = au.getYear();
	var month = au.getMonth();
	var day = au.getDay();
	var ymd = year + month + day;

	return ymd;
};

au.getYear = function() {
	var now = new Date();
	return now.getFullYear().toString();
};

au.getMonth = function() {
	var now = new Date();
	
	var month = now.getMonth() + 1; // 1월=0,12월=11이므로 1 더함
	if (("" + month).length == 1) { month = "0" + month; }
	
	return month.toString();
};

au.getDay = function() {
	var now = new Date();
	
	var day = now.getDate();
	if (("" + day).length == 1) { day = "0" + day; }
	
	return day.toString();
};

/*
 * example: alert(new Date().after(1, 1, 1, 1, 1, 1).format("YYYYMMDD HHmmss"));
 */
Date.prototype.after = function(years, months, dates, hours, miniutes, seconds, mss) {
	if (years == null || years == "")	years = 0;
	else years = Number(years);

	if (months == null || months == "")   months = 0;
	else months = Number(months);

	if (dates == null || dates == "")	dates	= 0;
	else dates = Number(dates);
		
	if (hours == null || hours == "")	hours	= 0;
	else hours = Number(hours);

	if (miniutes == null || miniutes == "") miniutes = 0;
	else miniutes = Number(miniutes);

	if (seconds == null || seconds == "")  seconds  = 0;
	else seconds = Number(seconds);

	if (mss == null || mss == "")	  mss	  = 0;
	else mss = Number(mss);

	return new Date(this.getFullYear() + years,
				 this.getMonth() + months,
				 this.getDate() + dates,
				 this.getHours() + hours,
				 this.getMinutes() + miniutes,
				 this.getSeconds() + seconds,
				 this.getMilliseconds() + mss
				);
}

/*
 * example: alert(new Date().before(1, 1, 1, 1, 1, 1).format("YYYYMMDD HHmmss"));
 */
Date.prototype.before = function(years, months, dates, hours, miniutes, seconds, mss) {
	if (years == null || years == "")	years	= 0;
	else years = Number(years);

	if (months == null || months == "")   months   = 0;
	else months = Number(months);

	if (dates == null || dates == "")	dates	= 0;
	else dates = Number(dates);
		
	if (hours == null || hours == "")	hours	= 0;
	else hours = Number(hours);

	if (miniutes == null || miniutes == "") miniutes = 0;
	else miniutes = Number(miniutes);

	if (seconds == null || seconds == "")  seconds  = 0;
	else seconds = Number(seconds);

	if (mss == null || mss == "")	  mss	  = 0;
	else mss = Number(mss);

 	return new Date(this.getFullYear() - years,
				 this.getMonth() - months,
				 this.getDate() - dates,
				 this.getHours() - hours,
				 this.getMinutes() - miniutes,
				 this.getSeconds() - seconds,
				 this.getMilliseconds() - mss
				);
}

/*
 *	   YYYY : hour in am/pm (1~12)
 *	   MM   : month in year(number)
 *	   MON  : month in year(text)  ex) "January"
 *	   mon  : short month in year(text)  ex) "Jan"
 *	   DD   : day in month
 *	   DAY  : day in week  ex) "Sunday"
 *	   day  : short day in week  ex) "Sun"
 *	   hh   : hour in am/pm (1~12)
 *	   HH   : hour in day (0~23)
 *	   mm   : minute in hour
 *	   ss   : second in minute
 *	   SS   : millisecond in second
 *	   a	: am/pm  ex) "AM"
 */
Date.prototype.format = function(pattern) {
	var year	  	= this.getFullYear();
	var month	 	= this.getMonth() + 1;
	var day	   		= this.getDate();
	var dayInWeek	= this.getDay();
	var hour24		= this.getHours();
	var ampm 		= (hour24 < 12) ? "AM" : "PM";
	var hour12		= (hour24 > 12) ? (hour24 - 12) : hour24;
	var min	   		= this.getMinutes();
	var sec	   		= this.getSeconds();
	var YYYY 		= "" + year;
	var YY   		= YYYY.substr(2);
	var MM   		= (("" + month).length == 1) ? "0" + month : "" + month;
	var MON  		= GLB_MONTH_IN_YEAR[month-1];
	var mon  		= GLB_SHORT_MONTH_IN_YEAR[month-1];
	var DD   		= (("" + day).length == 1) ? "0" + day : "" + day;
	var DAY  		= GLB_DAY_IN_WEEK[dayInWeek];
	var day 		= GLB_SHORT_DAY_IN_WEEK[dayInWeek];
	var HH   		= (("" + hour24).length == 1) ? "0" + hour24 : "" + hour24;
	var hh   		= (("" + hour12).length == 1) ? "0" + hour12 : "" + hour12;
	var mm   		= (("" + min).length == 1) ? "0" + min : "" + min;
	var ss   		= (("" + sec).length == 1) ? "0" + sec : "" + sec;
	var SS   		= "" + this.getMilliseconds();
	var dateStr;
	var index = -1;
	if (typeof(pattern) == "undefined") {
		dateStr = "YYYYMMDD";
	} else {
		dateStr = pattern;
	}
	dateStr = dateStr.replace(/YYYY/g, YYYY);
	dateStr = dateStr.replace(/YY/g,   YY);
	dateStr = dateStr.replace(/MM/g,   MM);
	dateStr = dateStr.replace(/MON/g,  MON);
	dateStr = dateStr.replace(/mon/g,  mon);
	dateStr = dateStr.replace(/DD/g,   DD);
	dateStr = dateStr.replace(/DAY/g,  DAY);
	dateStr = dateStr.replace(/day/g,  day);
	dateStr = dateStr.replace(/hh/g,   hh);
	dateStr = dateStr.replace(/HH/g,   HH);
	dateStr = dateStr.replace(/mm/g,   mm);
	dateStr = dateStr.replace(/ss/g,   ss);
	dateStr = dateStr.replace(/(\s+)a/g, "$1" + ampm);
	
	return dateStr;
}

$.fn.rowspan = function(colIdx, isStats) {
	var addCnt;
	if(isStats == null){
		addCnt = 0;
	}else{
		addCnt = isStats*1;
	}
	return this.each(function(){		
		var that;
		$(this).children('tr:visible').each(function(row) {		
			$(this).children('tr > td, tr > th').eq(colIdx).filter(':visible').each(function(col) {  				  
				if ($(this).html() == $(that).html()  
					&& ($(this).prev().html() == $(that).prev().html())
				) {
					rowspan = $(that).attr("rowspan") || 1;  
					rowspan = Number(rowspan)+1-addCnt;  

					$(that).attr("rowspan",rowspan);  
					  
					// do your action for the colspan cell here			  
					$(this).hide();  
					  
					//$(this).remove();
					// do your action for the old cell here  
					  
				} else {			  
					that = this;
				}			
				  
				// set the that if not already set  
				that = (that == null) ? this : that;		
			});
		});	  
	});	
};
// 좌측 열과 독립적임
$.fn.rowspan2 = function(colIdx, isStats) {
	var addCnt;
	if(isStats == null){
		addCnt = 0;
	}else{
		addCnt = isStats*1;
	}
	return this.each(function(){		
		var that;
		$(this).children('tr:visible').each(function(row) {		
			$(this).children('tr > td, tr > th').eq(colIdx).filter(':visible').each(function(col) {  				  
				if ($(this).html() == $(that).html()) {
					rowspan = $(that).attr("rowspan") || 1;  
					rowspan = Number(rowspan)+1-addCnt;  

					$(that).attr("rowspan",rowspan);  
					  
					// do your action for the colspan cell here			  
					$(this).hide();  
					  
					//$(this).remove();
					// do your action for the old cell here  
					  
				} else {			  
					that = this;
				}			
				  
				// set the that if not already set  
				that = (that == null) ? this : that;		
			});
		});	  
	});	
};  
$.fn.unrowspan = function(colIdx) {
	return this.each(function() {
		$(this).children('tr').each(function() {
			var rowspanCell = $(this).children('td, th').eq(colIdx);
			if (rowspanCell.attr('rowspan')) {
				// 기존 rowspan 제거
				var rowspanCount = Number(rowspanCell.attr('rowspan'));
				rowspanCell.removeAttr('rowspan');

				// 숨겨진 행 다시 표시
				var nextRow = $(this).next();
				for (var i = 1; i < rowspanCount; i++) {
					var targetCell = nextRow.children('td, th').eq(colIdx);
					targetCell.show(); // 숨겨진 셀 다시 보이기
					nextRow = nextRow.next(); // 다음 행으로 이동
				}
			}
		});
	});
};
$.fn.colspan = function(rowIdx, isStats) {
	var addCnt;
	if (isStats == null) {
		addCnt = 0;
	} else {
		addCnt = isStats * 1;
	}
	return this.each(function() {
		var that;
		var colspan = 1; // 초기 colspan 값 설정
		$(this).children('tr:visible').eq(rowIdx).children('td, th').filter(':visible').each(function(col) {
			// 동일한 셀 내용 비교하여 병합
			if ($(this).html() == $(that).html()  
					&& ($(this).closest('tr').prev().children('td, th').eq($(this).index()).html() 
					== $(that).closest('tr').prev().children('td, th').eq($(that).index()).html())
				) {
				colspan = $(that).attr("colspan") || 1;
				colspan = Number(colspan) + 1 - addCnt;

				$(that).attr("colspan", colspan);
				$(this).hide();
			} else {
				that = this;
			}
			that = (that == null) ? this : that;
		});
	});
};
$.fn.colspan2 = function(rowIdx, isStats) {
	var addCnt;
	if (isStats == null) {
		addCnt = 0;
	} else {
		addCnt = isStats * 1;
	}
	return this.each(function() {
		var that;
		var colspan = 1; // 초기 colspan 값 설정
		$(this).children('tr:visible').eq(rowIdx).children('td, th').filter(':visible').each(function(col) {
			// 동일한 셀 내용 비교하여 병합
			if ($(this).html() == $(that).html()) {
				colspan = $(that).attr("colspan") || 1;
				colspan = Number(colspan) + 1 - addCnt;

				$(that).attr("colspan", colspan);
				$(this).hide();
			} else {
				that = this;
			}
			that = (that == null) ? this : that;
		});
	});
};

$.fn.selectRange = function(start, end) {
	if(end === undefined) {
		end = start;
	}
	return this.each(function() {
		if('selectionStart' in this) {
			this.selectionStart = start;
			this.selectionEnd = end;
		} else if(this.setSelectionRange) {
			this.setSelectionRange(start, end);
		} else if(this.createTextRange) {
			var range = this.createTextRange();
			range.collapse(true);
			range.moveEnd('character', end);
			range.moveStart('character', start);
			range.select();
		}
	});
};

au.fn_addYear = function(sDate, nYear){
	var yy = Number(sDate.substr(0, 4));
	var mm = Number(sDate.substr(5, 2));
	var dd = Number(sDate.substr(8));
 
	d = new Date(yy + nYear, mm - 1, dd);
 
	yy = d.getFullYear();
	mm = d.getMonth() + 1; mm = (mm < 10) ? '0' + mm : mm;
	dd = d.getDate(); dd = (dd < 10) ? '0' + dd : dd;
	
	return yy + "-" + mm + "-" + dd;
}

au.fn_addMonth = function(fDate, fNum){
	var yyyy,mm;
	var arr = fDate.split('-');
	var dt = new Date(arr[0], arr[1], '01');

	dt.setMonth(dt.getMonth()-1 + fNum*1);
	yyyy = dt.getFullYear();
	mm = dt.getMonth()+1;
	mm = (mm < 10) ? '0' + mm : mm;
	
	return yyyy + "-" + mm;
}


au.fn_addDays = function(sDate, nDays){
	var yy = Number(sDate.substr(0, 4));
	var mm = Number(sDate.substr(5, 2));
	var dd = Number(sDate.substr(8));
 
	d = new Date(yy, mm - 1, dd + nDays);
 
	yy = d.getFullYear();
	mm = d.getMonth() + 1; mm = (mm < 10) ? '0' + mm : mm;
	dd = d.getDate(); dd = (dd < 10) ? '0' + dd : dd;
	
	
	return yy + "-" + mm + "-" + dd;
}

au.fn_calcDate = function(_date1, _date2){
	var diffDate_1 = _date1 instanceof Date ? _date1 : new Date(_date1);
	var diffDate_2 = _date2 instanceof Date ? _date2 : new Date(_date2);
 
	diffDate_1 = new Date(diffDate_1.getFullYear(), diffDate_1.getMonth()+1, diffDate_1.getDate());
	diffDate_2 = new Date(diffDate_2.getFullYear(), diffDate_2.getMonth()+1, diffDate_2.getDate());
 
	var diff = Math.abs(diffDate_2.getTime() - diffDate_1.getTime());
	diff = Math.ceil(diff / (1000 * 3600 * 24));
 
	return diff;
}

au.addComma = function(value, emptyStr = "0"){
	value = $.trim(value);
	if(value == null || value == undefined || value == "null" || value == "undefined" || value == "" || value == "NaN" || isNaN(value) || value == "0") return emptyStr;
	var retArr = value.toString().split(".");
	retArr[0] = retArr[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return retArr.join(".");
}

au.xssReplace = function(str){
	if(str) {
		while(str.indexOf("&amp;") >= 0) {
			str = str.replaceAll("&amp;", "&");
		}
		str = str.replaceAll("&le;", "≤");
		str = str.replaceAll("&ge;", "≥");
		str = str.replaceAll("&lt;", "<");
		str = str.replaceAll("&gt;", ">");
		str = str.replaceAll("&plusmn;", "±");
		str = str.replaceAll("&middot;", "·");
		str = str.replaceAll("&Delta;", "Δ");
		str = str.replaceAll("&ordm;", "º");
		str = str.replaceAll("&times;", "×");
		str = str.replaceAll("&darr;", "↓");
		str = str.replaceAll("&uarr;", "↑");
		str = str.replaceAll("&rarr;", "→");
		str = str.replaceAll("&larr;", "←");
		str = str.replaceAll("&Omega;", "Ω");
		str = str.replaceAll("&quot;", '"');
	} else {
		str = "";
	}
	return str;
}

au.escapeHtml = function(str){
	if(str) {
		str = str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	} else {
		str = "";
	}
	return str;
}

/*
 * ex>	fnSetDatepicker() 							==> $(".datepicker").datepicker(); 				포맷은 yyyy-mm-dd
 * 		fnSetDatepicker("#cardcont1") 				==> $("#cardcont1 .datepicker").datepicker(); 	포맷은 yyyy-mm-dd
 * 		fnSetDatepicker("#cardcont1", "yyyy.mm.dd")	==> $("#cardcont1 .datepicker").datepicker(); 	포맷은 yyyy.mm.dd
 */  
au.fnSetDatepicker = function(parentEl, dateFormat) {	
	var targetEl = (au.NVL(parentEl) == "" ? ".datepicker" : parentEl+" .datepicker");
	var format = dateFormat || "yyyy-mm-dd";
	
	var DAY_NAMES = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
	$(targetEl).datepicker({ 
		format: format,
		autoClose: true, 
		showOtherMonths: true,
		changeYear: true,
		changeMonth: true,
		i18n: {
			months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			monthsShort: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
			weekdays: DAY_NAMES,
			weekdaysShort: DAY_NAMES,
			weekdaysAbbrev: DAY_NAMES,
			cancel: '',
			done: ''
		}
	});
}

au.fnSetLoading = function(type, cnt = 1) {
	type = typeof type == "string" ? type.toLowerCase() : type; 
	var $loading = $(".loading_spin");
	if(type === "on" || type === true || type === "y") {
		globalCnt.loading += cnt;
		//$loading.stop().fadeIn(function() {$(this).css("opacity", "1");});
		$loading.stop().show();
	} else if(type === "off" || type === false || type === "n") {
		globalCnt.loading -= cnt;
		if(globalCnt.loading === 0) {
			$loading.stop().fadeOut(100);
		} else if(globalCnt.loading < 0) {
			globalCnt.loading = 0;
			$loading.stop().fadeOut(100);
		}
	} else if(type === "reset" || type === "init") {
		globalCnt.loading = 0;
		$loading.stop().fadeOut(100);
	}
}
au.fnSetAjax = function(type, cnt = 1) {
	type = typeof type == "string" ? type.toLowerCase() : type; 
	if(type === "on" || type === true || type === "y") {
		globalCnt.ajax += cnt;
	} else if(type === "off" || type === false || type === "n") {
		globalCnt.ajax -= cnt;
	} else if(type === "reset" || type === "init") {
		globalCnt.ajax = 0;
	}
}
au.fnSetLoadingPartial = function(target, type, cnt = 1) {
	type = typeof type == "string" ? type.toLowerCase() : type; 
	let $loading = null;
	if(type === "on" || type === true || type === "y") {
		globalCnt[target] ??= 0;
		globalCnt[target] += cnt;
		$loading = $(target).siblings(".loading_spin2");
		if($loading.length == 0) {
			$loading = $(".loading_spin2").eq(0).clone();
		}
		if($loading.length) {
			$(target).before($loading);
			$loading.find(".box").css("border-radius", $loading.next().css("border-radius"));
			//$loading.stop().fadeIn(function() {$(this).css("opacity", "1");});
			$loading.stop().show();
		}
	} else if(type === "off" || type === false || type === "n") {
		globalCnt[target] -= cnt;
		$loading = $(target).siblings(".loading_spin2");
		if($loading.length) {
			if(globalCnt[target] === 0) {
				$loading.stop().fadeOut(100);
				delete globalCnt[target];
			} else if(globalCnt.loading < 0) {
				globalCnt[target] = 0;
				$loading.stop().fadeOut(100);
				delete globalCnt[target];
			}
		}
	}
}

au.consoleStack = function() {
	try {
		throw new Error('apis_util.js > consoleStack()');
	} catch (e) {
		console.log(e.stack);
	}
}

au.zeroConv = function(val, replace) { 
	if(isNaN(parseFloat(val))) {
		return val;
	} else if(parseFloat(val) == 0) {
		return au.NVL(replace);
	} else {
		return val;
	}
}

au.tableToExcel = function(obj, fileNm) {
	try {
		if(!obj.tagName) {
			if(obj instanceof jQuery) {
				obj = obj[0];
			} else {
				console.error("The tableToExcel parameter is not a DOM object. Please check the parameter.");
				return;
			}
		}
		if(obj.tagName.toUpperCase() != "TABLE") {
			console.error("The tableToExcel parameter's tag name is "+obj.tagName.toUpperCase()+". It must be a TABLE.");
			return;
		}
		
		$(obj).find("[no_export]").remove();
		
		var $text = $(obj).find("textarea, input");
		var $image = $(obj).find("img");
		var $select = $(obj).find("select");
		var $url = $(obj).find("[href]");
		
		$.each($text, function(idx, o) {
			var text = $(o).val().replace(/\n/g,"<br>");
			$(o).replaceWith(text);
		});
		
		$.each($select, function(idx, o) {
			var text = $(o).find("option:selected").text();
			$(o).replaceWith(text);
		});
		
		$.each($url, function(idx, o) {
			var url = $(o).attr("href");
			$(o).replaceWith(url);
		});
		
		$.each($image, function(idx, o) {
			$(o).replaceWith("Image");
		});
		
		fileNm = fileNm || "EXPORT";
		fileNm += "_" + new Date().format("YYYYMMDD_HHmmss");
		fileNm += ".xlsx";		
		
		var workbook = XLSX.utils.table_to_book(obj, {sheet: "Sheet1"});
		var wbout = XLSX.write(workbook, {bookType: "xlsx", type: "binary"});
		function s2ab(s) {
			var buf = new ArrayBuffer(s.length);
			var view = new Uint8Array(buf);
			for(var i = 0 ; i < s.length ; i++) {
				view[i] = s.charCodeAt(i) & 0xFF;
			}
			return buf;
		}
		
		var blob = new Blob([s2ab(wbout)], {type: "application/octet-stream"});
		
		var url = URL.createObjectURL(blob);
		var a = document.createElement("a");
		a.href = url;
		a.download = fileNm;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	} catch(e) {
		console.error("Excel 다운로드에 실패했습니다. /js/xlsx.full.min.js 스크립트가 필요합니다.\r\n"+e); 
	}
}

// 테이블 내에서 INPUT, SELECT 이 있을때 ENTER키 입력시 다음 행으로 이동하도록 이벤트 적용
// 단, 이 기능을 적용하려면 적용하고자 하는 tr에 enter_tr 속성이 등록되어 있어야 함
// enter_tr 속성이 없는 tr은 무시하고 다음 행으로 넘어감
// ex> <tr enter_tr><td><input type="text"></td></tr>
au.setEnterMoveInTableEvent = function(e, maxSkip = 10) {
	if(e.which == "13" && !e.shiftKey) { // ENTER키 이벤트
		e.preventDefault();
		var cnt = 0;
		var $input = $(this);
		var $cell = $input.closest("td");
		var colIndex = $cell.prevAll("td").length;
		var $row = $cell.closest("tr");
		var $tbody = $cell.closest("tbody");
		var $table = $tbody.closest("table");
		var $nextRow = $row.next("tr").length ? $row.next("tr") : $tbody.find("tr").first();
		while($nextRow.attr("enter_tr") == undefined) {
			$nextRow = $nextRow.next("tr").length ? $nextRow.next("tr") : $tbody.find("tr").first();
			if(++cnt > maxSkip) return;
		}
		var $nextCell = $nextRow.find("td").eq(colIndex);
		var $nextInput = $nextCell.find("input[type='text'], select");
		
		if($nextInput.is("input")) {
			$nextInput.focus().select();
		} else if($nextInput.is("select")) {
			$nextInput.focus();
		}
	} else if(e.which == "13" && e.shiftKey) { // Shift+ENTER키 이벤트
		e.preventDefault();
		var cnt = 0;
		var $input = $(this);
		var $cell = $input.closest("td");
		var colIndex = $cell.prevAll("td").length;
		var $row = $cell.closest("tr");
		var $tbody = $cell.closest("tbody");
		var $table = $tbody.closest("table");
		var $prevRow = $row.prev("tr").length ? $row.prev("tr") : $tbody.find("tr").last();
		while($prevRow.attr("enter_tr") == undefined) {
			$prevRow = $prevRow.prev("tr").length ? $prevRow.next("tr") : $tbody.find("tr").last();
			if(++cnt > maxSkip) return;
		}
		var $prevCell = $prevRow.find("td").eq(colIndex);
		var $prevInput = $prevCell.find("input[type='text'], select");
		
		if($prevInput.is("input")) {
			$prevInput.focus().select();
		} else if($prevInput.is("select")) {
			$prevInput.focus();
		}
	}
}

// 디바운싱 - 이벤트가 너무 자주 호출되는 것을 방지하는 방법
// 내부적으로 타이머를 실행해 일정시간(delay)이 지난 후에 실행
au.debounce = function(func, delay=200) {
	let timer;
	return function() {
		const args = arguments;
		clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(this, args);
		}, delay);
	}
}

au.fnPageReload = function(time = 100, cnt = 100) {
	if(typeof isPageCloseCalled !== "undefined" && isPageCloseCalled === true) {
		return false;
	}	
	if (($.active == 0 && globalCnt.ajax == 0 && globalCnt.loading == 0) || cnt == 0) {
		location.reload();
	} else {
		setTimeout(function(){au.fnPageReload(time, --cnt);},time);
	}
}

au.fnPageClose = function(time = 100, cnt = 100) {	
	if (($.active == 0 && globalCnt.ajax == 0 && globalCnt.loading == 0) || cnt == 0) {
		au.fnSetLoading("off");
		window.close();
	} else {
		setTimeout(function(){au.fnPageClose(time, --cnt);},time);
	}
}

// 숫자를 영문 서수표기(1st, 2nd, 3rd, 4th 등) 변환
au.fnAddOrdinalSuffix = function(val) {
	const num = parseInt(val);
	
	if (isNaN(num)) {
		throw new Error("Parameter should be number");
	}

	const suffixes = ["th", "st", "nd", "rd"];
	const value = Math.abs(num) % 100;
	const lastDigit = value % 10;

	// 11~13은 항상 "th"로 처리
	if (value >= 11 && value <= 13) {
		return `${num}th`;
	}

	return `${num}${suffixes[lastDigit]||"th"}`;
}

au.fnGetPagingParam = function(param, pageNo, pageSize) {
	pageSize = pageSize || 30;
	$.extend(param,{
		PAGE_SIZE: pageSize,
		PAGE_NO: pageNo
	});
	$.extend(param,{
		FIRST_INDEX: pageSize * (pageNo - 1) + 1,
		LAST_INDEX: pageSize * pageNo
	});	
	
	return param;
}

au.fnGetFileList = function(fileId, callbackSuccess, async, callbackError){
	if(au.NVL(async) == "") {
		async = true;
	}
	if(!fileId){
		alert("Must need file ID");
		return;
	}
	if(!callbackSuccess){
		alert("Must need callbackSuccess Function");
		return;
	}

	let data = new FormData();
	data.append('id', fileId);
	
	$.ajax({
		url: "/api/file/getFileListAjax",
		type: "POST",
		data: data,
		processData: false,
		contentType: false,
		async: async,
		success: function(response) {
			if(!response) return ;
			callbackSuccess(response);
			if($('input:file').length > 0){
				$('input:file').parent().find(".MultiFile-wrap").MultiFile('reset');
			}
		},
		error: function(){
			if(callbackError) {
				callbackError();
			}
			alert("Error Occurred");
		}
	});
}

au.MultiFileUpload = function(target, list, maxCnt = 10, afaCb, afrCb) {
	$(target).attr("multiple", "multiple");
	$(target).MultiFile({
		max: maxCnt,
		//accept: '', // allowed ext
		maxfile: 20 * 1024,
		maxsize: 30 * 1024,
		STRING: {
			remove: '<i class="material-icons tiny mr5 btn_removeFile">close</i>',
			duplicate: "[$file] is a duplicated file.", 
			denied: "[$ext] files are not allowed.",
			selected: "[$file] is selected.", 
			toomuch: "Upload limit exceeded. ($size)", 
			toomany: "You can upload a maximum of $max file(s).",
			toobig: "Upload limit exceeded. ($size)"
		},
		list: list,
		afterFileAppend: afaCb,
		afterFileRemove: afrCb
	});
}

au.fnUploadAttachFile = function(fileWrapper, param, callbackSuccess){
	au.fnSetLoading("on");
	
	let fileCount = 0;
	let data = new FormData();
	data.append('action','uploadImages');
	data.append("file_id", au.NVL(param?.file_id));
	data.append("ref_table", au.NVL(param?.ref_table));
	data.append("ref_column", au.NVL(param?.ref_column));
		
	$.each($(fileWrapper).find("input[type=file]"), function(i, obj) {
		$.each(obj.files, function(j, file) { 
			fileCount++;
			data.append('attachFile', file);
		});
	});

	if(fileCount < 1) {
		Swal.fire('ERROR', _msg["cm_nofilesave"] || 'There is no file to save', 'error');
		callbackSuccess();
		au.fnSetLoading("off");
		return false;
	}

	$.ajax({
		url: "/api/file/uploadAttachFileAjax",
		type: "POST",
		data: data,
		processData: false,
		contentType: false,
		complete: function()  {
			$(fileWrapper).MultiFile('reset');
			au.fnSetLoading("off");
		},
		success: callbackSuccess, 
		error: function(response) {
			alert("Error Occurred");
		}
	});
}

au.fnUploadEditorFile = function(files, editorEl, param) {
	const $this = $(editorEl);
	let data = new FormData();
	data.append('action','uploadImages');
	data.append("ref_table", au.NVL(param?.ref_table));
	data.append("ref_column", au.NVL(param?.ref_column));
	data.append("upload_type", au.NVL(param?.upload_type));
	
	$.each(files, function(j, file) { 
		data.append('file', file);
	});
					
	$.ajax({
		url: "/api/file/uploadEditorFileAjax",
		type: "POST",
		data: data,
		processData: false,
		contentType: false,
		success: function(fileUrls) {
			const urlArr = decodeURIComponent(fileUrls).split("::");
			$.each(urlArr, function(idx, url) {
				if(url != "") {
					$this.summernote('insertImage', url);
				}
			});
		},
		error: function(response) {
			alert("Error Occurred");
		}
	});
}

au.fnDeleteFile = function(fileId, fileSeq, callbackSuccess){
	const data = {
		"fileId": fileId, 
		"fileSeq": fileSeq
	};
	$.ajax({
		url: "/api/file/deleteFileAjax",
		type: "POST",
		dataType: 'json',
		data: data,
		success: callbackSuccess, 
		error: function(response) {
			alert("Error Occurred");
		}
	});
}

au.fnSetNotification = function(param, callback) {
	callback = callback || function(){};
	if(!param.SOURCE_TYPE){
		alert("SOURCE_TYPE is needed.");
		return;
	}
	if(!param.CARD_CD){
		alert("CARD_CD is needed.");
		return;
	}
	if(!param.SOURCE_CD){
		alert("SOURCE_CD is needed.");
		return;
	}
	if(!param.SEND_CD){
		alert("SEND_CD is needed.");
		return;
	}
	au.ajaxPost('/insertPushNofificationAjax', param, function(response){
		localStorage.setItem("APPR_REFRESH",new Date().getTime());
		callback(response);
	});
}
au.fnFinishYnNotification = function(param, callback) {
	callback = callback || function(){};
	if(!param.SOURCE_TYPE){
		alert("SOURCE_TYPE is needed.");
		return;
	}
	if(!param.CARD_CD){
		alert("CARD_CD is needed.");
		return;
	}
	if(!param.SOURCE_CD){
		alert("SOURCE_CD is needed.");
		return;
	}
	if(!param.FINISH_YN){
		alert("FINISH_YN is needed.");
		return;
	}
	au.ajaxPost('/updateFinishNotificationAjax', param, function(response){
		localStorage.setItem("APPR_REFRESH",new Date().getTime());
		callback(response);
	});
}

au.defaultPhoto = function(obj) {
	setTimeout(() => {
		const defaultPhoto = $('<i class="material-icons gardenia25 mocha25-text fLine vCenter hCenter mg0">person</i>');
		$(obj).replaceWith(defaultPhoto);
	}, 0);
};

au.fnEventMenuItemScroll = function() {
	$('.popup .menu-item').on('click', function() {
		const targetId = $(this).data('target');
		const targetElement = $('#' + targetId);

		if (targetElement.length) {
			$('html, body').animate({
				scrollTop: targetElement.offset().top - 65
			}, 500);
		}

		$('.menu-item').removeClass('active');
		$(this).addClass('active');
	});
	
	$(window).on('scroll', function() {
		const scrollPosition = $(window).scrollTop() + 70;

		$('.cardBox[id]').each(function() {
			const sectionTop = $(this).offset().top;
			const sectionBottom = sectionTop + $(this).outerHeight();
			const sectionId = $(this).attr('id');

			if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
				$('.menu-item').removeClass('active');
				$('.menu-item[data-target="' + sectionId + '"]').addClass('active');
			}
		});
	});
};

au.errorAlert = function(e) {
	if(e.responseJSON){
		Swal.fire('ERROR', e.responseJSON.message, 'error');
	}
};

// ex> au._msgFormat("cm_welcome", {"name": "Tester", "time": "Morning"});
//		"Welcome, {name}. Good {time}." -> "Welcome, Tester. Good Morning."
au._msgFormat = function(key, params = {}) {
	if(_msg) {
		let template = _msg[key];
		if(!template) return key;
		
		return template.replace(/\{(\w+)\}/g, (match, p1) => {
			return params[p1] != undefined ? params[p1] : match;
		});
	}
	return "";
};

au.removeZeros = function(str) {
	return str.replace(/^0+/, '') || '';
};

// au.setTableFilter("#tbl_quality");
au.setTableFilter = function(tableSelector) {
	if($(tableSelector).find(".jpFilter").length == 0) {
		$(tableSelector).find("thead > tr > th").each(function(idx, o) {
			$(o).attr("data-colidx", idx);
			let html = '';
			html += '<div class="jpFilter" data-table="'+tableSelector+'">';
			html += '<i class="material-symbols-outlined filterIcon" style="display: none;" onclick="au._toggleJpFilterLayer(\''+tableSelector+'\', this, '+idx+');">filter_alt</i>';
			html += '</div>';
			$(o).append(html);
		});	
		
		html = '';
		html += '<div class="jpFilter-layer white" style="display: none;" data-table="'+tableSelector+'">';
		html += '<div class="ac fontM font15 gardenia25 pd5">'+(_msg['cm_filtersort']||'Filtering & Sorting')+'</div>'
		html += '<div class="row btn_jpSort mt10" data-jpsort="asc" onclick="au._jpSortColumn(\''+tableSelector+'\', this, \'asc\');au._toggleJpFilterLayer(\''+tableSelector+'\');">';
		html += '<div class="col s12 fLine vCenter"><i class="material-icons mr5">arrow_upward</i>'+(_msg['cm_sortasc']||'Ascending Sort')+'</div>';
		html += '</div>';
		html += '<div class="row btn_jpSort" data-jpsort="desc" onclick="au._jpSortColumn(\''+tableSelector+'\', this, \'desc\');au._toggleJpFilterLayer(\''+tableSelector+'\');">';
		html += '<div class="col s12 fLine vCenter"><i class="material-icons mr5">arrow_downward</i>'+(_msg['cm_sortdesc']||'Descending Sort')+'</div>';
		html += '</div>';
		html += '<div class="row mt20">';
		html += '<div class="col s12 fLine vCenter">';
		html += '<i class="material-symbols-outlined mr5">filter_alt</i>';
		html += '<input type="text" placeholder="'+(_msg['cm_searchkeyword']||'Search keyword')+'" class="browser-default wd100p" data-table="'+tableSelector+'">';
		html += '</div>';
		html += '</div>';
		html += '<div class="fLine hFlexEnd mt5 mr10 mb10" style="gap: 5px;">';
		html += '<div>';
		html += '<a class="waves-effect waves-light hBtn hSmall btn_jpFilterApply" onclick="au._jpFilterColumn(\''+tableSelector+'\', this);au._toggleJpFilterLayer(\''+tableSelector+'\');"><span class="label">'+(_msg["cm_apply"] || "Apply")+'</span></a>'
		html += '</div>';
		html += '<div>';
		html += '<a class="waves-effect waves-light hBtn hGrey hSmall" onclick="au._toggleJpFilterLayer(\''+tableSelector+'\');"><span class="label">'+(_msg["cm_cancel"] || "Cancel")+'</span></a>'
		html += '</div>';
		html += '</div>';
		$("body").append(html);
		
		setTimeout(() => {		
			$(tableSelector).find("tbody > tr").each(function(idx, tr) {
				$(tr).attr("data-tridx", idx);
				$(tr).find("td").each(function(idx2, td) {
					$(td).attr("data-colidx", idx2);
				});
			});
			
			$(tableSelector+" thead > tr > th").off("mouseenter").on("mouseenter", function(e) {
				$(this).find(".jpFilter .filterIcon").css("display", "inline-block");
			});
			$(tableSelector+" thead > tr > th").off("mouseleave").on("mouseleave", function(e) {
				$(this).find(".jpFilter .filterIcon:not(.viva-text)").hide();
			});
			
			$(".jpFilter").off("mousedown").on("mousedown", function (e) {
				e.stopPropagation();
			});
			$(".jpFilter-layer").off("mousedown").on("mousedown", function (e) {
				e.stopPropagation();
			});
			$(".jpFilter-layer input").off("keyup").on("keyup", function(e) {
				if(e.key == "Enter") {
					const $layer = $(this).closest(".jpFilter-layer");
					$layer.find(".btn_jpFilterApply").trigger("click");
				}
			});
			$(document).off("mousedown."+tableSelector).on("mousedown."+tableSelector, function () {
				$('.jpFilter-layer').hide();
			});
		},0);
	}
};
au._toggleJpFilterLayer = function(tableSelector, obj, colIdx) {
	const $table = $(tableSelector);
	const $layer = $(".jpFilter-layer[data-table='"+tableSelector+"']");
	const jpFilterAttr = $(obj).closest(".jpFilter").attr("data-jpfilter");
	const jpSortAttr = $(obj).closest(".jpFilter").attr("data-jpsort");
	
	$(".jpFilter-layer:not([data-table='"+tableSelector+"'])").hide();
	
	$layer.attr("data-colidx", colIdx);
	
	if(obj) {
		const layerWidth = $layer.outerWidth();
		const layerHeight = $layer.outerHeight();
		const bodyWidth = $("body").width();
		const bodyHeight = $("body").height();
		let newLeft = $(obj).offset().left;
		let newTop = $(obj).offset().top + 15;		
		if(newLeft + layerWidth > bodyWidth) {
			newLeft = bodyWidth - layerWidth - 10;
		}
		if(newTop + layerHeight > bodyHeight) {
			newTop = bodyHeight - layerHeight - 10;
		}

		if($layer.css("top") == newTop.toFixed(2)+"px" && $layer.css("left") == newLeft.toFixed(2)+"px") {
			if($layer.css("display") == "none") {
				$layer.find(".btn_jpSort").removeClass("on");
				$layer.find(".btn_jpSort[data-jpsort='"+jpSortAttr+"']").addClass("on");
				$layer.show();
				$layer.find("input").val(jpFilterAttr).focus();
			} else {
				$layer.hide();
			}
		} else {
			$layer.find(".btn_jpSort").removeClass("on");
			$layer.find(".btn_jpSort[data-jpsort='"+jpSortAttr+"']").addClass("on");
			$layer.css({
				"top": newTop.toFixed(2)+"px",
				"left": newLeft.toFixed(2)+"px",
				"position": "absolute"
			});
			$layer.show();
			$layer.find("input").val(jpFilterAttr).focus();
		}
	} else {
		$layer.toggle();
		$layer.find("input").val(jpFilterAttr).focus();
	}
}
au._jpFilterColumn = function(tableSelector, obj) {
	const $rows = $(tableSelector).find("tbody > tr");
	const val = $(obj).closest(".jpFilter-layer").find("input[data-table='"+tableSelector+"']").val();
	const colIdx = $(obj).closest(".jpFilter-layer").attr("data-colidx");
	const $targetTh = $(tableSelector).find("th[data-colidx='"+colIdx+"'] .jpFilter");
	const $allTh = $(tableSelector).find("th .jpFilter");
	$allTh.attr("data-jpfilter", "");
	if($allTh.find(".filterIcon").length > 0) $allTh.find(".filterIcon").removeClass("viva-text fontBold").hide();
	$targetTh.attr("data-jpfilter", val);
	if(val != "") {
		$targetTh.find(".filterIcon").addClass("viva-text fontBold").css("display", "inline-block");
		$rows.each(function(idx, tr) {
			const cell = $(tr).find("td[data-colidx='"+colIdx+"']").text().toLowerCase();
			$(tr).css("display", cell.indexOf(val.toLowerCase()) >= 0 ? "" : "none");
		});
	} else {
		$targetTh.find(".filterIcon").removeClass("viva-text fontBold").hide();
		$rows.each(function(idx, tr) {
			$(tr).css("display", "");
		});
	}
};
au._jpSortColumn = function(tableSelector, obj, direction) {
	const $tbody = $(tableSelector).find("tbody");
	const $rows = $tbody.children("tr");
	const rows = $rows.toArray();
	const colIdx = $(obj).closest(".jpFilter-layer").attr("data-colidx");
	const $allTh = $(tableSelector).find("th .jpFilter");
	const $targetTh = $(tableSelector).find("th[data-colidx='"+colIdx+"'] .jpFilter");
	const befDirection = $targetTh.attr("data-jpsort");
	$allTh.attr("data-jpsort", "");
	if($allTh.find(".sortIcon").length > 0) $allTh.find(".sortIcon").remove();
	if(befDirection == direction) {
		direction = '';
		$(obj).removeClass("on");
		$targetTh.find(".sortIcon").removeClass("viva-text fontBold");
		if($targetTh.find(".sortIcon").length > 0) $targetTh.find(".sortIcon").remove();
	} else {
		$(obj).closest(".jpFilter-layer").find(".btn_jpSort").removeClass("on");
		$(obj).addClass("on");
		let sortIcon = 'arrow_downward';
		if(direction == 'asc') {
			sortIcon = 'arrow_upward';
		}
		const html = '<i class="material-icons viva-text fontBold sortIcon" onclick="au._toggleJpFilterLayer(\''+tableSelector+'\', this, '+colIdx+');">'+sortIcon+'</i>';
		if($targetTh.find(".sortIcon").length > 0) $targetTh.find(".sortIcon").remove();
		$targetTh.prepend(html);
	}
	rows.sort((a, b) => {		
		if(direction == '') {
			const aIdx = $(a).attr("data-tridx");
			const bIdx = $(b).attr("data-tridx");
			return aIdx - bIdx;
		} else {
			const aText = $(a).find("td[data-colidx='"+colIdx+"']").text();
			const bText = $(b).find("td[data-colidx='"+colIdx+"']").text();
			if(!isNaN(aText) && !isNaN(bText)) {
				return direction === 'asc'
					? Number(aText) - Number(bText)
					: Number(bText) - Number(aText);
			} else {
				return direction === 'asc'
					? aText.localeCompare(bText)
					: bText.localeCompare(aText);
			}
		}
	});
	rows.forEach(function(row) {
		$(row).appendTo($tbody);
	});
	$targetTh.attr("data-jpsort", direction);
};

// $(window).on("resize", au.hFixedTableResize);
au.hFixedTableResize = function() {
	const $tables = $(".hFixedTable table");
	
	$tables.each(function(idx, table) {
		if (!table) return;

		const columnWidths = [];
		let cumulativeWidth = 0;
		
		const allHeadTrs = table.querySelectorAll('thead tr');
		allHeadTrs.forEach(row => {
			const stickyHeaders = row.querySelectorAll('th.fix-col');
			
			stickyHeaders.forEach((th, index) => {
				if (index > 0) {
					cumulativeWidth += columnWidths[index - 1];
				}
	
				const currentWidth = th.offsetWidth;
				columnWidths.push(currentWidth);
	
				$(th).css("left", `${cumulativeWidth}px`);
			});
		});
		
		

		const allRows = table.querySelectorAll('tbody tr');
		allRows.forEach(row => {
			const stickyCells = row.querySelectorAll('td.fix-col');
			let currentLeft = 0;
	
			stickyCells.forEach((td, index) => {
				$(td).css("left", `${currentLeft}px`);
				currentLeft += columnWidths[index]; 
			});
		});
	});
}