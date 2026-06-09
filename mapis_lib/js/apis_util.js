/**
 * apis_util.js — MAPIS Core Utility Library
 * MAPIS 핵심 유틸리티 라이브러리
 *
 * Provides foundational utilities used across ALL pages:
 * 모든 페이지에서 사용되는 기본 유틸리티를 제공합니다:
 *
 * - AJAX wrappers        (au.ajaxGet, au.ajaxPost, au.ajaxGet2, au.ajaxPost2, etc.)
 *   AJAX 래퍼 함수들
 * - Form binding         (au.bindData, au.getParam)
 *   폼 데이터 바인딩
 * - Loading spinner      (au.fnSetLoading)
 *   로딩 스피너 제어
 * - Date formatting      (Date.prototype.format, au.dateSerialize, au.dateDeserialize)
 *   날짜 포맷팅
 * - Validation helpers   (au.formCheck, au.formCheckToast)
 *   유효성 검증 헬퍼
 * - Table utilities       ($.fn.rowspan, $.fn.colspan, au.setTableFilter)
 *   테이블 유틸리티
 * - File upload           (au.fnUploadAttachFile, au.MultiFileUpload)
 *   파일 업로드
 * - Input formatting      (au.setInputmask, au.addComma, au.xssReplace)
 *   입력 서식 처리
 *
 * @file apis_util.js
 * @global au - The main utility namespace / 메인 유틸리티 네임스페이스
 * @global globalCnt - Global counter for loading/ajax state / 로딩/AJAX 상태 전역 카운터
 */

/* ── Disabled Link Handler / 비활성 링크 핸들러 ── */
/**
 * Capturing mode handler to intercept clicks on disabled links.
 * 비활성화된 링크 클릭을 캡처 모드로 가로채는 핸들러.
 *
 * When an <a> element has the "is-disabled" class, it prevents all actions and displays a toast.
 * <a> 요소에 "is-disabled" 클래스가 있으면 모든 동작을 차단하고 토스트 메시지를 표시합니다.
 *
 * [Optional Data Attributes / 선택적 데이터 속성]
 * - data-disabled-msg       : Toast message content. / 토스트 메시지 내용.
 * - data-disabled-duration  : Display duration in ms. (e.g., 1500, 3000 | Default: 4000) / 표시 시간(ms).
 * - data-disabled-icon      : Material Symbols icon name. (e.g., "block", "info" | Default: "block") / 아이콘 이름.
 * - data-disabled-icon-color: Icon text color. Supports Hex, RGB, RGBA, or CSS Class. / 아이콘 색상.
 */
document.addEventListener('click', function(e) {
	const disabledBtn = e.target.closest('a.is-disabled');
	if(disabledBtn) {
		// 1. Native getAttribute is faster than jQuery .attr()
		const msg = disabledBtn.getAttribute("data-disabled-msg");
		
		if (msg) {
			const duration = au.NVL2(disabledBtn.getAttribute("data-disabled-duration")) || 4000;
			const icon = disabledBtn.getAttribute("data-disabled-icon") || "block";
			let html = msg;

			if (icon) {
				const color = disabledBtn.getAttribute("data-disabled-icon-color") || "";
				let style = "";
				let clazz = "material-symbols-outlined left";

				if (color !== "") {
					if (color[0] === "#" || color.indexOf("rgb") == 0) style = ` style="color:${color}"`;
					else if(color[0] === ".") clazz += ` ${color.slice(1)}`;
					else clazz += ` ${color}`;
				}
				// String concatenation is faster than creating DOM objects
				html = `<i class="${clazz}"${style}>${icon}</i>${msg}`;
			}
			
			M.toast({ html: html, displayLength: duration });
		}

		// 2. Block all further actions immediately
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
	}
}, true);

/* ── Text Limit Auto-Update / 텍스트 길이 자동 업데이트 ── */
$(document).on('focusin input', '.aniInput input.browser-default, .aniInput .materialize-textarea', function() {
	au.textLimit.update($(this));
});

/* Turn off autocomplete & spellcheck of browser / 브라우저 자동완성 및 맞춤법 검사 비활성화 */
$(document).ajaxComplete(function(event, xhr, settings) {
	au.offInputSpellcheck();
	au.textLimit.refresh();
	// Auto-resize all materialize-textarea after AJAX (idempotent — safe to call repeatedly)
	// AJAX 완료 후 모든 materialize-textarea 높이 자동 보정 (멱등 — 반복 호출 안전)
	if (typeof M !== "undefined" && M.textareaAutoResize) {
		$("textarea.materialize-textarea:visible").each(function() { M.textareaAutoResize(this); });
	}
});

/**
 * Global counter for tracking loading spinner and AJAX request states.
 * 로딩 스피너 및 AJAX 요청 상태를 추적하는 전역 카운터.
 *
 * @type {{loading: number, ajax: number}}
 * @property {number} loading - Count of active loading spinners / 활성 로딩 스피너 수
 * @property {number} ajax - Count of active AJAX requests (without spinner) / 활성 AJAX 요청 수 (스피너 미사용)
 */
window.globalCnt = window.globalCnt ||
	{
		loading: 0,
		ajax: 0,
	};

/** @namespace au - MAPIS utility namespace / MAPIS 유틸리티 네임스페이스 */
var au = {};

/**
 * Disable browser autocomplete and spellcheck on all visible inputs/textareas.
 * 모든 보이는 input/textarea의 브라우저 자동완성 및 맞춤법 검사를 비활성화합니다.
 *
 * @param {jQuery} [$container=$(document)] - Scope container / 범위 컨테이너
 */
au.offInputSpellcheck = function($container = $(document)) {
	$container.find('input:not([type="hidden"]), textarea').attr({
		'autocomplete': 'off',
		'spellcheck': 'false'
	});
};

/**
 * Text limit counter — shows character count near input fields with maxlength.
 * 텍스트 길이 카운터 — maxlength가 있는 입력 필드 근처에 글자 수를 표시합니다.
 */
au.textLimit = {
	/**
	 * Update character count display for a single element.
	 * 단일 요소의 글자 수 표시를 업데이트합니다.
	 *
	 * @param {jQuery} $el - Input or textarea element / 입력 또는 textarea 요소
	 */
	update: function($el) {
		const max = parseInt($el.attr('maxlength'), 10);
		if (isNaN(max)) return;
		if( $el.attr('nocounter') !== undefined) return;

		let $counter = $el.next('.char-counter');
		
		if ($counter.length === 0) {
			const initial = $el.val() ? $el.val().length : 0;
			$el.after(`<div class="char-counter"><span class="count-num">${initial}</span> / ${max}</div>`);
			$counter = $el.next('.char-counter');
		}

        const count = $el.val().length;
        $counter.find('.count-num').text(count);
        $counter.toggleClass('warning', max - count <= max * 0.1);
	},

	/**
	 * Refresh all character counters on the page and bind hover-to-remove.
	 * 페이지의 모든 글자 수 카운터를 새로고침하고 마우스오버 시 제거를 바인딩합니다.
	 */
	refresh: function() {
		$('.aniInput input.browser-default, .aniInput .materialize-textarea').each(function() {
			au.textLimit.update($(this));
		});
		$(document).off("mouseenter", ".aniInput .char-counter").on("mouseenter", ".aniInput .char-counter", function() {
			$(this).remove();
		});
	}
};

/* ── Color Palettes / 색상 팔레트 ── */

/** Aesop theme color palette (array). / Aesop 테마 색상 팔레트 (배열). */
au.aesopColor = ['#cac494', '#ebc39e', '#cfcecc', '#f0efe0', '#ece3d3', '#ded8d4', '#f5ece4', '#f7f1ec', '#e9f0e3', '#ebeadf', '#fefef2', '#c2c2af', '#c2c2af'];

/** MAPIS brand color map. / MAPIS 브랜드 색상 맵. */
au.mapisColor = {
	grey: "#e0e0e0",		// --gray20
	blue: "#7391C8",		// --cfblue25
	green: "#899f6a",		// --leafgreen
	greenL2: "#acbc97",	// --leafgreen-l2
	purple: "#a893bd",		// --viola25
	rose: "#d19c97", 		// --rose25
	mocha: "#A47864", 		// --mocha25
	red: "#bb2649",		// --viva
	orange: "#e87e05",		// --orangetiger
	black: "#263238"		// .blue-grey.darken-4
};

/**
 * Left-pad a value with a fill character (default "0").
 * 값을 채움 문자(기본값 "0")로 왼쪽 패딩합니다.
 *
 * @param {*} str - Value to pad / 패딩할 값
 * @param {number} [len=2] - Target length / 목표 길이
 * @param {string} [padstr="0"] - Fill character / 채움 문자
 * @returns {string} Padded string / 패딩된 문자열
 */
au.pad = ((str, len = 2, padstr = "0") => str.toString().padStart(len, padstr));

/**
 * Internationalized date labels for supported locales (ko, en, zh, ja, es, it, de).
 * 지원 언어별 국제화 날짜 라벨 (한국어, 영어, 중국어, 일본어, 스페인어, 이탈리아어, 독일어).
 *
 * Used by Materialize datepicker i18n and Date.prototype.format().
 * Materialize 날짜선택기 i18n 및 Date.prototype.format()에서 사용됩니다.
 *
 * @type {Object.<string, {months: string[], monthsShort: string[], weeks: string[], weeksShort: string[], cancel: string, done: string}>}
 */
au.i18nDate = {
	ko: {
		months: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
		monthsShort: ['1','2','3','4','5','6','7','8','9','10','11','12'],
		monthsAbbrev: ['1','2','3','4','5','6','7','8','9','10','11','12'],
		weeks: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
		weeksShort: ['일','월','화','수','목','금','토'],
		weeksAbbrev: ['일','월','화','수','목','금','토'],
		cancel: '취소',
		done: '확인'
	},

	en: {
		months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
		monthsShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
		monthsAbbrev: ['1','2','3','4','5','6','7','8','9','10','11','12'],
		weeks: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
		weeksShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
		weeksAbbrev: ['S','M','T','W','T','F','S'],
		cancel: 'Cancel',
		done: 'OK'
	},

	zh: {
		months: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
		monthsShort: ['1','2','3','4','5','6','7','8','9','10','11','12'],
		monthsAbbrev: ['1','2','3','4','5','6','7','8','9','10','11','12'],
		weeks: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
		weeksShort: ['日','一','二','三','四','五','六'],
		weeksAbbrev: ['日','一','二','三','四','五','六'],
		cancel: '取消',
		done: '确认'
	},

	ja: {
		months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
		monthsShort: ['1','2','3','4','5','6','7','8','9','10','11','12'],
		monthsAbbrev: ['1','2','3','4','5','6','7','8','9','10','11','12'],
		weeks: ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
		weeksShort: ['日','月','火','水','木','金','土'],
		weeksAbbrev: ['日','月','火','水','木','金','土'],
		cancel: 'キャンセル',
		done: '決定'
	},

	es: {
		months: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
		monthsShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
		monthsAbbrev: ['1','2','3','4','5','6','7','8','9','10','11','12'],
		weeks: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
		weeksShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
		weeksAbbrev: ['D','L','M','M','J','V','S'],
		cancel: 'Cancelar',
		done: 'Aceptar'
	},

	it: {
		months: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
		monthsShort: ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'],
		monthsAbbrev: ['1','2','3','4','5','6','7','8','9','10','11','12'],
		weeks: ['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'],
		weeksShort: ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'],
		weeksAbbrev: ['D','L','M','M','G','V','S'],
		cancel: 'Annulla',
		done: 'OK'
	},

	de: {
		months: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
		monthsShort: ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'],
		monthsAbbrev: ['1','2','3','4','5','6','7','8','9','10','11','12'],
		weeks: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
		weeksShort: ['So','Mo','Di','Mi','Do','Fr','Sa'],
		weeksAbbrev: ['S','M','D','M','D','F','S'],
		cancel: 'Abbrechen',
		done: 'OK'
	}
};

/**
 * Get the default date format pattern for a locale.
 * 언어별 기본 날짜 포맷 패턴을 반환합니다.
 *
 * @param {string} lang - Locale code (e.g., "en", "ko") / 언어 코드
 * @returns {string} Date format pattern (e.g., "MM-DD-YYYY") / 날짜 포맷 패턴
 */
au.dateFormat = function(lang) {
	let format = "";
	switch(lang) {
		case "en":
			format = "MM-DD-YYYY";
			break;
		case "de": case "it": case "es":
			format = "DD-MM-YYYY";
			break;
		case "ko": case "ja": case "zh": default:
			format = "YYYY-MM-DD";
			break;
	}
	return format;
}

/**
 * Get the month picker format pattern for a locale.
 * 언어별 월 선택기 포맷 패턴을 반환합니다.
 *
 * @param {string} lang - Locale code (e.g., "en", "ko") / 언어 코드
 * @returns {string} Month picker format pattern / 월 선택기 포맷 패턴
 */
au.monthpickerFormat = function(lang) {
	let format = "";
	switch(lang) {
		case "en": 
			format = "mmm yyyy";
			break;
		case "de": case "it": case "es": 
			format = "mmm yyyy";
			break;
		case "ko": case "ja": case "zh": default: 
			format = "yyyy.mm";
			break;
	}
	return format;
}

/**
 * Serialize formatted date string to 8-byte date (YYYYMMDD).
 * 포맷된 날짜 문자열을 8바이트 날짜(YYYYMMDD)로 직렬화합니다.
 *
 * @param {string} dateStr - Formatted date string (e.g., "12-25-2025") / 포맷된 날짜 문자열
 * @param {string} [format="mm-dd-yyyy"] - The format of input dateStr / 입력 날짜의 포맷
 * @returns {string} 8-digit date string (e.g., "20251225") / 8자리 날짜 문자열
 */
au.dateSerialize = function(dateStr, format = "mm-dd-yyyy") {
	if (!dateStr || !format) return "";

	const dateParts = dateStr.replace(/[\/\-]/g, '.').split('.');
	const formatParts = format.toLowerCase().replace(/[\/\-]/g, '.').split('.');

	if (dateParts.length !== 3 || formatParts.length !== 3) {
		throw new Error("Invalid date or format: " + dateStr + " / " + format);
	}

	let year = "", month = "", day = "";

	formatParts.forEach((part, index) => {
		if (part.indexOf('y') > -1) year = dateParts[index];
		else if (part.indexOf('m') > -1) month = dateParts[index];
		else if (part.indexOf('d') > -1) day = dateParts[index];
	});

	return year.padStart(4, "0") + month.padStart(2, "0") + day.padStart(2, "0");
};

/**
 * Restore 8-byte date string to formatted date string.
 * 8바이트 날짜 문자열을 포맷된 날짜 문자열로 역직렬화합니다.
 *
 * @param {string} dateStr - 8-byte date string (e.g., "20251225") / 8바이트 날짜 문자열
 * @param {string} format - Target format (e.g., "mm-dd-yyyy", "yyyy-mm-dd") / 대상 포맷
 * @returns {string} Formatted date string / 포맷된 날짜 문자열
 */
au.dateDeserialize = function(dateStr, format) {
	if (!dateStr || dateStr.length !== 8) {
		return dateStr; 
	}

	const year  = parseInt(dateStr.substring(0, 4), 10);
	const month = parseInt(dateStr.substring(4, 6), 10) - 1;
	const day   = parseInt(dateStr.substring(6, 8), 10);

	const dateObj = new Date(year, month, day);

	return dateObj.format(format);
};


/* ── AJAX Wrappers / AJAX 래퍼 함수 ── */

/**
 * Asynchronous POST request WITH loading spinner.
 * 로딩 스피너를 표시하는 비동기 POST 요청.
 *
 * If param is an object, it is sent as JSON (application/json).
 * param이 객체이면 JSON(application/json)으로 전송됩니다.
 *
 * @param {string} url - Request URL / 요청 URL
 * @param {Object|string} param - Request data (object → JSON, string → form-encoded) / 요청 데이터
 * @param {Function} cbFunction - Success callback / 성공 콜백
 * @param {Function} [errCbFunction] - Error callback (defaults to au.errorAlert) / 에러 콜백
 * @returns {jqXHR} jQuery AJAX promise / jQuery AJAX 프로미스
 */
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
	
	// If param is an object, set contentType to JSON and stringify.
	// param이 객체이면 contentType을 JSON으로 설정하고 문자열로 변환합니다.
	// (Java controller receives via @RequestBody Map<String, Object> paramMap)
	if(typeof param == "object" ){
		ajaxObj.contentType = "application/json";
		ajaxObj.data = JSON.stringify(ajaxObj.data);
	}
	return $.ajax(ajaxObj);
};

/**
 * Asynchronous POST request WITHOUT loading spinner.
 * 로딩 스피너를 표시하지 않는 비동기 POST 요청.
 *
 * Use this when controlling the loading bar manually, or for background requests.
 * 로딩 바를 수동으로 제어하거나 백그라운드 요청 시 사용합니다.
 *
 * @param {string} url - Request URL / 요청 URL
 * @param {Object|string} param - Request data / 요청 데이터
 * @param {Function} cbFunction - Success callback / 성공 콜백
 * @param {Function} [errCbFunction] - Error callback / 에러 콜백
 * @returns {jqXHR} jQuery AJAX promise / jQuery AJAX 프로미스
 */
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
	
	// If param is an object, set contentType to JSON and stringify.
	// param이 객체이면 contentType을 JSON으로 설정하고 문자열로 변환합니다.
	if(typeof param == "object" ){
		ajaxObj.contentType = "application/json";
		ajaxObj.data = JSON.stringify(ajaxObj.data);
	}
	return $.ajax(ajaxObj);
};

/**
 * Asynchronous GET request WITH loading spinner.
 * 로딩 스피너를 표시하는 비동기 GET 요청.
 *
 * @param {string} url - Request URL / 요청 URL
 * @param {Object|string} param - Request data / 요청 데이터
 * @param {Function} cbFunction - Success callback / 성공 콜백
 * @param {Function} [errCbFunction] - Error callback / 에러 콜백
 * @returns {jqXHR} jQuery AJAX promise / jQuery AJAX 프로미스
 */
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

	// If param is an object, set contentType to JSON and stringify.
	// param이 객체이면 contentType을 JSON으로 설정하고 문자열로 변환합니다.
	if(typeof param == "object" ){
		ajaxObj.contentType = "application/json";
		ajaxObj.data = JSON.stringify(ajaxObj.data);
	}
	return $.ajax(ajaxObj);
};

/**
 * Asynchronous GET request WITHOUT loading spinner.
 * 로딩 스피너를 표시하지 않는 비동기 GET 요청.
 *
 * @param {string} url - Request URL / 요청 URL
 * @param {Object|string} param - Request data / 요청 데이터
 * @param {Function} cbFunction - Success callback / 성공 콜백
 * @param {Function} [errCbFunction] - Error callback / 에러 콜백
 * @returns {jqXHR} jQuery AJAX promise / jQuery AJAX 프로미스
 */
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

	// If param is an object, set contentType to JSON and stringify.
	// param이 객체이면 contentType을 JSON으로 설정하고 문자열로 변환합니다.
	if(typeof param == "object" ){
		ajaxObj.contentType = "application/json";
		ajaxObj.data = JSON.stringify(ajaxObj.data);
	}
	return $.ajax(ajaxObj);
};

/**
 * Synchronous (blocking) POST request. Use with caution — blocks the UI thread.
 * 동기(블로킹) POST 요청. UI 스레드를 차단하므로 주의해서 사용하세요.
 *
 * @param {string} url - Request URL / 요청 URL
 * @param {Object|string} param - Request data / 요청 데이터
 * @param {Function} cbFunction - Success callback / 성공 콜백
 * @param {Function} [errCbFunction] - Error callback / 에러 콜백
 * @returns {jqXHR} jQuery AJAX promise / jQuery AJAX 프로미스
 * @deprecated Prefer async alternatives (ajaxPost, ajaxPost2) / 비동기 대안 사용 권장
 */
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
	
	// If param is an object, set contentType to JSON and stringify.
	// param이 객체이면 contentType을 JSON으로 설정하고 문자열로 변환합니다.
	if(typeof param == "object" ){
		ajaxObj.contentType = "application/json";
		ajaxObj.data = JSON.stringify(ajaxObj.data);
	}
	return $.ajax(ajaxObj);
};

/**
 * Asynchronous PUT request WITH loading spinner.
 * 로딩 스피너를 표시하는 비동기 PUT 요청.
 *
 * @param {string} url - Request URL / 요청 URL
 * @param {Object|string} param - Request data / 요청 데이터
 * @param {Function} cbFunction - Success callback / 성공 콜백
 * @param {Function} [errCbFunction] - Error callback / 에러 콜백
 * @returns {jqXHR} jQuery AJAX promise / jQuery AJAX 프로미스
 */
au.ajaxPut = function(url, param, cbFunction, errCbFunction){
	var ajaxObj = {
		url: url,
		data: param,
		type: 'put',
		dataType: 'json',
		beforeSend: function() { au.fnSetLoading("on"); },
		complete: function() { au.fnSetLoading("off"); },
		success: function (data) { cbFunction(data); },
		error: function (e) {
			if(errCbFunction) { errCbFunction(e); }
			else { au.errorAlert(e); }
		}
	};
	if(typeof param == "object" ){
		ajaxObj.contentType = "application/json";
		ajaxObj.data = JSON.stringify(ajaxObj.data);
	}
	return $.ajax(ajaxObj);
};

/**
 * Asynchronous PUT request WITHOUT loading spinner.
 * 로딩 스피너를 표시하지 않는 비동기 PUT 요청.
 *
 * @param {string} url - Request URL / 요청 URL
 * @param {Object|string} param - Request data / 요청 데이터
 * @param {Function} cbFunction - Success callback / 성공 콜백
 * @param {Function} [errCbFunction] - Error callback / 에러 콜백
 * @returns {jqXHR} jQuery AJAX promise / jQuery AJAX 프로미스
 */
au.ajaxPut2 = function(url, param, cbFunction, errCbFunction){
	var ajaxObj = {
		url: url,
		data: param,
		type: 'put',
		dataType: 'json',
		success: function (data) { cbFunction(data); },
		error: function (e) {
			if(errCbFunction) { errCbFunction(e); }
			else { au.errorAlert(e); }
		}
	};
	if(typeof param == "object" ){
		ajaxObj.contentType = "application/json";
		ajaxObj.data = JSON.stringify(ajaxObj.data);
	}
	return $.ajax(ajaxObj);
};

/**
 * Asynchronous DELETE request WITH loading spinner.
 * 로딩 스피너를 표시하는 비동기 DELETE 요청.
 *
 * @param {string} url - Request URL / 요청 URL
 * @param {Object|string} param - Request data / 요청 데이터
 * @param {Function} cbFunction - Success callback / 성공 콜백
 * @param {Function} [errCbFunction] - Error callback / 에러 콜백
 * @returns {jqXHR} jQuery AJAX promise / jQuery AJAX 프로미스
 */
au.ajaxDelete = function(url, param, cbFunction, errCbFunction){
	var ajaxObj = {
		url: url,
		data: param,
		type: 'delete',
		dataType: 'json',
		beforeSend: function() { au.fnSetLoading("on"); },
		complete: function() { au.fnSetLoading("off"); },
		success: function (data) { cbFunction(data); },
		error: function (e) {
			if(errCbFunction) { errCbFunction(e); }
			else { au.errorAlert(e); }
		}
	};
	if(typeof param == "object" ){
		ajaxObj.contentType = "application/json";
		ajaxObj.data = JSON.stringify(ajaxObj.data);
	}
	return $.ajax(ajaxObj);
};

/**
 * Asynchronous DELETE request WITHOUT loading spinner.
 * 로딩 스피너를 표시하지 않는 비동기 DELETE 요청.
 *
 * @param {string} url - Request URL / 요청 URL
 * @param {Object|string} param - Request data / 요청 데이터
 * @param {Function} cbFunction - Success callback / 성공 콜백
 * @param {Function} [errCbFunction] - Error callback / 에러 콜백
 * @returns {jqXHR} jQuery AJAX promise / jQuery AJAX 프로미스
 */
au.ajaxDelete2 = function(url, param, cbFunction, errCbFunction){
	var ajaxObj = {
		url: url,
		data: param,
		type: 'delete',
		dataType: 'json',
		success: function (data) { cbFunction(data); },
		error: function (e) {
			if(errCbFunction) { errCbFunction(e); }
			else { au.errorAlert(e); }
		}
	};
	if(typeof param == "object" ){
		ajaxObj.contentType = "application/json";
		ajaxObj.data = JSON.stringify(ajaxObj.data);
	}
	return $.ajax(ajaxObj);
};

/**
 * Synchronous (blocking) POST request. Legacy — prefer async alternatives.
 * 동기(블로킹) POST 요청. 레거시 — 비동기 대안 사용을 권장합니다.
 *
 * @param {string} url - Request URL / 요청 URL
 * @param {Object|string} param - Request data / 요청 데이터
 * @param {Function} cbFunction - Success callback / 성공 콜백
 * @param {Function} [errCbFunction] - Error callback / 에러 콜백
 * @returns {jqXHR} jQuery AJAX promise / jQuery AJAX 프로미스
 * @deprecated Use ajaxPost or ajaxPost2 instead / ajaxPost 또는 ajaxPost2 사용 권장
 */
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

/* ── Autocomplete / 자동완성 ── */

/**
 * Prevent default browser behavior (cursor jump) on arrow keys inside autocomplete inputs.
 * 자동완성 입력 필드에서 화살표 키의 기본 브라우저 동작(커서 이동)을 방지합니다.
 */
au._autoCompKeyEvent = function(e) {
	if (e.key === "ArrowUp" || e.key === "ArrowDown") {
		// textarea: 화살표키로 커서 이동 허용 + autocomplete 항목 이동 차단 (widget 핸들러까지 전파 중단)
		// textarea: allow cursor movement + block autocomplete navigation (stop propagation before widget handler)
		if (e.target.tagName === "TEXTAREA") {
			e.stopImmediatePropagation();
			return;
		}
		e.preventDefault();
	}
};

/**
 * Initialize jQuery UI autocomplete on an input element with AJAX data source.
 * 입력 요소에 AJAX 데이터 소스를 사용하는 jQuery UI 자동완성을 초기화합니다.
 *
 * Highlights matching text in results with the specified color.
 * 결과에서 일치하는 텍스트를 지정된 색상으로 강조합니다.
 *
 * @param {string} id - Input element selector (e.g., "#searchInput") / 입력 요소 셀렉터
 * @param {string} url - AJAX endpoint URL for search / 검색용 AJAX 엔드포인트 URL
 * @param {string} color - Highlight color for matching text / 일치 텍스트 강조 색상
 * @param {Function} cbFunction - Callback on item selection / 항목 선택 시 콜백
 * @param {boolean} [focusFlag=true] - Whether to blur after selection / 선택 후 포커스 해제 여부
 */
au.fnAutoComplete = function(id,url,color,cbFunction,focusFlag = true){
	$(id).on("keydown.arrow", au._autoCompKeyEvent);
	$(id).on("keydown.search", function(e){
		if(e.key == "Enter"){
			// textarea: Enter로 줄바꿈 허용 + autocomplete 항목 선택 차단 (widget 핸들러까지 전파 중단)
			// textarea: allow Enter for newline + block autocomplete selection (stop propagation before widget handler)
			if (this.tagName === "TEXTAREA") {
				e.stopImmediatePropagation();
				return;
			}
			return false;
		}
	});
	$(id).on("focus", function(e){
		if($(this).val().trim() === "") {
			$(this).autocomplete("search", "");
		}
	});

	$(id).autocomplete({
		position: {
			my: "left top",
			at: "left bottom",
			collision: "flipfit"
		},
		create: function() {
			$(this).data('ui-autocomplete')._renderItem = function (ul, item) {
				let t = "";
				if(!item?.disabled) {
					var re = new RegExp(au.escapeRegExp($.trim(this.term)), "ig");
					var matches = item.label.matchAll(re);
					
					var lastIdx = 0;
					for(var match of matches) {
						t += item.label.slice(lastIdx, match.index);
						t += "<span style='font-weight:bold;color:"+color+";'>"+match[0]+"</span>";
						lastIdx = match.index + match[0].length;
					}
					t += item.label.slice(lastIdx);
				} else {
					item.value = "";
					t = item.label;
				}
				
				$('.ui-helper-hidden-accessible').remove();
				
				return $("<li></li>")
						.data("item.autocomplete", item)
						.append("<a>" + t + "</a>")
						.appendTo(ul);
			};
		},
		
		/* true: match in order / false: match all entered characters / true: 글자순서대로 찾기 / false: 입력한 글자 모두 찾기 */
		matchContains: true,
		
		autoFill: false,
		autoFocus: true,
		scroll: false,
		mustMatch: false,
		
		selectFirst: false,
		minLength: 0,
		delay: 100,
		
		focus: function (event, ui) {
			return false;
		},
		
		/* Selection event / 선택 이벤트 */
		select: function(event, ui) {
			event.preventDefault();
			$('.ui-helper-hidden-accessible').remove();
			cbFunction(ui.item);
			if(focusFlag){
				$(event.target).blur();
			}
			return false;
		},
		
		/* Called when search results open / 검색 결과 오픈 시 호출 */
		open: function(event, ui){
			$(this).parents(".box-quicksearch").addClass("active");
		},
		
		/* Called when search results close / 검색 결과 종료 시 호출 */
		close: function(event, ui){
			$(this).parents(".box-quicksearch").removeClass("active");
		},

		/* Data source / 데이터 소스 */
		source: au.debounce(function( request, response ) {
			const input = $(id).val().trim();
			let data = [];
			if(au.NVL(input) == "") {
				data = [{
					label: _msg["cm_autocomplete_min_chars"] || "Please enter 1 or more characters",
					value: "",
					disabled: true
				}];
				response($.map(data, function( item ) {
					return item;
				}));
			} else {
				$.ajax({
					url: url,
					dataType: "json",
					data: {
						input: input,
						term: input
					},
					success: function( data ) {
						if(data.length == 0){
							data.push({
								label: "No results found",
								value: "",
								disabled: true
							});
						}
						response($.map(data, function( item ) {
							return item;
						}));
					},
					error: function() { response([]); }
				});
			}
		})
	});
};

/**
 * Autocomplete with an additional index parameter passed to the callback.
 * 콜백에 추가 인덱스 매개변수를 전달하는 자동완성.
 *
 * Useful for table rows where each row has its own autocomplete instance.
 * 각 행에 개별 자동완성 인스턴스가 있는 테이블 행에 유용합니다.
 *
 * @param {string} id - Input element selector / 입력 요소 셀렉터
 * @param {string} url - AJAX endpoint URL / AJAX 엔드포인트 URL
 * @param {string} color - Highlight color / 강조 색상
 * @param {Function} cbFunction - Callback (item, index) / 콜백 함수 (항목, 인덱스)
 * @param {number} index - Row index passed to callback / 콜백에 전달되는 행 인덱스
 * @param {boolean} [focusFlag=true] - Blur after selection / 선택 후 포커스 해제
 */
au.fnAutoCompleteIndex = function(id,url,color,cbFunction,index,focusFlag = true){
	$(id).on("keydown.arrow", au._autoCompKeyEvent);
	$(id).on("keydown.search", function(e){
		if(e.key == "Enter"){
			// textarea: Enter로 줄바꿈 허용 + autocomplete 항목 선택 차단 (widget 핸들러까지 전파 중단)
			// textarea: allow Enter for newline + block autocomplete selection (stop propagation before widget handler)
			if (this.tagName === "TEXTAREA") {
				e.stopImmediatePropagation();
				return;
			}
			return false;
		}
	});
	$(id).on("focus", function(e){
		if($(this).val().trim() === "") {
			$(this).autocomplete("search", "");
		}
	});
	
	$(id).autocomplete({
		position: {
			my: "left top",
			at: "left bottom",
			collision: "flipfit"
		},
		create: function() {
			$(this).data('ui-autocomplete')._renderItem = function (ul, item) {
				let t = "";
				if(!item?.disabled) {
					var re = new RegExp(au.escapeRegExp($.trim(this.term)), "ig");
					var matches = item.label.matchAll(re);
					
					var lastIdx = 0;
					for(var match of matches) {
						t += item.label.slice(lastIdx, match.index);
						t += "<span style='font-weight:bold;color:"+color+";'>"+match[0]+"</span>";
						lastIdx = match.index + match[0].length;
					}
					t += item.label.slice(lastIdx);
				} else {
					item.value = "";
					t = item.label;
				}
				
				$('.ui-helper-hidden-accessible').remove();
				
				return $("<li></li>")
						.data("item.autocomplete", item)
						.append("<a>" + t + "</a>")
						.appendTo(ul);
			};
		},
		
		/* true: match in order / false: match all entered characters / true: 글자순서대로 찾기 / false: 입력한 글자 모두 찾기 */
		matchContains: true,
		
		autoFill: false,
		autoFocus: true,
		scroll: false,
		mustMatch: false,
		
		selectFirst: false,
		minLength: 0,
		delay: 100,
		
		focus: function (event, ui) {
			return false;
		},
		
		/* Selection event / 선택 이벤트 */
		select: function(event, ui) {
			event.preventDefault();
			$('.ui-helper-hidden-accessible').remove();
			cbFunction(ui.item, index);
			if(focusFlag){
				$(event.target).blur();
			}
			return false;
		},

		/* Called when search results open / 검색 결과 오픈 시 호출 */
		open: function(event, ui){
			$(this).parents(".box-quicksearch").addClass("active");
		},

		/* Called when search results close / 검색 결과 종료 시 호출 */
		close: function(event, ui){
			$(this).parents(".box-quicksearch").removeClass("active");
		},

		/* Data source / 데이터 소스 */
		source: au.debounce(function( request, response ) {
			const input = $(id).val().trim();
			let data = [];
			if(au.NVL(input) == "") {
				data = [{
					label: _msg["cm_autocomplete_min_chars"] || "Please enter 1 or more characters",
					value: "",
					disabled: true
				}];
				response($.map(data, function( item ) {
					return item;
				}));
			} else {
				$.ajax({
					url: url,
					dataType: "json",
					data: {
						input: input,
						term: input
					},
					success: function( data ) {
						if(data.length == 0){
							data.push({
								label: "No results found",
								value: "",
								disabled: true
							});
						}
						response($.map(data, function( item ) {
							return item;
						}));
					},
					error: function() { response([]); }
				});
			}
		})
	});
};

/**
 * Autocomplete with index + custom merge function for server results.
 * 인덱스와 서버 결과를 병합하는 커스텀 함수를 지원하는 자동완성.
 *
 * The mergeDataFn allows merging current field values with server-returned options.
 * mergeDataFn을 통해 현재 필드 값과 서버 반환 옵션을 병합할 수 있습니다.
 *
 * @param {string} id - Input element selector / 입력 요소 셀렉터
 * @param {string} url - AJAX endpoint URL / AJAX 엔드포인트 URL
 * @param {string} color - Highlight color / 강조 색상
 * @param {Function} cbFunction - Selection callback (item, index) / 선택 콜백
 * @param {number} index - Row index / 행 인덱스
 * @param {Function} mergeDataFn - Merge function (serverData, input) => mergedData / 병합 함수
 * @param {boolean} [focusFlag=true] - Blur after selection / 선택 후 포커스 해제
 */
au.fnAutoCompleteIndexMergeCurrentValues = function(id, url, color, cbFunction, index, mergeDataFn, focusFlag = true) {
	$(id).on("keydown.arrow", au._autoCompKeyEvent);
	$(id).on("keydown.search", function(e){
		if(e.key == "Enter"){
			// textarea: Enter로 줄바꿈 허용 + autocomplete 항목 선택 차단 (widget 핸들러까지 전파 중단)
			// textarea: allow Enter for newline + block autocomplete selection (stop propagation before widget handler)
			if (this.tagName === "TEXTAREA") {
				e.stopImmediatePropagation();
				return;
			}
			return false;
		}
	});
	$(id).on("focus", function(e){
		if($(this).val().trim() === "") {
			$(this).autocomplete("search", "");
		}
	});

	$(id).autocomplete({
		position: {
			my: "left top",
			at: "left bottom",
			collision: "flipfit"
		},
		create: function() {
			$(this).data('ui-autocomplete')._renderItem = function (ul, item) {
				let t = "";
				if(!item?.disabled) {
					var re = new RegExp(au.escapeRegExp($.trim(this.term)), "ig");
					var matches = item.label.matchAll(re);
					
					var lastIdx = 0;
					for(var match of matches) {
						t += item.label.slice(lastIdx, match.index);
						t += "<span style='font-weight:bold;color:"+color+";'>"+match[0]+"</span>";
						lastIdx = match.index + match[0].length;
					}
					t += item.label.slice(lastIdx);
				} else {
					item.value = "";
					t = item.label;
				}
				
				$('.ui-helper-hidden-accessible').remove();
				
				return $("<li></li>")
						.data("item.autocomplete", item)
						.append("<a>" + t + "</a>")
						.appendTo(ul);
			};
		},
		
		matchContains: true,
		autoFill: false,
		autoFocus: true,
		scroll: false,
		mustMatch: false,
		selectFirst: false,
		minLength: 0,
		delay: 100,
		
		focus: function (event, ui) {
			return false;
		},
		
		select: function(event, ui) {
			event.preventDefault();
			$('.ui-helper-hidden-accessible').remove();
			cbFunction(ui.item, index);
			if(focusFlag){
				$(event.target).blur();
			}
			return false;
		},
		
		open: function(event, ui){
			$(this).parents(".box-quicksearch").addClass("active");
		},
		
		close: function(event, ui){
			$(this).parents(".box-quicksearch").removeClass("active");
		},

		source: au.debounce(function( request, response ) {
			const input = request.term.trim();
			let data = [];
			
			if(input === "") {
				data = [{
					label: _msg["cm_autocomplete_min_chars"] || "Please enter 1 or more characters",
					value: "",
					disabled: true
				}];
				response($.map(data, function(item) {
					return item;
				}));
			} else {
				$.ajax({
					url: url,
					dataType: "json",
					data: {
						input: input,
						term: input
					},
					success: function(serverData) {
						/*
						if(serverData.length == 0) {
							serverData.push({
								label: "No results found",
								value: "",
								disabled: true
							});
						}
						*/
						
						// Merge data via mergeDataFn (processing delegated to the provided function)
						// mergeDataFn으로 데이터 병합 (전달받은 함수에서 처리)
						const mergedData = mergeDataFn ? mergeDataFn(serverData, input) : serverData;

						response($.map(mergedData, function(item) {
							return item;
						}));
					},
					error: function() { response([]); }
				});
			}
		})
	});
};


/* ── Form Parameter Collection / 폼 파라미터 수집 ── */

/**
 * Retrieve form values from all named elements within a selector.
 * 셀렉터 내 name 속성이 있는 모든 요소에서 폼 값을 수집합니다.
 *
 * - Normal names (without @): standard key=value parameters.
 *   일반 이름 (@없음): 표준 key=value 파라미터.
 * - Names with @ (e.g., "group@field"): grouped as arrays of objects (for dynamic tables).
 *   @가 포함된 이름: 객체 배열로 그룹화 (동적 테이블용).
 * - Names with ^ (e.g., "group^field"): grouped as nested objects.
 *   ^가 포함된 이름: 중첩 객체로 그룹화.
 * - Checkboxes: single → "Y"/"N", multiple with same name → array of checked values.
 *   체크박스: 단일 → "Y"/"N", 동일 이름 복수 → 체크된 값의 배열.
 *
 * @param {string} selector - CSS selector for form or container / 폼 또는 컨테이너 CSS 셀렉터
 * @param {Object} [defaultParam={}] - Default values to merge / 병합할 기본값
 * @returns {Object} Collected parameters / 수집된 파라미터
 */
au.getParam = function(selector, defaultParam = {}) {
	let form = document.querySelector(selector);

	// Find form element
	if (!form || form.tagName.toLowerCase() !== "form") {
		form = document.querySelector(selector + " form");
		if (!form) return {};
	}

	const disabledElements = form.querySelectorAll('input:disabled, select:disabled, textarea:disabled');
	disabledElements.forEach(el => el.disabled = false);

	const fd = new FormData(form);
	const singleParam = {};  // plain key=value
	const multipleParam = {}; // @ grouped arrays
	const dynamicTables = {};

	// Map DOM elements by name so we can match correct FormData index
	const domMap = {};
	form.querySelectorAll("[name]").forEach(el => {
		const name = el.name;
		if (!domMap[name]) domMap[name] = [];
		domMap[name].push(el);
	});
	
	// Counter for mapping FormData index to correct input element
	const fdCounter = {};
	// 같은 multi-select element가 FormData에 값 개수만큼 분리 entry로 들어오는 것을 추적
	// Track multi-select elements that emit one FormData entry per selected value
	const processedMultiSelects = new WeakSet();

	for (let [key, value] of fd.entries()) {
		const elements = domMap[key] || [];
		if (!fdCounter[key]) fdCounter[key] = 0;

		const el = elements[fdCounter[key]] || elements[0];
		const $el = $(el);
		fdCounter[key]++;

		// Skip file inputs
		if (el && el.type === "file") continue;
		// Skip elements inside deleted rows
		if (el && el.closest("tr.row-delete")) continue;
		
		if (el && $el.hasClass("summernote")) {
			value = $el.summernote('code');
		}

		// Remove inputmask formatting
		if (el && $el.hasClass("im-class")) {
			if (typeof $el.inputmask == "function") {
				value = $el.inputmask("unmaskedvalue");
			} else {
				value = au.NVL2(value);
			}
		}

		if (el && $el.is("[select2]")) {
			if($el.is("[multiple]")) {
				// multi-select은 선택값 개수만큼 FormData entry가 분리되어 들어옴.
				// 같은 element가 두 번째로 등장하면 fdCounter를 되돌려 skip해야 다음 row의 element 인덱스 매핑이 보존됨.
				// 이전 구현(fdCounter[key] > 1 → continue)은 row2 plant select를 row1의 추가 value로 오인하여 누락시킴.
				// multi-select emits one FormData entry per selected value; on a repeat encounter of the same element,
				// roll back fdCounter and skip so the next row's element index stays aligned.
				// The previous guard (fdCounter[key] > 1) misread row2's select as row1's extra value, dropping it.
				if (processedMultiSelects.has(el)) {
					fdCounter[key]--;
					continue;
				}
				processedMultiSelects.add(el);
				let dataArray = [];
				if($el.is("[select2text]")) {
					const selectData = $el.select2('data') || [];
					dataArray = selectData.map(item => item.text);
				} else {
					dataArray = $el.val() || [];
				}
				value = dataArray.join("\u001f");
			}
		}

		// ===========================================
		// Customized key fields elements in table
		// ===========================================
		/*
		1. Input Examples:
		<tr>
			<td><input name="group@field1=A&field2=C" value="value1"></td>
			<td><input name="group@field1=A&field2=D" value="value2"></td>
		</tr>
		<tr>
			<td><input name="group@field1=B&field2=C" value="value3"></td>
			<td><input name="group@field1=B&field2=D" value="value4"></td>
		</tr>
		2. Transformed Structure (JSON/Object):
		param = {
			group: [
				{field1: A, field2: C, value: value1},
				{field1: A, field2: D, value: value2},
				{field1: B, field2: C, value: value3},
				{field1: B, field2: D, value: value4}
			]
		};
		*/
		if (key.includes("@") && key.includes("=")) {
			const parts = key.split("@");
			const group = parts.shift();
			const query = parts.join("@");
			const dataValueCol = el.getAttribute("data-valuecolumn") || "value";
			
			const rows = {};
			query.split("&").forEach(pair => {
				const [k, v] = pair.split("=");
				if(k) rows[k] = v || "";
			});
			rows[dataValueCol] = value;

			if (!multipleParam[group]) multipleParam[group] = [];
			multipleParam[group].push(rows);
		} 

		// ===========================================
		// Sequential(seq_no) key fields in table
		// ===========================================
		/*
		1. Input Examples:
		<tr>
			<td><input name="group@field1" value="value1"></td>
			<td><input name="group@field2" value="value2"></td>
		</tr>
		<tr>
			<td><input name="group@field1" value="value3"></td>
			<td><input name="group@field2" value="value4"></td>
		</tr>

		2. Transformed Structure (JSON/Object):
		param = {
			group: [
				{field1: value1, field2: value2}, 
				{field1: value3, field2: value4}
			]
		};
		*/
		else if (key.includes("@")) {
			const [group, field] = key.split("@");

			if (!dynamicTables[group]) dynamicTables[group] = {};
			if (!dynamicTables[group][field]) dynamicTables[group][field] = [];

			dynamicTables[group][field].push(value);
		} 

		// ===========================================
		// Grouped separated elements
		// ===========================================
		/*
		1. Input Examples:
		<input name="group^field1" value="value1">
		<input name="group^field2" value="value2">
		
		2. Transformed Structure (JSON/Object):
		param = {
			group: {field1: value1, field2: value2}
		};
		*/
		else if (key.includes("^")) {
			const [group, field] = key.split("^");

			if (!multipleParam[group]) multipleParam[group] = {};
			multipleParam[group][field] = value;
		} 

		// ===========================================
		// Standard elements
		// ===========================================
		/*
		1. Input Examples:
		<input name="field1" value="value1">
		<input name="field2" value="value2">
		
		2. Transformed Structure (JSON/Object):
		param = {
			field1: value1,
			field2: value2
		};
		*/
		else {
			if (singleParam[key] == undefined) {
				singleParam[key] = value;
			} else {
				if (!Array.isArray(singleParam[key])) {
					singleParam[key] = [singleParam[key]];
				}
				singleParam[key].push(value);
			}
		}
	}

	// Handle checkboxes: "Y" / "N"
	const checkboxes = form.querySelectorAll('input[type="checkbox"][name]');

	checkboxes.forEach(chk => {
		const key = chk.name;
		const val = chk.checked ? "Y" : "N";

		if (key.includes("@")) {
			const [group, field] = key.split("@");

			if (!multipleParam[group]) multipleParam[group] = {};
			if (!multipleParam[group][field]) multipleParam[group][field] = [];

			multipleParam[group][field].push(val);
		} 
		else if (key.includes("^")) {
			const [group, field] = key.split("^");

			if (!multipleParam[group]) multipleParam[group] = {};
			multipleParam[group][field] = val;
		} 
		// Normal checkbox
		else {
			singleParam[key] = val;
		}
	});

	Object.keys(dynamicTables).forEach(group => {
		const fieldMap = dynamicTables[group];
		const maxRows = Math.max(...Object.values(fieldMap).map(arr => arr.length));
	
		const rows = [];
	
		for (let i = 0; i < maxRows; i++) {
			const row = {};
			Object.keys(fieldMap).forEach(field => {
				row[field] = fieldMap[field][i] ?? null;
			});
			rows.push(row);
		}
	
		multipleParam[group] = rows;
	});

	disabledElements.forEach(el => el.disabled = true);

	return {
		...singleParam,
		...multipleParam,
		...defaultParam
	};
};

/* ── Form Validation / 폼 유효성 검증 ── */

/**
 * Validate a single form element (required check + length check). Uses alert().
 * 단일 폼 요소를 검증합니다 (필수값 체크 + 길이 체크). alert()을 사용합니다.
 *
 * @param {string|jQuery} obj - Element selector or jQuery object / 요소 셀렉터 또는 jQuery 객체
 * @param {string} isEssential - "Y" if required / 필수 여부 ("Y")
 * @param {number} maxLength - Maximum allowed length (0 = no limit) / 최대 허용 길이
 * @param {string} isKor - Reserved (unused) / 예약 (미사용)
 * @param {string} msg - Field label for error message / 에러 메시지에 표시할 필드명
 * @param {number} [minLength] - Minimum required length / 최소 필요 길이
 * @returns {boolean} true if valid, false otherwise / 유효하면 true, 아니면 false
 */
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
						alert("[" + msg + "] " + (_msg["util_min_length"] || "Minimum Length") + " (" + minLength + "Char)");
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
			alert("[" + msg + "] " + (_msg["util_need_value"] || "Need value"));
			$(obj).focus();
			return false;
		}
	}
	
	if (maxLength > 0) {
		if (maxLength < Number(au.getStrLength(formValue))) {
			alert("[" + msg + "] "+ Number(maxLength) + ' ' + (_msg["util_exceed_max_length"] || "Can't over"));
			$(obj).focus();
			return false;
		}
	}
	
	
	return true;
};

/**
 * Validate a single form element (required check + length check). Uses Materialize toast.
 * 단일 폼 요소를 검증합니다 (필수값 체크 + 길이 체크). Materialize 토스트를 사용합니다.
 *
 * @param {string|jQuery} obj - Element selector or jQuery object / 요소 셀렉터 또는 jQuery 객체
 * @param {string} isEssential - "Y" if required / 필수 여부 ("Y")
 * @param {number} maxLength - Maximum allowed length / 최대 허용 길이
 * @param {string} isKor - Reserved (unused) / 예약 (미사용)
 * @param {string} msg - Field label for error message / 에러 메시지에 표시할 필드명
 * @param {number} [minLength] - Minimum required length / 최소 필요 길이
 * @returns {boolean} true if valid, false otherwise / 유효하면 true, 아니면 false
 */
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
						M.toast({html: "[" + msg + "] " + "Need " + minLength + "Char"});
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
			M.toast({html: "[" + msg + "] " + (_msg["util_need_value"] || "Need value")});
			$(obj).focus();
			return false;
		}
	}
	
	if (maxLength > 0) {
		if (maxLength < Number(au.getStrLength(formValue))) {
			M.toast({html: "[" + msg + "] " + Number(maxLength) + ' ' + (_msg["util_exceed_max_length"] || "Can't over")});
			$(obj).focus();
			return false;
		}
	}
	
	
	return true;
};

/* ── String Utilities / 문자열 유틸리티 ── */

/**
 * Get the character length of a string (returns 0 for null/empty).
 * 문자열의 글자 수를 반환합니다 (null/빈값은 0 반환).
 *
 * @param {string} str - Input string / 입력 문자열
 * @returns {number} Character count / 글자 수
 */
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

/**
 * Get the UTF-8 byte length of a string.
 * 문자열의 UTF-8 바이트 길이를 반환합니다.
 *
 * @param {string} str - Input string / 입력 문자열
 * @returns {number} Byte length / 바이트 길이
 */
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
	
/* ── Form Length Display / 폼 길이 표시 ── */

/**
 * Print character count of an input to the nearest <em> tag, and update on input event.
 * 입력 요소의 글자 수를 가장 가까운 <em> 태그에 출력하고, 입력 이벤트 시 업데이트합니다.
 *
 * @param {string|jQuery} input - Input selector or jQuery object / 입력 셀렉터 또는 jQuery 객체
 */
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
/**
 * Print character count using new DOM structure (prev sibling's .count em).
 * 새 DOM 구조를 사용하여 글자 수를 출력합니다 (이전 형제의 .count em).
 *
 * @param {string|jQuery} input - Input selector or jQuery object / 입력 셀렉터 또는 jQuery 객체
 */
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
/**
 * Print byte length count using new DOM structure.
 * 새 DOM 구조를 사용하여 바이트 길이를 출력합니다.
 *
 * @param {string|jQuery} input - Input selector or jQuery object / 입력 셀렉터 또는 jQuery 객체
 */
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
/**
 * Print character count of $inputElement's value into $printElement's text.
 * $inputElement의 글자 수를 $printElement의 text로 출력합니다.
 *
 * @param {jQuery} $inputElement - Source input / 소스 입력 요소
 * @param {jQuery} $printElement - Target display element / 대상 표시 요소
 */
au.printStrValLength = function ($inputElement, $printElement){
	var text = $inputElement.val();
	var len = au.getStrLength( text );
	$printElement.text(len);
};
/**
 * Print byte length of $inputElement's value into $printElement's text.
 * $inputElement의 바이트 길이를 $printElement의 text로 출력합니다.
 *
 * @param {jQuery} $inputElement - Source input / 소스 입력 요소
 * @param {jQuery} $printElement - Target display element / 대상 표시 요소
 */
au.printStrValByteLength = function ($inputElement, $printElement){
	var text = $inputElement.val();
	var len = au.getStrByteLength( text );
	$printElement.text(len);
};
	
/**
 * Print text/textarea length to the nearest <em> tag for all elements matching the given name.
 * Also binds the same behavior on input events.
 * 주어진 name으로 찾은 모든 요소의 text/textarea 길이를 가장 가까운 <em> 태그에 출력합니다.
 * 입력 이벤트에도 동일한 기능을 바인딩합니다.
 *
 * @param {string} inputName - jQuery selector by name attribute / name 속성 기반 jQuery 셀렉터
 * @param {number} [max] - Maximum length (unused in current implementation) / 최대 길이 (현재 미사용)
 */
au.formLengthPrintByName = function (inputName, max){
	var arr = $(inputName);
	for(let i = 0 ; i < arr.length ; i++){
		let $input = $(arr[i]);
		au.formLengthPrint($input);

		$input.off("input");			// Reset event handler / 이벤트 핸들러 초기화
		$input.on("input", function(event){
			au.formLengthPrint($input);
		});
	}
};

/* ── Null/Empty Value Handling / 널값/빈값 처리 ── */

/**
 * NVL for string type — returns replacement if value is null, undefined, empty, "null", "undefined", or "NaN".
 * 문자열 NVL — null, undefined, 빈값, "null", "undefined", "NaN"이면 대체값을 반환합니다.
 *
 * @param {*} obj - Value to check / 검사할 값
 * @param {string} [replace=""] - Replacement value / 대체값
 * @returns {string} Original trimmed string or replacement / 원본 트림 문자열 또는 대체값
 */
au.NVL = function(obj, replace = ""){
	if (obj === null || obj === undefined) return replace;
	const str = String(obj).trim();
	if (str === "" || str === "null" || str === "undefined" || str === "NaN") {
		return replace;
	}
	return str;
};
/**
 * NVL for number type — extracts numeric value; returns replacement if not a valid number.
 * 숫자 NVL — 숫자 값을 추출하고, 유효한 숫자가 아니면 대체값을 반환합니다.
 *
 * @param {*} obj - Value to check / 검사할 값
 * @param {number} [replace=0] - Replacement value / 대체값
 * @returns {number} Parsed number or replacement / 파싱된 숫자 또는 대체값
 */
au.NVL2 = function(obj, replace = 0){
	const str = au.NVL(obj, replace);
	if(str == "") return replace;

	const cleaned = str.replace(/[^0-9.-]/g, "");
	
	const num = parseFloat(cleaned);
	return isNaN(num) ? replace : num;
};

/* ── Date Utilities / 날짜 유틸리티 ── */

/**
 * Get today's date in "YYYY-MM-DD" format (UTC).
 * 오늘 날짜를 "YYYY-MM-DD" 형식으로 반환합니다 (UTC).
 *
 * @returns {string} Date string (e.g., "2025-12-25") / 날짜 문자열
 */
au.getTodayDate = function() {
	var year = au.getYear();
	var month = au.getMonth();
	var day = au.getDay();
	var ymd = year + "-" +month + "-" + day;

	return ymd;
};

/**
 * Get today's date in "YYYYMMDD" format (UTC, no separators).
 * 오늘 날짜를 "YYYYMMDD" 형식으로 반환합니다 (UTC, 구분자 없음).
 *
 * @returns {string} Date string (e.g., "20251225") / 날짜 문자열
 */
au.getTodayDate2 = function() {
	var year = au.getYear();
	var month = au.getMonth();
	var day = au.getDay();
	var ymd = year + month + day;

	return ymd;
};

/** Get current UTC year. / 현재 UTC 연도를 반환합니다. @returns {string} */
au.getYear = function() {
	var now = new Date();
	return now.getUTCFullYear().toString();
};

/** Get current UTC month (zero-padded). / 현재 UTC 월을 반환합니다 (0 패딩). @returns {string} */
au.getMonth = function() {
	var now = new Date();

	var month = now.getUTCMonth() + 1; // Jan=0, Dec=11 so add 1 / 1월=0, 12월=11이므로 1 더함
	if (("" + month).length == 1) { month = "0" + month; }

	return month.toString();
};

/** Get current UTC day (zero-padded). / 현재 UTC 일을 반환합니다 (0 패딩). @returns {string} */
au.getDay = function() {
	var now = new Date();

	var day = now.getUTCDate();
	if (("" + day).length == 1) { day = "0" + day; }

	return day.toString();
};

/* ── Date Prototype Extensions / Date 프로토타입 확장 ── */

/**
 * Return a new Date shifted forward by the given amounts.
 * 지정된 양만큼 미래로 이동한 새 Date를 반환합니다.
 *
 * @example new Date().after(1, 1, 1, 1, 1, 1).format("YYYYMMDD HHmmss")
 * @param {number} [years] @param {number} [months] @param {number} [dates]
 * @param {number} [hours] @param {number} [miniutes] @param {number} [seconds] @param {number} [mss]
 * @returns {Date} New Date instance / 새 Date 인스턴스
 */
Date.prototype.after = function(years, months, dates, hours, miniutes, seconds, mss) {
	if (years == null || years == "")	years = 0;
	else years = Number(years);

	if (months == null || months == "")	 months = 0;
	else months = Number(months);

	if (dates == null || dates == "")	dates	= 0;
	else dates = Number(dates);
		
	if (hours == null || hours == "")	hours	= 0;
	else hours = Number(hours);

	if (miniutes == null || miniutes == "") miniutes = 0;
	else miniutes = Number(miniutes);

	if (seconds == null || seconds == "")	seconds	= 0;
	else seconds = Number(seconds);

	if (mss == null || mss == "")		mss		= 0;
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

/**
 * Return a new Date shifted backward by the given amounts.
 * 지정된 양만큼 과거로 이동한 새 Date를 반환합니다.
 *
 * @example new Date().before(1, 1, 1, 1, 1, 1).format("YYYYMMDD HHmmss")
 * @param {number} [years] @param {number} [months] @param {number} [dates]
 * @param {number} [hours] @param {number} [miniutes] @param {number} [seconds] @param {number} [mss]
 * @returns {Date} New Date instance / 새 Date 인스턴스
 */
Date.prototype.before = function(years, months, dates, hours, miniutes, seconds, mss) {
	if (years == null || years == "")	years	= 0;
	else years = Number(years);

	if (months == null || months == "")	 months	 = 0;
	else months = Number(months);

	if (dates == null || dates == "")	dates	= 0;
	else dates = Number(dates);
		
	if (hours == null || hours == "")	hours	= 0;
	else hours = Number(hours);

	if (miniutes == null || miniutes == "") miniutes = 0;
	else miniutes = Number(miniutes);

	if (seconds == null || seconds == "")	seconds	= 0;
	else seconds = Number(seconds);

	if (mss == null || mss == "")		mss		= 0;
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

/**
 * Format a Date object using a pattern string with locale support.
 * 패턴 문자열과 언어 지원을 사용하여 Date 객체를 포맷합니다.
 *
 * Pattern tokens / 패턴 토큰:
 *   YYYY : 4-digit year / 4자리 연도      YY : 2-digit year / 2자리 연도
 *   MM   : month (01~12) / 월            mm : month (1~12, no pad) / 월 (패딩 없음)
 *   MON  : full month name (e.g., "January") / 전체 월 이름
 *   mon  : short month name (e.g., "Jan") / 축약 월 이름
 *   DD   : day (01~31) / 일              dd : day (1~31, no pad) / 일 (패딩 없음)
 *   DAY  : full day of week (e.g., "Sunday") / 전체 요일
 *   day  : abbreviated day (e.g., "Sun") / 축약 요일
 *   HH   : hour 24h (00~23) / 24시간제    hh : hour 12h (01~12) / 12시간제
 *   min  : minute (00~59) / 분            ss : second (00~59) / 초
 *   SS   : millisecond / 밀리초           a  : "AM" or "PM"
 *
 * @param {string} [pattern="YYYYMMDD"] - Format pattern / 포맷 패턴
 * @param {string} [lang=_lang] - Locale code / 언어 코드
 * @returns {string} Formatted date string / 포맷된 날짜 문자열
 */
Date.prototype.format = function(pattern = "YYYYMMDD", lang = _lang) {
	lang = lang || "en";

	const year = this.getFullYear();
	const month = this.getMonth(); // 0~11
	const day = this.getDate();
	const dayInWeek = this.getDay();
	const hour24 = this.getHours();
	const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
	const ampm = hour24 < 12 ? "AM" : "PM";
	const min = this.getMinutes();
	const sec = this.getSeconds();
	const ms = this.getMilliseconds();
	
	const replacements = {
		"YYYY": year,
		"yyyy": year,
		"YY": year.toString().slice(2),
		"yy": year.toString().slice(2),
		"MM": au.pad(month + 1),
		"mm": (month + 1).toString(),
		"MON": au.i18nDate[lang]["months"][month],
		"mon": au.i18nDate[lang]["monthsShort"][month],
		"DD": au.pad(day),
		"dd": day.toString(),
		"DAY": au.i18nDate[lang]["weeks"][dayInWeek],
		"day": au.i18nDate[lang]["weeksAbbrev"][dayInWeek],
		"HH": au.pad(hour24),
		"hh": au.pad(hour12),
		"min": au.pad(min),
		"ss": au.pad(sec),
		"S": au.pad(ms,1),
		"SS": au.pad(ms,2),
		"SSS": au.pad(ms,3),
		"a": ampm
	};
	const keys = Object.keys(replacements).sort((a,b) => b.length - a.length);
	const regex = new RegExp(keys.join("|"), "g");

	return pattern.replace(regex, match => replacements[match]);
};

/**
 * Format a Date using the default locale-specific date pattern (from au.dateFormat).
 * au.dateFormat에서 가져온 언어별 기본 날짜 패턴을 사용하여 Date를 포맷합니다.
 *
 * @param {string} [lang=_lang] - Locale code / 언어 코드
 * @returns {string} Formatted date string / 포맷된 날짜 문자열
 */
Date.prototype.format2 = function(lang = _lang) {
	lang = lang || "en";

	const year = this.getFullYear();
	const month = this.getMonth(); // 0~11
	const day = this.getDate();
	const dayInWeek = this.getDay();
	const hour24 = this.getHours();
	const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
	const ampm = hour24 < 12 ? "AM" : "PM";
	const min = this.getMinutes();
	const sec = this.getSeconds();
	const ms = this.getMilliseconds();

	const replacements = {
		"YYYY": year,
		"yyyy": year,
		"YY": year.toString().slice(2),
		"yy": year.toString().slice(2),
		"MM": au.pad(month + 1),
		"mm": (month + 1).toString(),
		"MON": au.i18nDate[lang]["months"][month],
		"mon": au.i18nDate[lang]["monthsShort"][month],
		"DD": au.pad(day),
		"dd": day.toString(),
		"DAY": au.i18nDate[lang]["weeks"][dayInWeek],
		"day": au.i18nDate[lang]["weeksAbbrev"][dayInWeek],
		"HH": au.pad(hour24),
		"hh": au.pad(hour12),
		"min": au.pad(min),
		"ss": au.pad(sec),
		"S": au.pad(ms,1),
		"SS": au.pad(ms,2),
		"SSS": au.pad(ms,3),
		"a": ampm
	};
	const pattern = au.dateFormat(lang);
	const keys = Object.keys(replacements).sort((a,b) => b.length - a.length);
	const regex = new RegExp(keys.join("|"), "g");

	return pattern.replace(regex, match => replacements[match]);
};

/* ── jQuery Table Merge Plugins / jQuery 테이블 병합 플러그인 ── */

/**
 * Merge vertically adjacent cells with identical content in the given column (rowspan).
 * 지정된 열에서 동일한 내용을 가진 수직 인접 셀을 병합합니다 (rowspan).
 *
 * @param {number} colIdx - Column index to merge / 병합할 열 인덱스
 * @param {number} [isStats] - Stat adjustment count / 통계 조정 수
 * @returns {jQuery} this (chainable) / this (체이닝 가능)
 */
$.fn.rowspan = function(colIdx, isStats) {
	const addCnt = (isStats == null) ? 0 : isStats * 1;
	return this.each(function(){		
		let that;
		$(this).children('tr').not('.hide-row').each(function(row) {		
			$(this).children('td, th').eq(colIdx).each(function(col) {			
				const $this = $(this);
				const $that = $(that);

				if (that != null && $this.html() == $that.html() &&
					($this.prev().html() == $that.prev().html())) {
					const rowspan = Number($that.attr("rowspan") || 1) + 1 - addCnt;
					$that.attr("rowspan", rowspan);
					$this.addClass('hide-col').hide(); // Add class and hide for consistency / 일관성을 위해 클래스 추가 및 숨김
				} else {
					that = this;
				}
			});
		});		
	});	
};
/**
 * Merge vertically adjacent cells (rowspan) — skips rows with colspan and empty cells.
 * 수직 인접 셀을 병합합니다 (rowspan) — colspan이 있는 행과 빈 셀을 건너뜁니다.
 *
 * @param {number} colIdx - Column index / 열 인덱스
 * @param {number} [isStats] - Stat adjustment / 통계 조정
 * @returns {jQuery} this / this
 */
$.fn.rowspan2 = function(colIdx, isStats) {
    const addCnt = (isStats == null) ? 0 : isStats * 1;
    
    return this.each(function() {
        let that = null;
        
        $(this).children('tr').not('.hide-row').each(function() {
            const $tr = $(this);
            const $td = $tr.children('td, th').eq(colIdx);

            const isColspanRow = $tr.children('[colspan]').length > 0;

            if (isColspanRow) {
                that = null;
                return;
            }

            $td.each(function() {
                const $this = $(this);
                const $that = $(that);

                if (that != null && $this.html() == $that.html() && $this.html().trim() !== "") {
                    const rowspan = Number($that.attr("rowspan") || 1) + 1;
                    $that.attr("rowspan", rowspan);
                    $this.addClass('hide-col').hide();
                } else {
                    that = this;
                }
            });
        });
    });
};
/**
 * Undo rowspan merging for the given column — restore hidden cells.
 * 지정된 열의 rowspan 병합을 취소합니다 — 숨겨진 셀을 복원합니다.
 *
 * @param {number} colIdx - Column index to un-merge / 병합 해제할 열 인덱스
 * @returns {jQuery} this / this
 */
$.fn.unrowspan = function(colIdx) {
	return this.each(function() {
		$(this).children('tr').each(function() {
			const rowspanCell = $(this).children('td, th').eq(colIdx);
			if (rowspanCell.attr('rowspan')) {
				const rowspanCount = Number(rowspanCell.attr('rowspan'));
				rowspanCell.removeAttr('rowspan');
				
				let nextRow = $(this).next();
				for (let i = 1; i < rowspanCount; i++) {
					let targetCell = nextRow.children('td, th').eq(colIdx);
					targetCell.removeClass('hide-col').show(); // Remove class and show / 클래스 제거 및 표시
					nextRow = nextRow.next();
				}
			}
		});
	});
};
/**
 * Merge horizontally adjacent cells with identical content in the given row (colspan).
 * 지정된 행에서 동일한 내용을 가진 수평 인접 셀을 병합합니다 (colspan).
 *
 * @param {number} rowIdx - Row index to merge / 병합할 행 인덱스
 * @param {number} [isStats] - Stat adjustment / 통계 조정
 * @returns {jQuery} this / this
 */
$.fn.colspan = function(rowIdx, isStats) {
	const addCnt = (isStats == null) ? 0 : isStats * 1;
	return this.each(function() {
		let that;
		const $tr = $(this).children('tr').eq(rowIdx);
		if ($tr.hasClass('hide-row')) return;

		$tr.children('td, th').not('.hide-col').each(function() {
			const $this = $(this);
			const $that = $(that);
			
			if (that != null && $this.html() == $that.html() &&
				($this.closest('tr').prev().children('td, th').eq($this.index()).html() ==
				$that.closest('tr').prev().children('td, th').eq($that.index()).html())) {
				
				var colspan = Number($that.attr("colspan") || 1) + 1 - addCnt;
				$that.attr("colspan", colspan);
				$this.addClass('hide-col').hide();
			} else {
				that = this;
			}
		});
	});
};
/**
 * Merge horizontally adjacent cells (colspan) — simplified version without parent-row check.
 * 수평 인접 셀을 병합합니다 (colspan) — 부모 행 확인이 없는 간소화 버전.
 *
 * @param {number} rowIdx - Row index / 행 인덱스
 * @param {number} [isStats] - Stat adjustment / 통계 조정
 * @returns {jQuery} this / this
 */
$.fn.colspan2 = function(rowIdx, isStats) {
	const addCnt = (isStats == null) ? 0 : isStats * 1;
	return this.each(function() {
		let that;
		const $tr = $(this).children('tr').eq(rowIdx);
		if ($tr.hasClass('hide-row')) return;

		$tr.children('td, th').not('.hide-col').each(function() {
			const $this = $(this);
			const $that = $(that);
			
			if (that != null && $this.html() == $that.html()) {
				const colspan = Number($that.attr("colspan") || 1) + 1 - addCnt;
				$that.attr("colspan", colspan);
				$this.addClass('hide-col').hide();
			} else {
				that = this;
			}
		});
	});
};

/**
 * Select a text range within an input/textarea element.
 * input/textarea 요소 내 텍스트 범위를 선택합니다.
 *
 * @param {number} start - Selection start position / 선택 시작 위치
 * @param {number} [end=start] - Selection end position / 선택 끝 위치
 * @returns {jQuery} this / this
 */
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

/**
 * Initialize Select2 or Materialize FormSelect on <select> elements based on attributes.
 * 속성에 따라 <select> 요소에 Select2 또는 Materialize FormSelect를 초기화합니다.
 *
 * Uses attribute [select2] for Select2, [formselect] for Materialize FormSelect.
 * Select2는 [select2] 속성, Materialize FormSelect는 [formselect] 속성을 사용합니다.
 *
 * @param {Object} [defaultOption={}] - Override options for select2/formSelect / select2/formSelect 옵션 오버라이드
 * @returns {jQuery} this (chainable) / this (체이닝 가능)
 */
$.fn.auSelect = function(defaultOption = {}) {
    const settings = $.extend(true, {
        select2: {
            dropdownAutoWidth: true,
            minimumResultsForSearch: 10
        },
        formSelect: {
            dropdownOptions: {
                container: document.body,
                coverTrigger: false
            }
        }
    }, defaultOption);

    return this.each(function() {
        const $select = $(this);
        const el = this;

        const hasSelect2Attr = el.hasAttribute("select2");
        const hasFormSelectAttr = el.hasAttribute("formselect");

        if (hasSelect2Attr) {
            if ($select.data('select2')) {
                $select.select2('destroy');
            }
            // Pass hasSelectAll to Select2 with i18n label
            // hasSelectAll을 다국어 라벨과 함께 Select2에 전달
            if (settings.hasSelectAll) {
                settings.select2.hasSelectAll = true;
                settings.select2.selectAllText = (typeof _msg !== 'undefined' && _msg['cm_select_all']) || 'Select All';
            }
            // multiple select: keep dropdown open after selection
            // multiple select: 선택 후 드롭다운 닫히지 않도록 설정
            if (el.multiple) {
                settings.select2.closeOnSelect = false;
            }
            $select.select2(settings.select2);
        } else if (hasFormSelectAttr) {
            const inst = M.FormSelect.getInstance(el);
            if (inst) inst.destroy();
            $select.formSelect(settings.formSelect);
        }
    });
};

/* ── Number & String Formatting / 숫자 및 문자열 포맷팅 ── */

/**
 * Format a number with comma separators (e.g., 1000 → "1,000").
 * 숫자에 쉼표 구분자를 추가합니다 (예: 1000 → "1,000").
 *
 * @param {number|string} value - Number to format / 포맷할 숫자
 * @param {string} [emptyStr="0"] - Return value for null/empty/zero/NaN / null/빈값/0/NaN 시 반환값
 * @returns {string} Formatted string / 포맷된 문자열
 */
au.addComma = function(value, emptyStr = "0"){
	if (value === null || value === undefined) return emptyStr;
	if (typeof value === "string") value = value.trim();
	if (value === "" || value === "0" || isNaN(value)) return emptyStr;
	const str = String(value);
	const parts = str.split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
}

/**
 * Decode HTML entities back to their original characters (XSS reverse).
 * HTML 엔티티를 원래 문자로 디코딩합니다 (XSS 역변환).
 *
 * Handles: &amp; &lt; &gt; &le; &ge; &plusmn; &middot; &Delta; &ordm; &times; &darr; &uarr; etc.
 *
 * @param {string} str - HTML-encoded string / HTML 인코딩된 문자열
 * @returns {string} Decoded string / 디코딩된 문자열
 */
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

/**
 * Escape HTML special characters to prevent XSS.
 * XSS 방지를 위해 HTML 특수 문자를 이스케이프합니다.
 *
 * @param {string} str - Raw string / 원본 문자열
 * @returns {string} Escaped string / 이스케이프된 문자열
 */
au.escapeHtml = function(str){
	const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, function(m) { return map[m]; });
}

/* ── Datepicker & Monthpicker / 날짜선택기 & 월선택기 ── */

/**
 * Initialize Materialize datepickers within a container. Reads 8-digit (YYYYMMDD) values
 * from inputs and sets them as the default date. Writes selected date to data-target input.
 * 컨테이너 내 Materialize 날짜선택기를 초기화합니다. 입력에서 8자리(YYYYMMDD) 값을 읽어
 * 기본 날짜로 설정합니다. 선택된 날짜를 data-target 입력에 기록합니다.
 *
 * @example
 * au.fnSetDatepicker()               // All .datepicker on page / 페이지 전체
 * au.fnSetDatepicker("#cardcont1")   // Only within #cardcont1 / #cardcont1 내부만
 *
 * @param {string} [parentEl] - Parent container selector / 부모 컨테이너 셀렉터
 */
au.fnSetDatepicker = function(parentEl) {
    const $parent = (parentEl && $(parentEl).length > 0) ? $(parentEl) : $(document);
    
    $parent.find(".datepicker").each(function(idx, o) {
        const instance = M.Datepicker.getInstance(o);
        if(!instance) {
            const $o = $(o); 
            const dateStr = $o.val();
    
            let date = null;
            if(dateStr && dateStr.length === 8) {
                const year = parseInt(dateStr.substring(0, 4), 10);
                const month = parseInt(dateStr.substring(4, 6), 10) - 1;
                const day = parseInt(dateStr.substring(6, 8), 10);
                date = new Date(year, month, day);
            }

            $o.datepicker({
                format: "mm-dd-yyyy",
                autoClose: true, 
                showOtherMonths: true,
                changeYear: true,
                changeMonth: true,
                defaultDate: date,
                setDefaultDate: !!date,
                container: $o.closest(".modal").length > 0 ? $o.closest(".modal")[0] : document.body,
                i18n: {
                    months: au.i18nDate[_lang]["months"],
                    monthsShort: au.i18nDate[_lang]["monthsShort"],
                    weekdays: au.i18nDate[_lang]["weeks"],
                    weekdaysShort: au.i18nDate[_lang]["weeksShort"],
                    weekdaysAbbrev: au.i18nDate[_lang]["weeksAbbrev"],
                    cancel: au.i18nDate[_lang]["cancel"],
                    done: au.i18nDate[_lang]["done"]
                },
                onSelect: function(selectedDate) {
                    const y = selectedDate.getFullYear();
                    const m = ("0" + (selectedDate.getMonth() + 1)).slice(-2);
                    const d = ("0" + selectedDate.getDate()).slice(-2);
                    const dateOrg = y + m + d;
                
                    const targetName = $o.attr("data-target");
                    if(targetName) {
                        $("[name='" + targetName + "']").val(dateOrg).trigger("change");
                    }
                }
            });
        }
    });
};

/**
 * Initialize Materialize month pickers within a container.
 * 컨테이너 내 Materialize 월 선택기를 초기화합니다.
 *
 * @param {string} [parentEl] - Parent container selector / 부모 컨테이너 셀렉터
 */
au.fnSetMonthpicker = function(parentEl) {
	const targetEl = (au.NVL(parentEl) == "" ? ".monthpicker" : parentEl+" .monthpicker");
	
	$(targetEl).each(function(idx, o) {
		const dateStr = $(o).val();
		// 빈 값이면 NaN 방지를 위해 기본 날짜 사용
		// Use default date for empty values to prevent NaN
		const year = parseInt(dateStr.substring(0, 4), 10);
		const month = parseInt(dateStr.substring(4, 6), 10) - 1; // JS는 0~11
		const day = parseInt(dateStr.substring(6, 8), 10);
		const date = isNaN(year) || isNaN(month) ? new Date() : new Date(year, month, day || 1);
		$(o).datepicker({ 
			format: "mmm, yyyy",
			autoClose: true, 
			showOtherMonths: true,
			changeYear: true,
			changeMonth: true,
			defaultDate: date,
			setDefaultDate: true,
			container: document.body,
			i18n: {
				months: au.i18nDate[_lang]["months"],
				monthsShort: au.i18nDate[_lang]["monthsShort"],
				weekdays: au.i18nDate[_lang]["weeks"],
				weekdaysShort: au.i18nDate[_lang]["weeksShort"],
				weekdaysAbbrev: au.i18nDate[_lang]["weeksAbbrev"],
				cancel: au.i18nDate[_lang]["cancel"],
				done: au.i18nDate[_lang]["done"]
			},
			onSelect: function(date) {
				const dateOrg = date.format("YYYYMM");
			
				let $target = $("[name='"+$(o).attr("data-target")+"']");
				$target.val(dateOrg);
			}
		});
	});
}

/* ── Loading Spinner Control / 로딩 스피너 제어 ── */

/**
 * (Internal) Cached DOM references for global loading spinner (lazy-initialized).
 * (내부) 전역 로딩 스피너 DOM 참조 캐시 (지연 초기화).
 */
au._$loading = null;
au._getLoading = function() {
	if (!au._$loading || !au._$loading.length) {
		au._$loading = $(".loading_spin");
	}
	return { $el: au._$loading };
};

/**
 * Show/hide the global loading spinner. Uses a reference counter so nested calls are safe.
 * 전역 로딩 스피너를 표시/숨깁니다. 참조 카운터를 사용하므로 중첩 호출이 안전합니다.
 *
 * @param {string|boolean} type - "on"/"off"/"reset" (or true/false/"y"/"n") / "on"/"off"/"reset"
 * @param {number} [cnt=1] - Counter increment/decrement amount / 카운터 증감량
 */
au.fnSetLoading = function(type, cnt = 1) {
	type = typeof type == "string" ? type.toLowerCase() : type;
	const $loading = au._getLoading().$el;
	if(type === "on" || type === true || type === "y") {
		globalCnt.loading += cnt;
		// Cancel any pending hide timer / 대기 중인 숨기기 타이머 취소
		clearTimeout(au._loadingHideTimer);
		$loading.stop().removeClass("fade-out").css("opacity", "").show();
		au._loadingShownAt = Date.now();
	} else if(type === "off" || type === false || type === "n") {
		globalCnt.loading -= cnt;
		if(globalCnt.loading <= 0) {
			globalCnt.loading = 0;
			// Anti-flicker: ensure minimum 300ms display / 최소 300ms 표시 보장
			const elapsed = Date.now() - (au._loadingShownAt || 0);
			const delay = Math.max(0, 300 - elapsed);
			clearTimeout(au._loadingHideTimer);
			au._loadingHideTimer = setTimeout(function() {
				// Guard: skip if counter increased again / 카운터가 다시 증가했으면 건너뜀
				if (globalCnt.loading > 0) return;
				$loading.stop().fadeOut(100);
			}, delay);
		}
	} else if(type === "reset" || type === "init") {
		globalCnt.loading = 0;
		clearTimeout(au._loadingHideTimer);
		$loading.stop().hide().removeClass("fade-out");
	}
};

/**
 * Track AJAX request count (without spinner). Used by fnPageReload to wait for completion.
 * AJAX 요청 수를 추적합니다 (스피너 없음). fnPageReload에서 완료 대기에 사용됩니다.
 *
 * @param {string|boolean} type - "on"/"off"/"reset" / "on"/"off"/"reset"
 * @param {number} [cnt=1] - Counter amount / 카운터 양
 */
au.fnSetAjax = function(type, cnt = 1) {
	type = typeof type == "string" ? type.toLowerCase() : type; 
	if(type === "on" || type === true || type === "y") {
		globalCnt.ajax += cnt;
	} else if(type === "off" || type === false || type === "n") {
		globalCnt.ajax -= cnt;
	} else if(type === "reset" || type === "init") {
		globalCnt.ajax = 0;
	}
};
/**
 * Show/hide a partial (section-level) loading overlay on a target element.
 * 대상 요소에 부분(섹션 레벨) 로딩 오버레이를 표시/숨깁니다.
 * Auto-scales flask icon based on target height. Removes DOM on hide to prevent accumulation.
 * Anti-flicker: minimum 300ms display. GPU-accelerated CSS transition fadeOut.
 * 대상 높이에 따라 플라스크 아이콘 크기를 자동 조절합니다. 숨길 때 DOM에서 제거하여 누적을 방지합니다.
 * 깜빡임 방지: 최소 300ms 표시. GPU 가속 CSS 전환 fadeOut.
 *
 * @param {string} target - CSS selector of the target element / 대상 요소 CSS 셀렉터
 * @param {string|boolean} type - "on"/"off" / "on"/"off"
 * @param {number} [cnt=1] - Counter amount / 카운터 양
 */
au.fnSetLoadingPartial = function(target, type, cnt = 1) {
	type = typeof type == "string" ? type.toLowerCase() : type;
	let $loading = null;
	const shownKey = "_lps_" + target;
	globalCnt[target] ??= 0;
	if(type === "on" || type === true || type === "y") {
		globalCnt[target] += cnt;
		// Cancel any pending hide timer / 대기 중인 숨기기 타이머 취소
		const hideKey = "_lph_" + target;
		clearTimeout(au[hideKey]);
		$loading = $(target).siblings(".loading_spin2");
		if($loading.length == 0) {
			$loading = $(".loading_spin2").eq(0).clone();
		}
		if($loading.length) {
			$(target).before($loading);
			$loading.find(".box").css("border-radius", $loading.next().css("border-radius"));
			$loading.stop().show();
			au[shownKey] = Date.now();
		}
	} else if(type === "off" || type === false || type === "n") {
		globalCnt[target] -= cnt;
		$loading = $(target).siblings(".loading_spin2");
		if($loading.length) {
			if(globalCnt[target] <= 0) {
				globalCnt[target] = 0;
				// Anti-flicker: ensure minimum 300ms display / 최소 300ms 표시 보장
				const elapsed = Date.now() - (au[shownKey] || 0);
				const delay = Math.max(0, 300 - elapsed);
				const hideKey = "_lph_" + target;
				clearTimeout(au[hideKey]);
				au[hideKey] = setTimeout(function() {
					// Guard: skip if counter increased again / 카운터가 다시 증가했으면 건너뜀
					if ((globalCnt[target] || 0) > 0) return;
					$loading.stop().fadeOut(100);
					delete globalCnt[target];
					delete au[shownKey];
					delete au[hideKey];
				}, delay);
			}
		}
	}
};

/* ── Miscellaneous Utilities / 기타 유틸리티 ── */

/**
 * Escape special regex characters in a string for safe use in RegExp.
 * 문자열의 정규식 특수 문자를 이스케이프하여 RegExp에서 안전하게 사용합니다.
 *
 * @param {string} str - Input string / 입력 문자열
 * @returns {string} Escaped string / 이스케이프된 문자열
 */
au.escapeRegExp = function(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Log the current call stack to the console (for debugging).
 * 현재 호출 스택을 콘솔에 출력합니다 (디버깅용).
 */
au.consoleStack = function() {
	try {
		throw new Error('apis_util.js > consoleStack()');
	} catch (e) {
		console.log(e.stack);
	}
};

/**
 * Convert zero values to a replacement string (non-zero and non-numeric pass through).
 * 0인 값을 대체 문자열로 변환합니다 (0이 아니거나 숫자가 아닌 값은 그대로 통과).
 *
 * @param {*} val - Value to check / 검사할 값
 * @param {string} [replace] - Replacement for zero / 0일 때 대체값
 * @returns {*} Original value or replacement / 원본 값 또는 대체값
 */
au.zeroConv = function(val, replace) {
	if(isNaN(parseFloat(val))) {
		return val;
	} else if(parseFloat(val) == 0) {
		return au.NVL(replace);
	} else {
		return val;
	}
};

/**
 * Export an HTML <table> to an Excel (.xlsx) file download.
 * HTML <table>을 Excel(.xlsx) 파일로 내보내기합니다.
 *
 * Requires the XLSX (SheetJS) library. Replaces inputs/selects/images with their text values.
 * XLSX(SheetJS) 라이브러리가 필요합니다. input/select/이미지를 텍스트 값으로 대체합니다.
 *
 * @param {HTMLElement|jQuery} obj - Table DOM element or jQuery object / 테이블 DOM 요소 또는 jQuery 객체
 * @param {string} [fileNm="EXPORT"] - File name prefix / 파일명 접두사
 */
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
		console.error("Excel Download Failed. Need xlsx.full.min.js\r\n"+e); 
	}
};

/**
 * Move focus to the next/previous row on Enter/Shift+Enter in a table input/select.
 * 테이블 input/select에서 Enter/Shift+Enter 시 다음/이전 행으로 포커스를 이동합니다.
 *
 * Only applies to rows with the "enter_tr" attribute. Rows without it are skipped.
 * "enter_tr" 속성이 있는 행에만 적용됩니다. 속성이 없는 행은 건너뜁니다.
 *
 * @example <tr enter_tr><td><input type="text"></td></tr>
 * @param {KeyboardEvent} e - Keyboard event / 키보드 이벤트
 * @param {number} [maxSkip=10] - Maximum rows to skip when searching / 검색 시 최대 건너뛸 행 수
 */
au.setEnterMoveInTableEvent = function(e, maxSkip = 10) {
	if(e.key == "Enter" && !e.shiftKey) { // ENTER키 이벤트
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
	} else if(e.key == "Enter" && e.shiftKey) { // Shift+ENTER키 이벤트
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
			$prevRow = $prevRow.prev("tr").length ? $prevRow.prev("tr") : $tbody.find("tr").last();
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
};

/**
 * Debounce a function — delays execution until after the specified delay with no new calls.
 * 함수를 디바운스합니다 — 지정된 지연 시간 동안 새 호출이 없을 때까지 실행을 지연합니다.
 *
 * @param {Function} func - Function to debounce / 디바운스할 함수
 * @param {number} [delay=200] - Delay in ms / 지연 시간(ms)
 * @returns {Function} Debounced function / 디바운스된 함수
 */
au.debounce = function(func, delay=200) {
	let timer;
	return function() {
		const args = arguments;
		clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(this, args);
		}, delay);
	}
};

/* ── Page Lifecycle / 페이지 생명주기 ── */

/**
 * Reload the current page after all pending AJAX requests complete.
 * 진행 중인 모든 AJAX 요청이 완료된 후 현재 페이지를 다시 로드합니다.
 *
 * Saves scroll position to sessionStorage for restoration after reload.
 * 리로드 후 복원을 위해 스크롤 위치를 sessionStorage에 저장합니다.
 *
 * @param {number} [time=100] - Retry interval in ms / 재시도 간격(ms)
 * @param {number} [cnt=100] - Max retry count / 최대 재시도 횟수
 */
au.fnPageReload = function(time = 100, cnt = 100) {
	// 최초 호출 시에만 로딩 카운터 증가 — 이후 재귀 호출에서는 중복 증가 방지
	// Increment loading counter only on first call — prevent duplicate increments in recursive calls
	if (cnt === 100) {
		au.fnSetLoading("on");
	}
	if(typeof isPageCloseCalled !== "undefined" && isPageCloseCalled === true) {
		au.fnSetLoading("off");
		return false;
	}
	if (($.active == 0 && globalCnt.ajax == 0 && globalCnt.loading <= 1) || cnt == 0) {
		sessionStorage.setItem("pageReloadScrollY", window.scrollY);
		// Programmatic reload — skip the unsaved-changes confirm exactly once.
		// 코드 트리거 reload — 다음 beforeunload 한 번 skip해 confirm 안 띄움.
		au.bypassUnsavedGuardOnce();
		location.replace(location.href);
	} else {
		setTimeout(function(){au.fnPageReload(time, --cnt);},time);
	}
};

/**
 * Programmatic navigation to a new URL via location.replace, with unsaved-changes guard bypass.
 * Use whenever code (not user input) triggers a URL change so the beforeunload confirm
 * does not appear (e.g., right after save when redirecting to the new entity's detail URL).
 *
 * 코드 트리거 URL 이동용 공통 함수. location.replace 직전 dirty 가드를 1회 우회하여
 * 저장 후 새 ID URL로 이동하는 케이스 등에서 beforeunload confirm이 뜨지 않도록 함.
 * @param {string} url - Target URL / 이동할 URL
 */
au.fnPageReplace = function(url) {
	au.bypassUnsavedGuardOnce();
	location.replace(url);
};

/**
 * Close the current window after all pending AJAX requests complete.
 * 진행 중인 모든 AJAX 요청이 완료된 후 현재 창을 닫습니다.
 *
 * @param {number} [time=100] - Retry interval in ms / 재시도 간격(ms)
 * @param {number} [cnt=100] - Max retry count / 최대 재시도 횟수
 */
au.fnPageClose = function(time = 100, cnt = 100) {
	if (($.active == 0 && globalCnt.ajax == 0 && globalCnt.loading == 0) || cnt == 0) {
		au.fnSetLoading("off");
		window.close();
	} else {
		setTimeout(() => {au.fnPageClose(time, --cnt);},time);
	}
};

/**
 * Post-reload handler — restores scroll position after page reload completes.
 * 리로드 후 처리기 — 페이지 리로드 완료 후 스크롤 위치를 복원합니다.
 *
 * @param {number} [time=100] - Retry interval in ms / 재시도 간격(ms)
 * @param {number} [cnt=100] - Max retry count / 최대 재시도 횟수
 */
au.fnPageReloadAfter = function(time = 100, cnt = 100) {
	if (($.active == 0 && globalCnt.ajax == 0 && globalCnt.loading == 0) || cnt == 0) {
		//M.toast({ html: "Data Loaded", classes: "success", displayLength: 1500 });
		const scrollY = sessionStorage.getItem("pageReloadScrollY");
		if (scrollY !== null) {
			setTimeout(() => {
				window.scrollTo({
					top: parseInt(scrollY, 10),
					behavior: "smooth"
				});
				sessionStorage.removeItem("pageReloadScrollY");
			}, 0);
		}
	} else {
		setTimeout(() =>{au.fnPageReloadAfter(time, --cnt);},time);
	}
};

/**
 * Convert a number to ordinal format (e.g., 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th").
 * 숫자를 서수 형식으로 변환합니다 (예: 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th").
 *
 * @param {number|string} val - Number to convert / 변환할 숫자
 * @returns {string} Ordinal string / 서수 문자열
 * @throws {Error} If val is not a number / val이 숫자가 아닌 경우
 */
au.fnAddOrdinalSuffix = function(val) {
	const num = parseInt(val, 10);
	
	if (isNaN(num)) {
		throw new Error("Parameter should be number");
	}

	const suffixes = ["th", "st", "nd", "rd"];
	const value = Math.abs(num) % 100;
	const lastDigit = value % 10;

	if (value >= 11 && value <= 13) {
		return `${num}th`;
	}

	return `${num}${suffixes[lastDigit]||"th"}`;
};

/**
 * Extend a parameter object with pagination fields (for SQL Server paging queries).
 * 파라미터 객체에 페이징 필드를 추가합니다 (SQL Server 페이징 쿼리용).
 *
 * @param {Object} param - Base parameter object / 기본 파라미터 객체
 * @param {number} pageNo - Current page number (1-based) / 현재 페이지 번호 (1부터)
 * @param {number} [pageSize=30] - Records per page / 페이지당 레코드 수
 * @returns {Object} Extended parameter with paging fields / 페이징 필드가 추가된 파라미터
 */
au.fnGetPagingParam = function(param, pageNo, pageSize) {
	pageSize = pageSize || 30;
	$.extend(param,{
		pageSize: pageSize,
		pageNo: pageNo,
		firstIndex: pageSize * (pageNo - 1) + 1,
		lastIndex: pageSize * pageNo,
		PAGE_SIZE: pageSize,
		PAGE_NO: pageNo,
		FIRST_INDEX: pageSize * (pageNo - 1) + 1,
		LAST_INDEX: pageSize * pageNo
	});
	
	return param;
};

/* ── File Upload & Management / 파일 업로드 및 관리 ── */

/**
 * Retrieve the list of attached files for a given file ID.
 * 지정된 파일 ID에 대한 첨부 파일 목록을 조회합니다.
 *
 * @param {string} fileId - File group ID / 파일 그룹 ID
 * @param {Function} callbackSuccess - Success callback receiving file list / 파일 목록을 받는 성공 콜백
 * @param {boolean} [async=true] - Whether to use async request / 비동기 요청 사용 여부
 * @param {Function} [callbackError] - Error callback / 에러 콜백
 */
au.fnGetFileList = function(fileId, callbackSuccess, async = true, callbackError){
	if(!fileId){
		alert("Must need file ID");
		return;
	}
	if(!callbackSuccess){
		alert("Must need callbackSuccess Function");
		return;
	}

	const param = {
		id: fileId
	};
	
	let ajaxCall = null;  
	if(async) {
		ajaxCall = au.ajaxPost2;
	} else {
		ajaxCall = au.ajaxPostNonAsync;
	}
	ajaxCall("/api/file/getFileListAjax", param, 
		function(response) {
			if(!response) return;
			
			callbackSuccess(response);
			
			/*
			if($('input:file').length > 0){
				$('input:file').parent().find(".MultiFile-wrap").MultiFile('reset');
			}
			*/
		},
		function() {
			if(callbackError) {
				callbackError();
			}
			alert("Error Occurred: au.fnGetFileList");
		}
	);
};

/**
 * Initialize multi-file upload on an input element (all file types).
 * 입력 요소에 다중 파일 업로드를 초기화합니다 (모든 파일 유형).
 *
 * @param {string} target - File input selector / 파일 입력 셀렉터
 * @param {string} list - File list display selector / 파일 목록 표시 셀렉터
 * @param {number} [maxCnt=10] - Maximum file count / 최대 파일 수
 * @param {Function} [appendCb] - Callback after file appended / 파일 추가 후 콜백
 * @param {Function} [removeCb] - Callback after file removed / 파일 제거 후 콜백
 */
au.MultiFileUpload = function(target, list, maxCnt = 10, appendCb, removeCb) {
	$(target).attr("multiple", "multiple");
	// Spring multipart 한도(KB) — common.html basicinfo의 _uploadLimits 사용. 누락 시 의도적으로 ReferenceError 발생 (silent fallback 회피)
	// Spring multipart limits (KB) — uses _uploadLimits from common.html basicinfo. Intentionally throws ReferenceError if missing (no silent fallback)
	$(target).MultiFile({
		max: maxCnt,
		//accept: '', // allowed ext
		maxfile: _uploadLimits.maxFileKB,
		maxsize: _uploadLimits.maxRequestKB,
		STRING: {
			remove: '<i class="material-icons tiny mr5 btn_removeFile">close</i>',
			duplicate: _msg["cm_file_duplicate"] || "[$file] is already attached.",
			denied: _msg["cm_file_denied_ext"] || "Files with the extension [$ext] are not allowed.",
			selected: _msg["cm_file_selected"] || "[$file] has been selected.",
			toomuch: _msg["cm_file_size_exceeded"] || "Upload size limit exceeded. ($size)",
			toomany: _msg["cm_file_max_count"] || "You can upload up to $max file(s).",
			toobig: _msg["cm_file_too_big"] || "This file exceeds the maximum allowed size. ($size)"

		},
		list: list,
		afterFileAppend: appendCb,
		afterFileRemove: removeCb
	});
};
/**
 * Initialize multi-file upload for image files only (jpg, jpeg, png, gif, webp, bmp, svg).
 * 이미지 파일만 허용하는 다중 파일 업로드를 초기화합니다.
 *
 * @param {string} target - File input selector / 파일 입력 셀렉터
 * @param {string} list - File list display selector / 파일 목록 표시 셀렉터
 * @param {number} [maxCnt=10] - Maximum file count / 최대 파일 수
 * @param {Function} [appendCb] - Callback after file appended / 파일 추가 후 콜백
 * @param {Function} [removeCb] - Callback after file removed / 파일 제거 후 콜백
 */
au.MultiFileUploadImage = function(target, list, maxCnt = 10, appendCb, removeCb) {
	$(target).attr("multiple", "multiple");
	// Spring multipart 한도(KB) — common.html basicinfo의 _uploadLimits 사용. 누락 시 의도적으로 ReferenceError 발생 (silent fallback 회피)
	// Spring multipart limits (KB) — uses _uploadLimits from common.html basicinfo. Intentionally throws ReferenceError if missing (no silent fallback)
	$(target).MultiFile({
		max: maxCnt,
		accept: 'jpg|jpeg|png|gif|webp|bmp|svg', // allowed ext
		maxfile: _uploadLimits.maxFileKB,
		maxsize: _uploadLimits.maxRequestKB,
		STRING: {
			remove: '<i class="material-icons tiny mr5 btn_removeFile">close</i>',
			duplicate: _msg["cm_file_duplicate"] || "[$file] is already attached.",
			denied: _msg["cm_file_denied_ext_img"] || "Files with the extension [$ext] are not allowed.\r\n※ Allowed extension: jpg, jpeg, png, gif, webp, bmp, svg",
			selected: _msg["cm_file_selected"] || "[$file] has been selected.",
			toomuch: _msg["cm_file_size_exceeded"] || "Upload size limit exceeded. ($size)",
			toomany: _msg["cm_file_max_count"] || "You can upload up to $max file(s).",
			toobig: _msg["cm_file_too_big"] || "This file exceeds the maximum allowed size. ($size)"

		},
		list: list,
		afterFileAppend: appendCb,
		afterFileRemove: removeCb
	});
};

/**
 * Upload all selected files from a file wrapper container to the server.
 * 파일 래퍼 컨테이너에서 선택된 모든 파일을 서버에 업로드합니다.
 *
 * @param {string} fileWrapper - Container selector holding file inputs / 파일 입력을 포함하는 컨테이너 셀렉터
 * @param {Object} param - Upload params { file_id, ref_table, ref_column } / 업로드 파라미터
 * @param {Function} callbackFunc - Callback on success / 성공 시 콜백
 * @param {Function} [errCbFunc] - Optional explicit error callback (xhr). If omitted, callbackFunc(null) is invoked so existing Promise wrappers (`if(fileId) resolve else reject`) trigger their reject path — preventing loading-spinner leak when upload fails.
 *                                  선택적 명시 에러 콜백(xhr). 미지정 시 callbackFunc(null) 호출 → 기존 Promise wrapper 패턴(`if(fileId) resolve else reject`)의 reject 경로 트리거 → 업로드 실패 시 로딩 스피너 누수 방지.
 */
au.fnUploadAttachFile = function(fileWrapper, param, callbackFunc, errCbFunc){
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
		callbackFunc();
		au.fnSetLoading("off");
		return false;
	}

	$.ajax({
		url: "/api/file/uploadAttachFileAjax",
		type: "POST",
		data: data,
		processData: false,
		contentType: false,
		complete: function()	{
			try { $(fileWrapper).MultiFile('reset'); } catch(e) { /* MultiFile not initialized */ }
			au.fnSetLoading("off");
		},
		success: callbackFunc,
		error: function(xhr) {
			console.error("[File Upload Error]", xhr.status, xhr.responseText);
			if (errCbFunc) {
				// 명시적 에러 콜백이 있으면 호출자가 alert/cleanup 직접 처리
				// Explicit error callback provided — caller handles alert/cleanup
				errCbFunc(xhr);
			} else if (callbackFunc) {
				// 401(세션 만료)은 au.errorAlert 내부에서 /login?auth 리다이렉트 처리 — 우선 분기로 보존
				// 401 (session expired): preserved via au.errorAlert which redirects to /login?auth
				if (xhr.status === 401) {
					au.errorAlert(xhr);
					return;
				}
				// 기존 wrapper 패턴(`if(fileId) resolve else reject`)의 reject 경로 트리거
				// → orchestrator의 catch/finally가 실행되어 외부 fnSetLoading("on")이 정상 해제됨
				// orchestrator catch가 자체적으로 "File upload failed" Swal을 띄우므로 여기서 errorAlert 호출 시 알림 중복 발생 → 호출 안 함
				// Triggers existing wrapper's reject path → orchestrator catch/finally runs → external loading counter released
				// Skipping errorAlert here to avoid duplicate Swal (orchestrator catch shows its own "File upload failed" alert)
				callbackFunc(null);
			} else {
				au.errorAlert(xhr);
			}
		}
	});
};

/**
 * Returns Summernote editor default options, optionally merged with overrides.
 * Summernote 에디터 기본 옵션을 반환하며, overrides가 있으면 deep merge합니다.
 *
 * @param {Object} [overrides] - Options to override defaults / 기본값을 덮어쓸 옵션
 * @returns {Object} Summernote options / Summernote 옵션 객체
 *
 * Usage:
 *   $('#editor').summernote(au.snEditorOptions());
 *   $('#editor').summernote(au.snEditorOptions({ height: 300, callbacks: { ... } }));
 */
au.snEditorOptions = function(overrides) {
	const defaults = {
		tabsize: 2,
		height: 306,
		placeholder: (_msg && _msg["cm_contents"]) || "Contents",
		toolbar: [
			['clear', ['clear']],
			['style', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript']],
			['font', ['fontname', 'fontsize']],
			['color', ['forecolor', 'backcolor']],
			['para', ['height', 'paragraph', 'ul', 'ol']],
			['insert', ['table', 'link', 'picture']],
			['view', ['undo', 'redo', 'codeview']],
			['help', ['help']],
		],
		lineHeights: ['0.8', '1.0', '1.2', '1.4', '1.6', '1.8', '2.0', '3.0'],
		fontSizes: ['8', '9', '10', '11', '12', '13', '14', '16', '18', '20', '22', '24', '28', '32', '36', '40', '50', '60', '70', '80', '90', '100'],
		tabDisable: true,
		dialogsInBody: true
	};
	return overrides ? $.extend(true, {}, defaults, overrides) : defaults;
};

/**
 * Upload files from a Summernote editor (image paste/drag-drop) and insert as images.
 * Summernote 에디터의 파일(이미지 붙여넣기/드래그앤드롭)을 업로드하고 이미지로 삽입합니다.
 *
 * @param {FileList} files - Files from editor event / 에디터 이벤트의 파일 목록
 * @param {HTMLElement} editorEl - Summernote editor element / Summernote 에디터 요소
 * @param {Object} param - Upload params { ref_table, ref_column, upload_type } / 업로드 파라미터
 */
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
		error: function(xhr) {
			console.error("[File Upload Error]", xhr.status, xhr.responseText);
			au.errorAlert(xhr);
		}
	});
};

/**
 * Delete a specific file attachment by file ID and sequence number.
 * 파일 ID와 순번으로 특정 첨부 파일을 삭제합니다.
 *
 * @param {string} fileId - File group ID / 파일 그룹 ID
 * @param {number} fileSeq - File sequence number / 파일 순번
 * @param {Function} callbackSuccess - Success callback / 성공 콜백
 */
au.fnDeleteFile = function(fileId, fileSeq, callbackSuccess){
	const param = {
		id: fileId, 
		seq: fileSeq
	};
	au.ajaxPost("/api/file/deleteFileAjax", param, 
		callbackSuccess, 
		function() {
			alert("Error Occurred");
		}
	);
};

/**
 * Download a file via fetch, showing Swal alert if file not found.
 * fetch를 통해 파일을 다운로드하며, 파일을 찾을 수 없으면 Swal 알림을 표시합니다.
 *
 * @param {string} url - Download URL / 다운로드 URL
 */
au.fnDownloadFile = function(url) {
	fetch(url).then(function(response) {
		if (!response.ok) {
			Swal.fire({
				title: _msg["cm_file_not_found"] || "File not found",
				text: _msg["cm_file_not_found_desc"] || "The requested file could not be found on the server.",
				icon: "warning"
			});
			return;
		}
		const disposition = response.headers.get("Content-Disposition");
		let fileName = "download";
		if (disposition) {
			const match = disposition.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i);
			if (match) fileName = decodeURIComponent(match[1].replace(/"/g, ""));
		}
		response.blob().then(function(blob) {
			const a = document.createElement("a");
			a.href = URL.createObjectURL(blob);
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			setTimeout(function() {
				URL.revokeObjectURL(a.href);
				a.remove();
			}, 100);
		});
	}).catch(function() {
		Swal.fire({
			title: _msg["cm_download_failed"] || "Download failed",
			text: _msg["cm_download_failed_desc"] || "An error occurred while downloading the file.",
			icon: "error"
		});
	});
};

// Global: intercept click for safe download
// 전역: 클릭 시 안전한 다운로드를 위해 가로채기
$(document).on("click", "[href*='/api/file/downloadFileAjax']", function(e) {
	e.preventDefault();
	au.fnDownloadFile($(this).attr("href"));
});

/* ── Alert (Legacy) / Alert (레거시) ── */

/**
 * Send a push alert (legacy API). Prefer the NTF module for new features.
 * 푸시 Alert를 전송합니다 (레거시 API). 새 기능에는 NTF 모듈을 사용하세요.
 *
 * @param {Object} param - Alert params (SOURCE_TYPE, CARD_CD, SOURCE_CD, SEND_CD required) / Alert 파라미터
 * @param {Function} [callback] - Success callback / 성공 콜백
 */
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
		localStorage.setItem("APPR_REFRESH",Date.now());
		callback(response);
	});
};
/**
 * Update alert finish status (legacy API).
 * Alert 완료 상태를 업데이트합니다 (레거시 API).
 *
 * @param {Object} param - Params (SOURCE_TYPE, CARD_CD, SOURCE_CD, FINISH_YN required) / 파라미터
 * @param {Function} [callback] - Success callback / 성공 콜백
 */
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
		localStorage.setItem("APPR_REFRESH",Date.now());
		callback(response);
	});
};

/**
 * Replace a failed profile photo <img> with a default person icon.
 * 로드 실패한 프로필 사진 <img>를 기본 사람 아이콘으로 대체합니다.
 *
 * @param {HTMLElement} obj - The <img> element that failed to load / 로드 실패한 <img> 요소
 */
au.defaultPhoto = function(obj) {
	setTimeout(() => {
		const defaultPhoto = $('<i class="material-icons fLine vCenter hCenter mg0">person</i>');
		$(obj).replaceWith(defaultPhoto);
	}, 0);
};

/**
 * Bind scroll-spy and click navigation for sidebar menu items linked to card sections.
 * 카드 섹션에 연결된 사이드바 메뉴 항목의 스크롤 스파이 및 클릭 탐색을 바인딩합니다.
 *
 * Highlights the active menu item based on scroll position; scrolls to section on click.
 * 스크롤 위치에 따라 활성 메뉴 항목을 강조하고, 클릭 시 해당 섹션으로 스크롤합니다.
 */
au.fnEventMenuItemScroll = function() {
	$(window).on('scroll', function() {
		let scrollPosition = $(window).scrollTop() + parseFloat($(".contArea").css("margin-top"));
		$('.cardBox[id]:visible').each(function(idx, o) {
			const sectionTop = $(o).offset().top;
			const sectionBottom = sectionTop + $(this).outerHeight() + parseFloat($(this).css("margin-top"));
			const sectionId = $(o).attr('id');
			if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
				$('.menu-item').removeClass('active');
				$('.menu-item[data-target="' + sectionId + '"]').addClass('active');
				return false;
			}
		});
	});
	
	$('.menu-item').on('click', function() {
		const targetId = $(this).data('target');
		const targetElement = $('#' + targetId);

		if (targetElement.length) {
			let scrollTop = targetElement.offset().top - parseFloat($(".contArea").css("margin-top"));
			$('html, body').animate({
				scrollTop: scrollTop
			}, {
				queue: false,
				duration: 500,
				complete: function() {
					$('.menu-item').removeClass('active');
					$('.menu-item[data-target="' + targetId + '"]').addClass('active');
				}
			});
		}
	});
};

/**
 * Display an error alert from an AJAX error response using SweetAlert2.
 * AJAX 에러 응답을 SweetAlert2로 에러 알림을 표시합니다.
 *
 * @param {Object} e - jQuery AJAX error object / jQuery AJAX 에러 객체
 */
au.errorAlert = function(e) {
	// 401 Unauthorized → 즉시 로그인 페이지로 이동
	// 401 Unauthorized → redirect to login page immediately
	if (e.status === 401) {
		window.location.href = '/login?auth';
		return;
	}
	if (e.responseJSON) {
		// 유효성 검증(422) vs 시스템 에러 구분
		// Distinguish validation (422) from system error
		if (e.responseJSON.validation) {
			Swal.fire(_msg["cm_validation"] || 'Validation', e.responseJSON.message, 'warning');
		} else {
			Swal.fire(_msg["cm_error"] || 'Error', e.responseJSON.message, 'error');
		}
	} else {
		// 비JSON 에러 (500 HTML, 네트워크 오류, 타임아웃 등) 처리
		// Handle non-JSON errors (500 HTML, network errors, timeouts, etc.)
		const statusText = e.statusText || 'Unknown Error';
		const status = e.status || '';
		Swal.fire(_msg["cm_error"] || 'Error', (status ? '[' + status + '] ' : '') + statusText, 'error');
	}
};

/**
 * Remove leading zeros from a string (e.g., "00123" → "123").
 * 문자열에서 선행 0을 제거합니다 (예: "00123" → "123").
 *
 * @param {string} str - Input string / 입력 문자열
 * @returns {string} String without leading zeros / 선행 0이 제거된 문자열
 */
au.removeZeros = function(str) {
	return str.replace(/^0+/, '') || '';
};

/**
 * Resolve a material code against Raw Material Hub, then open the detail popup only if it exists.
 * The server matches the exact code or its 18-char zero-padded form (inverse of au.removeZeros used for display);
 * if neither exists, no popup opens and a not-found alert is shown.
 * 입력 자재 코드를 Raw Material Hub에서 조회한 뒤, 존재할 때만 상세 팝업을 엽니다.
 * 서버는 정확 일치 또는 18자리 0패딩 코드(화면 표시용 au.removeZeros의 역연산)와 매칭하며,
 * 둘 다 없으면 팝업을 열지 않고 미존재 alert를 띄웁니다.
 * @param {string} mat - material code, possibly zero-stripped / 0이 제거된 값일 수 있는 자재 코드
 */
au.openRawmathubPopup = function(mat) {
	if (!mat) return;
	au.ajaxPost2("/api/rawmathub/resolveMatCode", { mat: mat }, function(res) {
		const matched = au.NVL(res && res.mat);
		if (matched) {
			window.open("/rawmathub/popup/rawmathubPopup?mat=" + matched, "rawmathubPop_" + matched, "width=1520, height=880, toolbar=no, menubar=no, scrollbars=yes, resizable=yes");
		} else {
			Swal.fire({ icon: 'warning', text: _msg["rmhub_mat_not_exist"] || "This material code does not exist in MAPIS Raw Material Hub." });
		}
	});
};

/* ── Table Filter & Sort / 테이블 필터 & 정렬 ── */

/**
 * Enable column filtering and sorting on a table. Adds filter icons to each <th>
 * and a popup layer for keyword filter and ascending/descending sort.
 * 테이블에 열 필터링 및 정렬을 활성화합니다. 각 <th>에 필터 아이콘과
 * 키워드 필터 및 오름차순/내림차순 정렬을 위한 팝업 레이어를 추가합니다.
 *
 * @example au.setTableFilter("#tbl_quality")
 * @param {string} tableSelector - Table CSS selector / 테이블 CSS 셀렉터
 */
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
		html += '<a class="waves-effect waves-hColor hBtn hSmall btn_jpFilterApply" onclick="au._jpFilterColumn(\''+tableSelector+'\', this);au._toggleJpFilterLayer(\''+tableSelector+'\');"><span class="label">'+(_msg["cm_apply"] || "Apply")+'</span></a>'
		html += '</div>';
		html += '<div>';
		html += '<a class="waves-effect waves-hColor hBtn hGrey hSmall" onclick="au._toggleJpFilterLayer(\''+tableSelector+'\');"><span class="label">'+(_msg["cm_cancel"] || "Cancel")+'</span></a>'
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
};
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

/**
 * Recalculate sticky column positions (left offset) for horizontally fixed tables.
 * 수평 고정 테이블의 고정 열 위치(left 오프셋)를 재계산합니다.
 *
 * Bind to window resize: $(window).on("resize", au.hFixedTableResize)
 * 윈도우 리사이즈에 바인딩: $(window).on("resize", au.hFixedTableResize)
 */
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
};

/* ── Input Mask / 입력 마스크 ── */

/**
 * Apply numeric input mask to elements with class "im-class".
 * "im-class" 클래스를 가진 요소에 숫자 입력 마스크를 적용합니다.
 *
 * Reads data-im-digitopt (e.g., "2" for 2 decimals, "10,2" for 10 total / 2 decimal).
 * data-im-digitopt을 읽습니다 (예: "2"는 소수점 2자리, "10,2"는 총 10자리/소수점 2자리).
 *
 * @param {string|HTMLElement} [selector=document] - Scope selector / 범위 셀렉터
 * @param {string} [groupSeparator=","] - Thousands separator / 천 단위 구분자
 * @param {string} [placeholder="0"] - Placeholder character / 플레이스홀더 문자
 */
au.setInputmask = function(selector = document, groupSeparator = ",", placeholder = "0") {
	$(selector).each(function(idx, o) {
		let $im = $(o).hasClass("im-class") ? $(o) : $(o).find(".im-class");
		const digitopt = au.NVL($im.attr("data-im-digitopt"));
		const [num1, num2] = digitopt.split(",");

		// e.g., "0", "1", "2", "4", "6", ...
		if(au.NVL(num2) == "") {
			const optObj = {
				nullable: false,
				placeholder: placeholder,
				groupSeparator: groupSeparator,
				autoGroup: true,
				digits: num1 || "*",
				max: $im.attr("data-im-max"),
				min: $im.attr("data-im-min"),
				prefix: $im.attr("data-im-prefix") || "",
				suffix: $im.attr("data-im-suffix") || "",
			};
			$im.inputmask("numeric", optObj);
		}
		// e.g., "10,2", "5,4", "18,2", "18,6", ...
		else {
			const integerLength = num1 - num2;
			const maxInt = "9".repeat(integerLength);
			const maxDec = num2 > 0 ? "." + "9".repeat(num2) : "";
			const max2 = maxInt + maxDec;
			const optObj = {
				nullable: false,
				placeholder: "",
				groupSeparator: ",",
				autoGroup: true,
				digits: num2,
				max: $im.attr("data-im-max") || max2,
				min: $im.attr("data-im-min") || -1*max2,
				prefix: $im.attr("data-im-prefix") || "",
				suffix: $im.attr("data-im-suffix") || "",
			};
			$im.inputmask("numeric", optObj);
		}

		// Select all on focus so a single keystroke replaces the entire value (Excel-like UX).
		// Defer select() to next tick so Inputmask's own focus handler (caret positioning) runs first.
		// Namespaced + .off().on() to stay idempotent when setInputmask is called repeatedly on the same element (e.g. row reload).
		// focus 시 전체 선택 — 한 번의 키 입력으로 값을 교체할 수 있게 함 (Excel 스타일 UX).
		// Inputmask 자체의 focus 핸들러(caret 위치 조정)가 먼저 실행되도록 다음 tick에서 select() 호출.
		// 동일 요소에 setInputmask가 반복 호출되어도(예: row reload) 핸들러 중복 등록되지 않도록 namespace + .off().on() 사용.
		$im
			.off("focus.imSelectAll")
			.on("focus.imSelectAll", function() {
				const el = this;
				setTimeout(function() { el.select(); }, 0);
			});
	});
};
/**
 * Apply date input mask to elements with class "imd-class".
 * "imd-class" 클래스를 가진 요소에 날짜 입력 마스크를 적용합니다.
 *
 * @param {string|HTMLElement} [selector=document] - Scope selector / 범위 셀렉터
 * @param {string} [format] - Date format (default from data-im-format or "mm-dd-yyyy") / 날짜 포맷
 */
au.setInputmaskDate = function(selector = document, format) {
	$(selector).each(function(idx, o) {
		let $imd = $(o).hasClass("imd-class") ? $(o) : $(o).find(".imd-class");
		format = format || au.NVL($imd.attr("data-im-format"), "mm-dd-yyyy");
		const optObj = {
			inputFormat: format,
			outputFormat: "yyyymmdd", // .inputmask("unmaskedvalue")
			autocomplete: false,
			insertMode: false,
			inputEventOnly: true,
			placeholder: "_",
			showMaskOnHover: false,
			clearIncomplete: true,
			prefillYear: false
		};
		$imd.inputmask("datetime", optObj);
	});
};

/* ── Deep Comparison / 깊은 비교 ── */

/**
 * Generator-based deep comparison of two values. Yields false at each mismatch.
 * 두 값의 제너레이터 기반 깊은 비교. 불일치 시마다 false를 yield합니다.
 *
 * Supports primitives, arrays, and nested objects. Ignores specified keys.
 * 원시형, 배열, 중첩 객체를 지원합니다. 지정된 키를 무시합니다.
 *
 * @generator
 * @param {*} x - First value / 첫 번째 값
 * @param {*} y - Second value / 두 번째 값
 * @param {string[]} [ignoreKeys=[]] - Keys to ignore during comparison / 비교 시 무시할 키
 * @yields {boolean} true if matching so far, false on mismatch / 일치하면 true, 불일치 시 false
 */
au.deepCompare = function* (x, y, ignoreKeys = []) {
    // 1. Type comparison and null check / 타입 비교 및 Null 체크
    if (typeof x !== typeof y) {
        console.log("Type mismatch:", x, y);
        yield false; return;
    }

    if (x === null || y === null) {
        if (x !== y) {
            console.log("Null comparison mismatch:", x, y);
            yield false;
        } else {
            yield true;
        }
        return;
    }

    // 2. Primitive type comparison / 기본 타입(Primitive) 비교
    if (typeof x !== "object") {
        if (x !== y) {
            console.log("Primitive mismatch:", x, y);
            yield false;
        } else {
            yield true;
        }
        return;
    }

    // 3. Array comparison / 배열(Array) 비교
    if (Array.isArray(x)) {
        if (!Array.isArray(y) || x.length !== y.length) {
            console.log("Array mismatch (type or length):", x, y);
            yield false; return;
        }

        for (let i = 0; i < x.length; i++) {
            // yield* delegates all yields from the sub-generator / yield*은 하위 제너레이터의 모든 yield를 그대로 전달합니다.
            yield* au.deepCompare(x[i], y[i], ignoreKeys);
        }
        return;
    }

    // 4. Object comparison / 객체(Object) 비교
    const xKeys = Object.keys(x).filter(k => !ignoreKeys.includes(k));
    const yKeys = Object.keys(y).filter(k => !ignoreKeys.includes(k));

    if (xKeys.length !== yKeys.length) {
        console.log("Object keys length mismatch:", xKeys, yKeys);
        yield false; return;
    }

    for (const key of xKeys) {
        if (!Object.prototype.hasOwnProperty.call(y, key)) {
            console.log(`Key "${key}" missing in second object`);
            yield false; return;
        }
        // Recursive call for nested value comparison / 재귀 호출로 내부 값 비교
        yield* au.deepCompare(x[key], y[key], ignoreKeys);
    }
};

/**
 * Check deep equality of two values (uses au.deepCompare generator).
 * 두 값의 깊은 동등성을 검사합니다 (au.deepCompare 제너레이터를 사용).
 *
 * @param {*} a - First value / 첫 번째 값
 * @param {*} b - Second value / 두 번째 값
 * @param {string[]} [ignoreKeys=[]] - Keys to ignore / 무시할 키
 * @returns {boolean} true if deeply equal / 깊이 동등하면 true
 */
au.equal = function(a, b, ignoreKeys = []) {
	for (const result of au.deepCompare(a, b, ignoreKeys)) {
		if (!result) {
			return false;
		}
	}
	return true;
};

/* ── Data Binding / 데이터 바인딩 ── */

/**
 * Clear all elements with [data-bind] attribute — reset inputs, checkboxes, selects, and text.
 * [data-bind] 속성이 있는 모든 요소를 초기화합니다 — input, 체크박스, select, 텍스트를 리셋합니다.
 */
au.bindDataClear = function () {
	$("[data-bind]").each(function() {
		const $this = $(this);
		const tag = this.tagName.toUpperCase();
		const type = ($this.attr("type") || "").toLowerCase();
		if(type === "checkbox") {
			$this.prop("checked", false);
			return;
		} else if(type === "radio") {
			$(`input[type=radio][name='${$this.attr("name")}']`).prop("checked", false);
			return;
		} else if(tag === "SELECT") {
			$this.val(null);
			// Materialize FormSelect: reinit required to refresh rendered DOM (separate widget DOM).
			// select2: 'change' event refreshes display while preserving existing options (tooltip, theme).
			// Materialize FormSelect: 별도 위젯 DOM이라 표시 갱신 위해 재초기화 필요.
			// select2: 'change' 이벤트로 표시 갱신, 기존 옵션(tooltip, theme 등) 보존됨.
			if (typeof $this[0].M_FormSelect != "undefined") {
				$this.auSelect();
			} else if ($this.data("select2")) {
				$this.trigger("change");
			}
			return;
		} else if(tag == "INPUT" || tag == "TEXTAREA") {
			$this.val("");
			return;
		}
		$this.text("");
	});
};
/**
 * Bind data object values to elements with [data-bind] attribute inside a container.
 * 컨테이너 내 [data-bind] 속성이 있는 요소에 데이터 객체 값을 바인딩합니다.
 *
 * Supports: INPUT (text/checkbox/radio), TEXTAREA, SELECT (Materialize/Select2), and text nodes.
 * 지원: INPUT (text/checkbox/radio), TEXTAREA, SELECT (Materialize/Select2), 텍스트 노드.
 *
 * Optional attributes:
 *   - data-bind-nvl: Default value when data is null/empty / 데이터가 null/빈값일 때 기본값
 *   - data-bind-function: Transform function name (au.* or window.*) / 변환 함수 이름
 *
 * @param {string|jQuery} container - Container selector / 컨테이너 셀렉터
 * @param {Object} data - Data object with keys matching data-bind values / data-bind 값과 일치하는 키를 가진 데이터 객체
 */
au.bindData = function(container, data) {
	const $container = $(container);
	$container.find("[data-bind]").each(function(_, o) {
		const $this = $(this);
		const key = $this.attr("data-bind");
		const nvl = au.NVL($this.attr("data-bind-nvl"));
		const bindFunction = au.NVL($this.attr("data-bind-function"));
		let val = au.NVL(data?.[key],nvl);
		if(val == "") return;

		if(bindFunction != "") {
			// The namespace of function is au(defined in apis_util.js)
			if(bindFunction.indexOf("au.") == 0) {
				const functionName = bindFunction.substring(3);
				if(typeof au[functionName] == "function") {
					val = au[functionName].call(this, val);
				}
			}
			else if(typeof au[bindFunction] == "function") {
				val = au[bindFunction].call(this, val);
			}
			// The namespace of function is window
			else if(typeof window[bindFunction] == "function") {
				val = window[bindFunction].call(this, val);
			}
		}

		const tag = this.tagName.toUpperCase();
		const type = ($this.attr("type") || "").toLowerCase();

		if (type === "checkbox") {
			const isChecked = (val == true || val.toUpperCase() == "Y" || val.toUpperCase() == "T" || val.toUpperCase() == "TRUE" || val == "1");
			$this.prop("checked", isChecked).trigger("change");
			return;
		}

		if (type === "radio") {
			$container.find(`input[type=radio][name='${$this.attr("name")}']`).each(function(idx, o) {
				const $r = $(o);
				$r.prop("checked", $r.val() == val).trigger("change");
			});
			return;
		}

		if (tag === "SELECT") {
			$this.val(val);
			if (!$this.val()) {
				const firstVal = $this.find("option:first").val();
				$this.val(firstVal);
			}

			// Materialize FormSelect: reinit required to refresh rendered DOM (separate widget DOM).
			// select2 / plain select: 'change' event is sufficient — select2 listens on the underlying
			// <select> and refreshes display, preserving its existing options (e.g. tooltip, theme).
			// Materialize FormSelect: 별도 위젯 DOM이라 표시 갱신 위해 재초기화 필요.
			// select2 / 일반 select: 'change' 이벤트로 충분 — select2는 underlying <select>를 listen해
			// display를 갱신하며, 기존 옵션(tooltip, theme 등)을 보존함.
			if (typeof $this[0].M_FormSelect != "undefined") {
				$this.auSelect();
			} else {
				$this.trigger("change");
			}

			return;
		}

		if(tag == "INPUT" || tag == "TEXTAREA") {
			$this.val(val).trigger("change");

			if(M.Datepicker.getInstance(this)) {
				$this.datepicker("setDate", val);
			}
			// Auto-resize textarea after programmatic value set
			// JS .val() 호출 시 input 이벤트가 발생하지 않으므로 수동 resize
			if(tag == "TEXTAREA" && $this.hasClass("materialize-textarea")) {
				M.textareaAutoResize($this);
			}
			return;
		}

		$this.text(val).trigger("change");
	});
};

/* ── Form Enable/Disable (Freeze) / 폼 활성화/비활성화 (프리즈) ── */

/**
 * Enable or disable all form elements within a container.
 * 컨테이너 내 모든 폼 요소를 활성화 또는 비활성화합니다.
 *
 * Handles: inputs, selects, textareas, buttons, Summernote editors,
 * file fields, action buttons (.hBtn, btn_*), and table edit-only elements.
 * 처리 대상: input, select, textarea, button, Summernote 에디터,
 * 파일 필드, 액션 버튼(.hBtn, btn_*), 테이블 편집 전용 요소.
 *
 * Elements with class "allow-on-freeze" are excluded from disabling.
 * "allow-on-freeze" 클래스가 있는 요소는 비활성화에서 제외됩니다.
 *
 * @param {string|jQuery} container - Container selector / 컨테이너 셀렉터
 * @param {boolean} isDisabled - true to disable, false to enable / true면 비활성화, false면 활성화
 */
au.setDisabled = function(container, isDisabled) {
	const $container = $(container);
	$container.find("input, select, textarea, button").each(function() {
		const $this = $(this);
		if ($this.is("[data-allow-on-freeze]") || $this.closest("[data-allow-on-freeze]").length) return;
		const tag = this.tagName.toUpperCase();
		const type = ($this.attr("type") || "").toLowerCase();
				
		if ($this.hasClass("summernote")) {
			if (isDisabled) {
				$this.summernote('disable');
				$this.next('.note-editor').find('.note-toolbar').hide();
				$this.next('.note-editor').css('border', 'none');
			} else {
				$this.summernote('enable');
				$this.next('.note-editor').find('.note-toolbar').show();
				$this.next('.note-editor').css('border', '');
			}
			return;
		}
		
		if (isDisabled) {
			$this.prop("disabled", true).attr("tabindex", "-1");
		} else {
			$this.prop("disabled", false).removeAttr("tabindex");
		}
		// Re-init select2/FormSelect to sync disabled state visually
		// select2/FormSelect 비활성 상태 시각적 동기화를 위해 재초기화
		if (tag === "SELECT") {
			if ($this.data("select2")) {
				$this.trigger("change.select2");
				// disabled + 빈 값일 때 placeholder 텍스트("- Select -" 등)를 숨김
				// Hide placeholder text (e.g., "- Select -") when disabled with empty value
				const $s2Container = $this.next('.select2-container');
				if (isDisabled && !$this.val()) {
					$s2Container.addClass('select2-empty');
				} else {
					$s2Container.removeClass('select2-empty');
				}
			} else if (typeof $this[0].M_FormSelect != "undefined") {
				$this.auSelect();
				// disabled + 빈 값일 때 placeholder 텍스트("- Select -" 등)를 숨김
				// Hide placeholder text (e.g., "- Select -") when disabled with empty value
				const $wrapper = $this.closest('.select-wrapper');
				if (isDisabled && !$this.val()) {
					$wrapper.addClass('formselect-empty');
				} else {
					$wrapper.removeClass('formselect-empty');
				}
			}
		}
	});
	$container.find("[class*='btn_'], [id*='btn_'], .hBtn").each(function(idx, o) {
		const $this = $(this);
		if ($this.is("[data-allow-on-freeze]") || $this.closest("[data-allow-on-freeze]").length) return;
		if ($this.is("[data-no-auto-toggle]")) return;
		const isBtn = $this.hasClass("hBtn") || this.className.indexOf("btn_") >= 0 || (this.id && this.id.indexOf("btn_") >= 0);
		if (isBtn) {
			isDisabled ? $this.hide() : $this.show();
		}
	});
	$container.find(".file-field, .file-area").each(function() {
		const $this = $(this);
		if(isDisabled) {
			if($this.hasClass("file-field")) {
				$this.hide();
			} else if($this.hasClass("file-area")) {
				$this.addClass("pl0");
			} 
		} else {
			if(this.className.indexOf("file-field") >= 0) {
				$this.show();
			} else if(this.className.indexOf("file-area") >= 0) {
				$this.removeClass("pl0");
			} 
		}
	});
	$container.find("table").find(".deleteBtn, [editonly]").each(function() {
		const $this = $(this);
		if (isDisabled) {
			$this.hide();
		} else {
			$this.show();
		}
	});

	if(isDisabled) {
		$container.find("#npdi-gantt-shell").find("[editonly], .hGanttDatepicker").hide();
	} else {
		$container.find("#npdi-gantt-shell").find("[editonly]").show();
		$container.find("#npdi-gantt-shell").find(".hGanttDatepicker").css("display", "");
	}
};

/**
 * Scroll an input element into the viewport (no focus). For select plugins (select2,
 * Materialize FormSelect) the underlying <select> is display:none, so the visible
 * wrapper is targeted instead. The dropdown is then opened so the user can pick
 * immediately.
 *
 * Smooth scroll is now used (was instant). The Swal-close race is avoided by callers
 * invoking this only inside `didClose` (after Swal's body padding restoration is done),
 * and select2 v4's scroll listener repositions its dropdown as the wrapper moves —
 * so the dropdown tracks during the smooth-scroll animation.
 *
 * 빈 필드를 viewport로 스크롤 (focus 호출 X). select 플러그인(select2, Materialize
 * FormSelect)의 underlying <select>는 display:none이라 visible wrapper를 스크롤 대상으로
 * 삼고, dropdown까지 자동 열어 즉시 선택 가능하게 함.
 *
 * smooth scroll 사용. 호출자는 `didClose`(Swal cleanup 완료) 시점에서만 호출하므로
 * Swal과의 race는 회피되고, select2 v4의 scroll listener가 wrapper 이동에 따라
 * dropdown을 reposition하므로 smooth 애니메이션 진행 중에도 dropdown이 따라감.
 *
 * @param {jQuery} $el target element / 대상 element
 */
au.scrollToInput = function($el) {
	if (!$el || !$el.length) return;
	const elem = $el[0];

	// Determine the visible scroll target — plugin wrappers have separate visible DOM.
	// 스크롤 대상 결정 — plugin wrapper는 별도 visible DOM을 가짐.
	let target = elem;
	let openType = null;
	if ($el.data("select2")) {
		target = $el.next(".select2-container")[0];
		openType = "select2";
	} else if (typeof elem.M_FormSelect !== "undefined") {
		target = $el.closest(".select-wrapper")[0];
		openType = "formselect";
	}

	if (target && typeof target.scrollIntoView === "function") {
		target.scrollIntoView({ behavior: "smooth", block: "center" });
	}

	// Open the dropdown after the next paint so the scroll layout is committed first —
	// otherwise select2/Materialize may trigger their own auto-scroll to bring the
	// dropdown into view, racing with scrollIntoView and jumping to the wrong position.
	// 다음 frame paint 후 dropdown 열기 — scrollIntoView로 인한 layout 확정 전에
	// dropdown.open()이 호출되면 select2/Materialize가 dropdown을 viewport에 가져오기 위해
	// 자체 auto-scroll을 트리거하여 우리 scrollIntoView와 race가 발생, 엉뚱한 위치로 점프.
	if (openType === "select2") {
		requestAnimationFrame(() => $el.select2("open"));
	} else if (openType === "formselect") {
		requestAnimationFrame(() => $el.closest(".select-wrapper").find("input.select-dropdown").trigger("click"));
	}
};

/**
 * Resolve a human-readable label for a form control, used by required-field alerts.
 * Falls back through `data-label` → `name` → `id` → `"?"` so a missing `data-label`
 * still produces an identifiable alert. Any time the `data-label` is absent — even when
 * name/id resolves the alert — a console warning is emitted so the missing label is
 * surfaced during development as a backlog item, since `data-label` is the standard
 * identification path and name/id are safety nets.
 *
 * 필수 필드 알림에 표시할 사람-읽기-가능 라벨 해석. `data-label` → `name` → `id` → `"?"`
 * 순으로 fallback하여 `data-label` 누락 시에도 알림이 식별 가능한 텍스트를 보여줌.
 * `data-label`이 없으면 name/id로 식별되더라도 console.warn을 1회 출력 — `data-label`이
 * 표준 식별 경로이고 name/id는 안전망이므로, 개발 단계에서 누락 사실을 백로그로 인지
 * 할 수 있도록 신호를 남김.
 *
 * @param {jQuery} $el - the form control / 폼 컨트롤
 * @returns {string} the resolved label / 해석된 라벨
 */
au.resolveFieldLabel = function($el) {
	if (!$el || !$el.length) return "?";
	const label = ($el.attr("data-label") || "").replace(/\s+/g, " ").trim();
	if (label) return label;
	if (window.console && console.warn) {
		console.warn("[au.resolveFieldLabel] required element missing data-label:", $el[0]);
	}
	const name = ($el.attr("name") || "").trim();
	if (name) return name;
	const id = ($el.attr("id") || "").trim();
	if (id) return id;
	return "?";
};

/**
 * Apply the `.invalid-required` highlight to a missing field and auto-clear it on the
 * first user input/change. The class is applied to BOTH the underlying control and its
 * closest wrapper (.aniInput / .input-field / .select-wrapper) so the highlight renders
 * correctly across Materialize text inputs, Materialize selects, and Select2 selects —
 * the CSS rules in common.css target whichever side the class lands on.
 *
 * Re-invoking on the same element is safe: namespaced 'invalidRequired' events are
 * detached before being re-bound, preventing handler accumulation across repeated
 * validation runs.
 *
 * 누락 필수 필드에 `.invalid-required` 시각 강조를 부여하고, 사용자의 첫 입력/변경 시
 * 자동 해제. underlying control 과 closest wrapper(.aniInput / .input-field /
 * .select-wrapper) 양쪽에 모두 클래스를 부여하여 Materialize text input, Materialize
 * select, Select2 select 어디서든 강조가 렌더링되도록 함(common.css의 selector가
 * 양쪽 중 어느 쪽이든 매칭).
 *
 * 동일 element 재호출 안전: namespaced 'invalidRequired' 이벤트를 detach 후 재바인딩
 * 하므로 반복 검증 시 핸들러 누적 없음.
 *
 * @param {jQuery} $el - the empty required element / 비어 있는 필수 element
 */
au.markFieldInvalidRequired = function($el) {
	if (!$el || !$el.length) return;
	const $wrap = $el.closest(".aniInput, .input-field, .select-wrapper");
	$el.addClass("invalid-required");
	if ($wrap.length) $wrap.addClass("invalid-required");
	const evts = "input.invalidRequired change.invalidRequired select2:select.invalidRequired";
	$el.off(evts).on(evts, function() {
		const v = ($(this).val() || "").toString().trim();
		if (!v) return;
		const $self = $(this);
		$self.removeClass("invalid-required").off(evts);
		const $w = $self.closest(".aniInput, .input-field, .select-wrapper");
		if ($w.length) $w.removeClass("invalid-required");
	});
};

/**
 * Build SweetAlert body HTML for a missing-required-fields alert: a count header line
 * followed by a left-aligned bulleted list of field labels. When the list exceeds 6
 * entries the wrapper additionally receives the shared `.hScroll` class so long lists
 * fall back to the project-wide scrollbar styling (CSS caps height at 240px).
 *
 * 누락 필수 필드 알림용 SweetAlert 본문 HTML 생성: 카운트 헤더 + 좌측 정렬 bullet list.
 * 항목이 6개를 초과하면 wrapper에 공용 `.hScroll` 클래스를 추가하여 프로젝트 공용
 * 스크롤바 스타일로 세로 스크롤(CSS에서 max-height 240px).
 *
 * @param {Array<{label:string}>} missing - missing field entries / 누락 필드 목록
 * @returns {string} HTML string for SweetAlert `html` option / SweetAlert `html` 옵션용 HTML
 */
au.buildMissingFieldsHtml = function(missing) {
	const n = missing.length;
	const baseMsg = _msg["cm_please_fill_required"] || "Please fill out the required fields";
	const items = missing.map(function(m) {
		return "<li>- " + au.escapeHtml(m.label || "?") + "</li>";
	}).join("");
	const fieldStr = n <= 1 ? "field" : "fields";
	return `<div><span class="orangetiger-text fontM">${n}</span> required ${fieldStr} are missing.</div>` 
		+ au.escapeHtml(baseMsg)
		+ '<div class="required-list-wrap hScroll"><ul>' + items + '</ul></div>';
};

/**
 * Validate save-time required fields on a form. Auto-scans `[data-required-save="true"]`,
 * resolves each label from `data-label`, and — when one or more required fields are empty —
 * collects all of them, applies the `.invalid-required` highlight to every offender, shows
 * a single SweetAlert listing every missing field, and scrolls to the first one on close.
 *
 * Save-time validation uses a separate attribute (`data-required-save`) from the approval
 * initiate-time check (`data-required` / `[required]` in `_check3_MandatoryFields`) so the
 * two layers can diverge later without coupling — e.g. when an attachment becomes required
 * only at approval submission, not at simple save.
 *
 * 저장 시점 필수 필드 검증. `[data-required-save="true"]`를 전수 스캔하여 누락 필드가 하나라도
 * 있으면 전부 수집한 뒤 모든 누락 필드에 `.invalid-required` 시각 강조를 적용하고, 한 번의
 * SweetAlert에 전체 누락 목록을 표시한 후 첫 필드로 스크롤.
 *
 * 결재 상신 시점 필수 검증(`_check3_MandatoryFields`의 `data-required`/`[required]`)과
 * 별도 attribute를 사용하여 두 레이어가 향후 분기 가능하도록 분리 — 예: 첨부파일이
 * 결재 상신 시점에만 필수가 되는 룰이 추가되어도 save 검증에 영향 없음.
 *
 * @param {string} formId - target form element id (no leading "#") / 대상 form id (# 없이)
 * @returns {boolean} true if all save-required fields are filled / 모든 save 필수 필드가 채워져 있으면 true
 */
au.checkRequiredFields = function(formId) {
	const $required = $("#"+formId+" [data-required-save='true']");
	const missing = [];
	for (let i = 0; i < $required.length; i++) {
		const $el = $required.eq(i);
		if ($el.is(":disabled")) continue;
		const val = ($el.val() || "").toString().trim();
		if (val) continue;
		missing.push({ $el: $el, label: au.resolveFieldLabel($el) });
	}
	if (missing.length === 0) return true;

	missing.forEach(function(m) { au.markFieldInvalidRequired(m.$el); });

	// didClose fires after Swal's full cleanup (fade-out + scrollbar padding restore).
	// Using .then() instead races with Swal's body-padding restoration on close, which
	// can re-trigger scroll and override our scrollIntoView.
	// didClose는 Swal cleanup(fade-out + scrollbar padding 복원) 완료 후 호출되어 race-free.
	// .then()은 Swal의 body padding 복원과 race가 발생해 우리 scroll이 덮어씌워질 수 있음.
	Swal.fire({
		title: _msg["cm_cannot_save"] || "Cannot Save",
		html: au.buildMissingFieldsHtml(missing),
		icon: "warning",
		didClose: () => au.scrollToInput(missing[0].$el)
	});
	return false;
};

/**
 * Split a unit-separator-delimited string into an array for Select2 multi-select binding.
 * 유닛 구분자로 분리된 문자열을 Select2 다중 선택 바인딩용 배열로 분할합니다.
 *
 * @param {string} val - Unit separator (\u001f) delimited string / 유닛 구분자 문자열
 * @returns {string[]} Array of trimmed values / 트림된 값 배열
 */
au.bindSelect2 = function(val) {
	return val?.split("\u001f").map(v => v.trim()) || [];
};
/**
 * Map Select2 display text back to option values for multi-select binding.
 * Select2 표시 텍스트를 다중 선택 바인딩을 위한 옵션 값으로 매핑합니다.
 *
 * Called as data-bind-function; `this` refers to the <select> element.
 * data-bind-function으로 호출됩니다; `this`는 <select> 요소를 가리킵니다.
 *
 * @param {string} val - Unit separator delimited display text / 유닛 구분자 표시 텍스트
 * @returns {string[]} Array of option values / 옵션 값 배열
 */
au.bindSelect2Text = function(val) {
	const textArray = val?.split("\u001f").map(v => v.trim()) || [];
	const valArray = [];
	const textToValue = {};
	$(this).find("option").each(function(_, o) {
		textToValue[$(o).text()] = $(o).val();
	});
	$.each(textArray, function(_, v) {
		if (textToValue[v] != undefined) {
			valArray.push(textToValue[v]);
		}
	});
	val = valArray; 
	return val;
};

/* freeze-banner feature commented out – may be re-enabled later / freeze-banner 기능 주석처리 – 나중에 다시 사용할 수 있음 */
// /**
//  * 범용 freeze-banner 표시.
//  * @param {jQuery|string} container  배너를 삽입할 컨테이너
//  * @param {Object} opts    { theme, icon, text }
//  *   - theme: CSS modifier 클래스명 (approval|review|stage|closed)
//  */
// au.showBanner = function(container, opts) {
// 	const $c = (typeof container === 'string') ? $(container) : container;
// 	if ($c.find('> .freeze-banner').length) return;
// 	const o = opts || {};
// 	const theme = o.theme || 'approval';
// 	const $banner = $(
// 		'<div class="freeze-banner freeze-banner--' + theme + '">' +
// 		'  <i class="material-symbols-outlined">' + (o.icon || 'info') + '</i>' +
// 		'  <span>' + (o.text || '') + '</span>' +
// 		'</div>'
// 	);
// 	$c.prepend($banner);
//
// 	// JS-based sticky: 부모 fixed 헤더 높이 기준 fixed 위치 전환
// 	const _stickyNS = 'scroll.freezeBanner_' + Date.now();
// 	const $contArea = $banner.closest('.contArea');
// 	const $fixedHeader = $('body > header');
// 	const stickyTop = $fixedHeader.length ? $fixedHeader[0].getBoundingClientRect().bottom : 0;
// 	function checkSticky() {
// 		if (!$banner.is(':visible') || !$banner.closest('body').length) {
// 			$(window).off(_stickyNS);
// 			return;
// 		}
// 		const $ph = $banner.next('.freeze-banner-ph');
// 		if ($banner.hasClass('is-stuck')) {
// 			if ($ph.length) {
// 				const phRect = $ph[0].getBoundingClientRect();
// 				if (phRect.top >= stickyTop) {
// 					$banner.removeClass('is-stuck').css({ top: '', left: '', width: '' });
// 					$ph.remove();
// 				}
// 			}
// 		} else {
// 			const rect = $banner[0].getBoundingClientRect();
// 			if (rect.top < stickyTop) {
// 				const contRect = $contArea.length ? $contArea[0].getBoundingClientRect() : rect;
// 				const ph = $('<div class="freeze-banner-ph"></div>').css('height', $banner.outerHeight());
// 				$banner.after(ph);
// 				$banner.addClass('is-stuck').css({
// 					top: stickyTop + 'px',
// 					left: contRect.left + 'px',
// 					width: contRect.width + 'px'
// 				});
// 			}
// 		}
// 	}
// 	$(window).on(_stickyNS, checkSticky);
// 	setTimeout(checkSticky, 100);
// };
//
// au.removeBanner = function(container) {
// 	const $c = (typeof container === 'string') ? $(container) : container;
// 	$c.find('.freeze-banner').remove();
// 	$c.find('.freeze-banner-ph').remove();
// };
/** Show freeze banner (currently no-op stub). / 프리즈 배너 표시 (현재 no-op 스텁). */
au.showBanner = function() {};
/** Remove freeze banner (currently no-op stub). / 프리즈 배너 제거 (현재 no-op 스텁). */
au.removeBanner = function() {};

/**
 * Extract a unique popup window name from a URL to prevent duplicate windows.
 * URL에서 고유한 팝업 윈도우 이름을 추출하여 중복 창 열기를 방지합니다.
 *
 * @param {string} url - Popup URL (e.g., /snpi/popup/snpiPopup?snpiId=123) / 팝업 URL
 * @returns {string} Window name (e.g., "snpiPop_123") or fallback with timestamp / 윈도우 이름 또는 타임스탬프 폴백
 */
au.getPopupName = function(url) {
	const paramMap = {
		'snpiId':          'snpiPop_',
		'cnpiId':          'cnpiPop_',
		'nptId':           'nptPop_',
		'tsId':            'techSupportPop_',
		'techSupportId':   'techSupportPop_',
		'fmeaId':          'fmeaPop_',
		'mat':             'rawmathubPop_'
	};
	for (const [param, prefix] of Object.entries(paramMap)) {
		const regex = new RegExp('[?&]' + param + '=([^&]+)');
		const match = url.match(regex);
		if (match && match[1]) return prefix + match[1];
	}
	return 'popup_' + Date.now();
};

$(function() {
	au.textLimit.refresh();
});

// Fix: Materialize Modal._handleFocus (capture phase) steals focus from
// select2 dropdowns, Summernote modals, etc. appended to body.
// Materialize Modal._handleFocus가 캡처 단계에서 focus를 가로채는 문제 수정.
document.addEventListener('focus', function(e) {
    if (e.target.closest && (
        e.target.closest('.select2-container') ||
        e.target.closest('.swal2-container') ||
        e.target.closest('.note-modal') ||
        e.target.closest('.note-popover')
    )) {
        e.stopImmediatePropagation();
    }
}, true);

/**
 * au.toastTest — Test helpers for Materialize toast (console usage).
 * au.toastTest — Materialize 토스트 테스트용 헬퍼 (콘솔에서 사용).
 *
 * Usage:  au.toastTest.ntf()                           // ntf-toast (default msg, infinite)
 *         au.toastTest.ntf('Custom message')            // ntf-toast (custom msg, infinite)
 *         au.toastTest.basic()                          // default toast (infinite)
 *         au.toastTest.basic('Message', 'success')      // success | fail | warn | info
 */
au.toastTest = {
	ntf: function (msg) {
		if (typeof M !== 'undefined' && M.toast) {
			const div = document.createElement('div');
			div.appendChild(document.createTextNode(msg || '[TEST] ntf-toast'));
			M.toast({
				html: '<i class="material-icons left">notifications</i>' + div.innerHTML,
				classes: 'ntf-toast',
				displayLength: Infinity
			});
		}
	},
	basic: function (msg, type) {
		if (typeof M !== 'undefined' && M.toast) {
			const div = document.createElement('div');
			div.appendChild(document.createTextNode(msg || '[TEST] Default Materialize toast'));
			M.toast({
				html: div.innerHTML,
				classes: type || '',
				displayLength: Infinity
			});
		}
	}
};
/**
 * Install a beforeunload guard that prompts the browser's standard "Leave site?" confirm
 * when the form state differs from its captured orgDTO baseline. Each popup supplies its own
 * equalCheckFn(selector) — returning true when the form is unchanged (matches MAPIS's
 * existing fnEqualDTO convention used by cnpi/snpi/npt/etc).
 *
 * Optional currentSelectorFn() returns the currently active form selector. Multi-form popups
 * (tabs/stages) force a discard confirm when leaving a dirty tab, so only the current form can
 * hold live unsaved edits — supplying currentSelectorFn restricts the guard to that one form,
 * matching the in-popup dirty check. When it is omitted (or returns falsy) the guard falls back
 * to scanning every captured orgDTO baseline (single-form popups, or before a form is active).
 *
 * 페이지 떠나기 전 standard confirm 다이얼로그를 띄우는 공통 가드. (true 반환 = 변경 없음 = dirty 아님.)
 * 선택 인자 currentSelectorFn()은 현재 활성 폼 selector를 반환. 다중 폼 팝업은 dirty 탭을 떠날 때
 * discard confirm을 거치므로 현재 폼만 미저장 편집을 가짐 → 제공되면 그 폼만 검사(in-popup 체크와 일치).
 * 생략(또는 falsy 반환) 시 캡처된 모든 orgDTO baseline을 검사하는 기존 동작으로 fallback.
 *
 * Usage: au.installUnsavedGuardForOrgDTO(fnEqualDTO, () => currPage.form);
 */
/**
 * Single-shot bypass: skip the next beforeunload confirm even if forms are dirty.
 * Use this right before any programmatic navigation that should bypass the dirty-check
 * (e.g., au.fnPageReload sets it before location.replace).
 *
 * 1회용 bypass: 다음 beforeunload 한 번만 dirty 가드 skip. 코드 트리거 reload 등에서 사용.
 */
au._bypassUnsavedGuardOnce = false;
au.bypassUnsavedGuardOnce = function() {
	au._bypassUnsavedGuardOnce = true;
	// safety reset — if beforeunload didn't fire (rare), clear flag so later close still confirms.
	// beforeunload가 안 떴을 경우 안전 리셋 (드물지만).
	setTimeout(function() { au._bypassUnsavedGuardOnce = false; }, 1500);
};

au.installUnsavedGuardForOrgDTO = function(equalCheckFn, currentSelectorFn) {
	window.addEventListener("beforeunload", function(e) {
		try {
			// One-shot bypass — programmatic reload/navigation pre-set this so users don't see confirm.
			// 코드 트리거 navigation은 직전에 플래그 set, 사용자 confirm 노출 안 됨.
			if (au._bypassUnsavedGuardOnce) {
				au._bypassUnsavedGuardOnce = false;
				return;
			}
			if (typeof orgDTO === "undefined" || !orgDTO) return;
			// Current-form scope — only the active form can hold live unsaved edits in multi-form
			// popups (leaving a dirty tab already forced a discard confirm), so check just that one.
			// 현재 폼 스코프 — 다중 폼 팝업에서 미저장 편집은 활성 폼만 가짐(dirty 탭 이탈 시 이미 discard 확인) → 그 폼만 검사.
			const currentSel = typeof currentSelectorFn === "function" ? currentSelectorFn() : null;
			if (currentSel) {
				if (!equalCheckFn(currentSel)) {
					e.preventDefault();
				}
				return;
			}
			// Fallback — single-form popups or no active form yet: scan every captured baseline.
			// Fallback — 단일 폼 팝업 또는 아직 활성 폼 없음: 캡처된 모든 baseline 검사.
			for (const sel in orgDTO) {
				if (!equalCheckFn(sel)) {
					e.preventDefault();
					return;
				}
			}
		} catch (err) { /* swallow — never block close on guard errors */ }
	});
};
