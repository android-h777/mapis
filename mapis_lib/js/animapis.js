/*!
 * animapis.js — animapis.css 제어 헬퍼 (vanilla JS, 의존성 0)
 *
 * 기존 클래스 토글 방식(addClass('animapis__animated animapis__flipInX'))도
 * 그대로 동작한다. 이 헬퍼는 "효과 클래스 제거 → 강제 reflow → 재추가"라는
 * 재생 보장 절차와 완료 감지(Promise)를 캡슐화해 실행/중단을 한 줄로 만든다.
 *
 *   animapis.play('#box', 'flipInX').then(fn);   // 재생 후 완료 콜백
 *   animapis.play(els, 'fadeInLeft', { loop:true, duration:600, delay:100 });
 *   animapis.stop('#box');                        // 즉시 중단 + 클래스 정리
 *
 * target: CSS 셀렉터 / DOM 엘리먼트 / NodeList·배열 / jQuery 객체 모두 허용
 */
(function (global) {
	'use strict';

	var PREFIX = 'animapis__';
	var BASE = PREFIX + 'animated';

	function toElements(target) {
		if (!target) return [];
		if (typeof target === 'string') {
			return Array.prototype.slice.call(document.querySelectorAll(target));
		}
		if (target.nodeType === 1) return [target];
		if (target.jquery) return target.toArray();                       // jQuery 객체
		if (typeof target.length === 'number') {                          // NodeList / 배열
			return Array.prototype.slice.call(target);
		}
		return [target];
	}

	function toMs(v) {
		if (v == null || v === '') return '';
		return typeof v === 'number' ? v + 'ms' : String(v);
	}

	// 해당 요소에 붙은 animapis__ 효과 클래스를 모두 제거
	function clearEffects(el) {
		var remove = [];
		for (var i = 0; i < el.classList.length; i++) {
			var c = el.classList[i];
			if (c.lastIndexOf(PREFIX, 0) === 0) remove.push(c);
		}
		for (var j = 0; j < remove.length; j++) el.classList.remove(remove[j]);
		// 헬퍼가 인라인으로 주입한 변수/스타일 초기화
		el.style.removeProperty('--ap-dur');
		el.style.removeProperty('--ap-delay');
		el.style.removeProperty('--ap-iter');
		el.style.removeProperty('--ap-ease');
	}

	function playOne(el, effect, options) {
		return new Promise(function (resolve) {
			clearEffects(el);

			if (options.duration != null) el.style.setProperty('--ap-dur', toMs(options.duration));
			if (options.delay != null) el.style.setProperty('--ap-delay', toMs(options.delay));
			if (options.easing) el.style.setProperty('--ap-ease', options.easing);
			if (options.loop) el.style.setProperty('--ap-iter', 'infinite');

			void el.offsetWidth;                      // 강제 reflow → 재생 보장
			el.classList.add(BASE, PREFIX + effect);

			if (options.loop) { resolve(el); return; } // 무한 반복은 완료가 없으므로 즉시 resolve

			var onEnd = function (e) {
				if (e.target !== el) return;           // 자식 애니메이션 무시
				el.removeEventListener('animationend', onEnd);
				if (typeof options.onEnd === 'function') options.onEnd(el);
				resolve(el);
			};
			el.addEventListener('animationend', onEnd);
		});
	}

	function play(target, effect, options) {
		options = options || {};
		var els = toElements(target);
		return Promise.all(els.map(function (el) { return playOne(el, effect, options); }));
	}

	function stop(target) {
		toElements(target).forEach(function (el) {
			clearEffects(el);
			void el.offsetWidth;
		});
	}

	global.animapis = { play: play, stop: stop, PREFIX: PREFIX };

})(window);
