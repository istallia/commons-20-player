/* --- 各種パラメータの読み込み＆初期設定 --- */
if (typeof browser === 'undefined') browser = chrome;
if (sessionStorage.getItem('ista_volume_bgm') === null) {
	document.addEventListener('DOMContentLoaded', () => {
		browser.runtime.sendMessage({ctrl : 'get-volume'}, params => {
			sessionStorage.setItem('ista_volume_bgm', params['volume_bgm']);
			sessionStorage.setItem('ista_volume_se' , params['volume_se']);
			ista_volume_bgm = Number(sessionStorage.getItem('ista_volume_bgm') || '1');
			ista_volume_se  = Number(sessionStorage.getItem('ista_volume_se') || '1');
		});
	});
}
let ista_volume_bgm = Number(sessionStorage.getItem('ista_volume_bgm') || '1');
let ista_volume_se  = Number(sessionStorage.getItem('ista_volume_se') || '1');
