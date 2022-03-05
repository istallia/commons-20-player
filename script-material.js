/* --- 各種パラメータの読み込み＆初期設定 --- */
if (typeof browser === 'undefined') browser = chrome;
ista_volume_master = Number(sessionStorage.getItem('ista_volume_master') || '100');
ista_volume_bgm    = Number(sessionStorage.getItem('ista_volume_bgm')    || '100');
ista_volume_se     = Number(sessionStorage.getItem('ista_volume_se')     || '100');
browser.runtime.sendMessage({ctrl : 'get-volume'}, params => {
	sessionStorage.setItem('ista_volume_master', params['volume_master']);
	sessionStorage.setItem('ista_volume_bgm'   , params['volume_bgm']);
	sessionStorage.setItem('ista_volume_se'    , params['volume_se']);
	ista_volume_master = Number(sessionStorage.getItem('ista_volume_master') || '100');
	ista_volume_bgm    = Number(sessionStorage.getItem('ista_volume_bgm')    || '100');
	ista_volume_se     = Number(sessionStorage.getItem('ista_volume_se')     || '100');
	applyVolume();
});


/* --- 音量の反映 --- */
const applyVolume = () => {
	let cmn_audio = document.getElementsByTagName('audio');
	if (cmn_audio.length > 0) {
		/* 素材種別の確認 */
		let cmn_thumb = document.querySelector('div.materialPreviewSmallThumbArea > img').getAttribute('src');
		cmn_thumb     = cmn_thumb.slice(-11, -4);
		if (cmn_thumb.slice(0,5) === 'audio') {
			let cmn_volume = ista_volume_se;
			if (cmn_thumb === 'audio01') cmn_volume = ista_volume_bgm;
			cmn_volume *= ista_volume_master / 100;
			/* 音量の設定 */
			cmn_audio        = cmn_audio[0];
			cmn_audio.volume = cmn_volume / 100;
		}
	}
};
applyVolume();
