/* --- 各種パラメータの読み込み --- */
if (typeof browser === 'undefined') browser = chrome;
let ista_volume_bgm = Number(localStorage.getItem('ista_volume_bgm') || '0.5');
let ista_volume_se  = Number(localStorage.getItem('ista_volume_se') || '0.5');


/* --- 音量の取得 --- */
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	sendResponse({
		volume_bgm : ista_volume_bgm,
		volume_se  : ista_volume_se
	});
});
