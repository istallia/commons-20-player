/* --- 各種パラメータの読み込み＆初期設定 --- */
if (typeof browser === 'undefined') browser = chrome;
document.addEventListener('DOMContentLoaded', () => {
	browser.runtime.sendMessage({ctrl : 'get-volume'}, params => {
		sessionStorage.setItem('ista_volume_bgm', params['volume_bgm']);
		sessionStorage.setItem('ista_volume_se' , params['volume_se']);
		ista_volume_bgm = Number(sessionStorage.getItem('ista_volume_bgm') || '100');
		ista_volume_se  = Number(sessionStorage.getItem('ista_volume_se') || '100');
		document.getElementById('ista-volume-bgm').value = ista_volume_bgm;
		document.getElementById('ista-volume-se').value  = ista_volume_se;
		document.getElementById('ista-view-volume-bgm').innerText = String(ista_volume_bgm);
		document.getElementById('ista-view-volume-se').innerText  = String(ista_volume_se);
		document.getElementById('ista-volume-bgm').addEventListener('input', applyVolumeToBackground);
		document.getElementById('ista-volume-bgm').addEventListener('change', applyVolumeToBackground);
		document.getElementById('ista-volume-se').addEventListener('input', applyVolumeToBackground);
		document.getElementById('ista-volume-se').addEventListener('change', applyVolumeToBackground);
	});
});
let ista_volume_bgm = Number(sessionStorage.getItem('ista_volume_bgm') || '100');
let ista_volume_se  = Number(sessionStorage.getItem('ista_volume_se') || '100');


/* --- 音量バーからの反映 --- */
let applyVolumeToBackground = event => {
	ista_volume_bgm = Number(document.getElementById('ista-volume-bgm').value);
	ista_volume_se  = Number(document.getElementById('ista-volume-se').value);
	sessionStorage.setItem('ista_volume_bgm', ista_volume_bgm);
	sessionStorage.setItem('ista_volume_se' , ista_volume_se);
	document.getElementById('ista-view-volume-bgm').innerText = String(ista_volume_bgm);
	document.getElementById('ista-view-volume-se').innerText  = String(ista_volume_se);
	browser.runtime.sendMessage({
		ctrl : 'set-volume',
		bgm  : ista_volume_bgm,
		se   : ista_volume_se
	});
	chrome.tabs.query({active:true, lastFocusedWindow:true}, function(tab) {
		chrome.tabs.sendMessage(tab[0].id, {
			ctrl : 'update-volume',
			bgm  : ista_volume_bgm,
			se   : ista_volume_se
		});
	});
};
