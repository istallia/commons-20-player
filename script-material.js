/*
 * Copyright (C) 2021-2025 istallia
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/* --- 各種パラメータの読み込み＆初期設定 --- */
if (typeof browser === 'undefined') browser = chrome;
ista_volume_master = Number(sessionStorage.getItem('ista_volume_master') || '100');
ista_volume_bgm    = Number(sessionStorage.getItem('ista_volume_bgm')    || '100');
ista_volume_se     = Number(sessionStorage.getItem('ista_volume_se')     || '100');
browser.runtime.sendMessage({ctrl : 'get-preferences'}, params => {
	sessionStorage.setItem('ista_volume_master', params['volume_master']);
	sessionStorage.setItem('ista_volume_bgm'   , params['volume_bgm']);
	sessionStorage.setItem('ista_volume_se'    , params['volume_se']);
	ista_volume_master = Number(sessionStorage.getItem('ista_volume_master') || '100');
	ista_volume_bgm    = Number(sessionStorage.getItem('ista_volume_bgm')    || '100');
	ista_volume_se     = Number(sessionStorage.getItem('ista_volume_se')     || '100');
	setTimeout(applyVolume, 200);
});


/* --- 音量の反映 --- */
let ista_apply_try_count = 0;
const applyVolume = () => {
	let cmn_audio = document.getElementsByTagName('audio');
	if (cmn_audio.length > 0) {
		/* 素材種別の確認 */
		let cmn_thumb = document.querySelector('div.mainThumbnail > img').getAttribute('src');
		cmn_thumb     = cmn_thumb.slice(-11, -4);
		if (cmn_thumb.slice(0,5) === 'audio') {
			let cmn_volume = ista_volume_se;
			if (cmn_thumb === 'audio01') cmn_volume = ista_volume_bgm;
			cmn_volume *= ista_volume_master / 100;
			/* 音量の設定 */
			cmn_audio        = cmn_audio[0];
			cmn_audio.volume = cmn_volume / 100;
		}
	} else {
		/* 要素がなければ繰り返し */
		if (ista_apply_try_count++ < 50) {
			setTimeout(applyVolume, 200);
		}
	}
};
applyVolume();
