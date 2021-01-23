/* --- browserの読み込み --- */
if (typeof browser === 'undefined') browser = chrome;


/* --- 音量の取得 --- */
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	ista_volume_bgm = Number(localStorage.getItem('ista_volume_bgm') || '100');
	ista_volume_se  = Number(localStorage.getItem('ista_volume_se') || '100');
	if (request.ctrl === 'get-volume') {
		sendResponse({
			volume_bgm : ista_volume_bgm,
			volume_se  : ista_volume_se
		});
		return true;
	} else if (request.ctrl === 'set-volume') {
		ista_volume_bgm = Number(request.bgm);
		ista_volume_se  = Number(request.se);
		localStorage.setItem('ista_volume_bgm', ista_volume_bgm);
		localStorage.setItem('ista_volume_se' , ista_volume_se);
	}
});
