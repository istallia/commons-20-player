/* --- 音量の読み込み --- */
let ista_volume_bgm = Number(localStorage.getItem('ista_volume_bgm') || '1');
let ista_volume_se  = Number(localStorage.getItem('ista_volume_se') || '1');


/* --- 音量の反映 --- */
let cmn_audio = document.getElementsByTagName('audio');
if (cmn_audio.length > 0) {
	/* 素材種別の確認 */
	let cmn_thumb = document.querySelector('div.commons_thumbnail > img').getAttribute('src');
	cmn_thumb     = cmn_thumb.slice(-11, -4);
	if (cmn_thumb.slice(0,5) === 'audio') {
		let cmn_volume = ista_volume_se;
		if (cmn_thumb === 'audio01') cmn_volume = ista_volume_bgm;
		/* 音量の設定 */
		cmn_audio        = cmn_audio[0];
		cmn_audio.volume = cmn_volume;
	}
}