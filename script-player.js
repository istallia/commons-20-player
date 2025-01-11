/*
 * Copyright (C) 2021-2023 istallia
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
browser.runtime.sendMessage({ctrl : 'get-preferences'}, params => {
	sessionStorage.setItem('ista_volume_master', params['volume_master']);
	sessionStorage.setItem('ista_volume_bgm'   , params['volume_bgm']);
	sessionStorage.setItem('ista_volume_se'    , params['volume_se']);
	ista_volume_master = Number(sessionStorage.getItem('ista_volume_master') || '100');
	ista_volume_bgm    = Number(sessionStorage.getItem('ista_volume_bgm')    || '100');
	ista_volume_se     = Number(sessionStorage.getItem('ista_volume_se')     || '100');
	ista_bgm_filter    = params['bgm_filter_status'];
});
let ista_volume_master   = Number(sessionStorage.getItem('ista_volume_master') || '100');
let ista_volume_bgm      = Number(sessionStorage.getItem('ista_volume_bgm')    || '100');
let ista_volume_se       = Number(sessionStorage.getItem('ista_volume_se')     || '100');
let ista_audio_obj       = [];
let ista_audio_link      = [];
let ista_audio_type      = [];
let ista_audio_title     = [];
let ista_audio_nc_id     = [];
let ista_last_play_index = null;
let ista_autoplaying     = false;
let ista_nowplaying      = false;
let ista_bgm_filter      = false;


/* --- 指定番号の音声を再生する関数 --- */
const playAudio = (num, event) => {
	/* インデックスを検証 */
	if (num >= ista_audio_obj.length || num < 0) return;
	/* BGMフィルタが有効ならBGM以外は通さない */
	if (ista_audio_type[num] !== 'audio01' && ista_autoplaying && ista_bgm_filter) {
		console.log(`ista_audio_type[${num}] !== ${ista_audio_type[num]}`);
		if (event?.button_ctrl === 'back' || event?.button_ctrl === 'next') {
			const requested_num = event.button_ctrl === 'back' ? num+1 : num-1;
			playAudio(requested_num, {button_ctrl:event.button_ctrl});
			return;
		}
	}
	/* 音量の確認処理を挟む */
	browser.runtime.sendMessage({ctrl : 'get-preferences'}, params => {
		sessionStorage.setItem('ista_volume_master', params['volume_master']);
		sessionStorage.setItem('ista_volume_bgm'   , params['volume_bgm']);
		sessionStorage.setItem('ista_volume_se'    , params['volume_se']);
		ista_volume_master = Number(sessionStorage.getItem('ista_volume_master'));
		ista_volume_bgm    = Number(sessionStorage.getItem('ista_volume_bgm'));
		ista_volume_se     = Number(sessionStorage.getItem('ista_volume_se'));
		/* 素材種別に合わせて音量を設定 */
		let ista_volume = ista_volume_se;
		if (ista_audio_type[num] === 'audio01') ista_volume = ista_volume_bgm;
		ista_volume *= ista_volume_master / 100;
		/* 再生中の音声を停止 (Audio読み込み済みの場合) */
		if (ista_last_play_index !== null && ista_audio_obj[ista_last_play_index] !== null) {
			ista_audio_obj[ista_last_play_index].pause();
			ista_audio_obj[ista_last_play_index].currentTime = 0;
			if (num === ista_last_play_index && ista_audio_link[num].innerText === '再生中') {
				ista_audio_link[ista_last_play_index].innerText = '試聴';
				ista_audio_link[ista_last_play_index].classList.remove('nowplaying');
				ista_nowplaying = false;
				return;
			}
			ista_audio_link[ista_last_play_index].innerText = '試聴';
			ista_audio_link[ista_last_play_index].classList.remove('nowplaying');
		}
		/* コモンズIDを取り出す */
		const thumb_id = ista_audio_nc_id[num].slice(2);
		/* Audioがない場合、トークン取得→Audio取得 */
		ista_audio_link[num].innerText = '通信中';
		ista_audio_link[num].classList.add('nowplaying');
		if (ista_audio_obj[num] === null) {
			fetch(`https://public-api.commons.nicovideo.jp/v1/materials/${thumb_id}/preview-session`, {
				credentials : 'include',
				method      : 'POST'
			})
			.then(response => {
				if (response.ok) {
					return response.json();
				} else {
					ista_audio_link[num].innerText = '試聴不可';
					ista_audio_link[num].classList.remove('nowplaying');
					ista_audio_obj[num] = null;
					ista_nowplaying     = false;
					throw new Error(response.statusText);
				}
			})
			.then(data => {
				/* Audioオブジェクトを用意して再生 */
				const audio_url     = `https://deliver.commons.nicovideo.jp/audio_preview/1/nc${thumb_id}?token=${data.data.token}&time=${data.data.time}`;
				const audio_obj     = new Audio(audio_url);
				audio_obj.volume    = ista_volume / 100;
				ista_audio_obj[num] = audio_obj;
				audio_obj.addEventListener('ended', () => {
					ista_audio_link[num].innerText = '試聴';
					ista_audio_link[num].classList.remove('nowplaying');
					ista_nowplaying = false;
					if (ista_autoplaying && num < ista_audio_obj.length - 1) {
						playAudio(num+1, null);
					} else if (ista_autoplaying) {
						browser.runtime.sendMessage({
							ctrl        : 'update-title',
							title       : ista_audio_title[ista_last_play_index],
							commons_id  : ista_audio_nc_id[ista_last_play_index],
							now_playing : false
						});
					}
				});
				audio_obj.play().then(() => {
					ista_audio_link[num].innerText = '再生中';
					ista_nowplaying                = true;
					browser.runtime.sendMessage({
						ctrl        : 'update-title',
						title       : ista_audio_title[num],
						commons_id  : ista_audio_nc_id[num]
					});
				}, () => {
					ista_audio_link[num].innerText = '試聴不可';
					ista_audio_link[num].classList.remove('nowplaying');
					ista_audio_obj[num] = null;
					ista_nowplaying     = false;
					if (ista_autoplaying && num < ista_audio_obj.length - 1) playAudio(num+1, null);
				});
			});
			ista_last_play_index = num;
			return;
		}
		/* Audioオブジェクトを用意して再生 (Audio読み込み済みの場合) */
		ista_audio_obj[num].volume     = ista_volume / 100;
		ista_audio_link[num].innerText = '通信中';
		ista_audio_link[num].classList.add('nowplaying');
		ista_audio_obj[num].play().then(() => {
			ista_audio_link[num].innerText = '再生中';
			ista_nowplaying                = true;
			browser.runtime.sendMessage({
				ctrl        : 'update-title',
				title       : ista_audio_title[num],
				commons_id  : ista_audio_nc_id[num],
				now_playing : true
			});
		}, () => {
			ista_audio_link[num].innerText = '試聴不可';
			ista_audio_link[num].classList.remove('nowplaying');
			ista_audio_obj[num] = null;
			ista_nowplaying     = false;
			if (ista_autoplaying && num < ista_audio_obj.length - 1) playAudio(num+1, null);
		});
		ista_last_play_index = num;
	});
};


/* --- プレイヤーを埋め込む関数 --- */
const appendPlayer = parent => {
	/* プレイヤー追加済みdivを除外 */
	if (parent.classList.contains('ista_cmn_player_parent')) return;
	/* タイトル要素を取得 */
	let alt_parent = parent;
	if (alt_parent.tagName.toLowerCase() !== 'li') alt_parent = alt_parent.parentNode;
	const title_element = alt_parent.querySelector('span.searchTitle, span.materialTitle, div.thumb_list_title > a, h3 > a, a.title_link[href], div.thumbnailBoxListTitle > a, div.contentArea > a');
	if (!title_element) return;
	/* 素材種別を判定 */
	let thumb_el = parent.querySelector('a img[src]');
	if (thumb_el === null) return;
	const thumb_url     = thumb_el.getAttribute('src');
	const thumb_url_obj = new URL(thumb_url, 'https://commons.nicovideo.jp');
	const thumb_name    = thumb_url_obj.pathname.split('/').pop().slice(0, -4);
	// console.log([thumb_url, thumb_url_obj.pathname.split('/').pop()]);
	if (!thumb_url_obj.pathname.split('/').pop().startsWith('audio')) return;
	/* コモンズIDを取り出す */
	const thumb_id = parent.querySelector('a').getAttribute('href').match(/(?<=\bnc)\d+/)[0];
	/* 素材種別に合わせて音量を設定 */
	let ista_volume = ista_volume_se;
	if (thumb_name === 'audio01') ista_volume = ista_volume_bgm;
	ista_volume *= ista_volume_master / 100;
	ista_audio_obj.push(null);
	ista_audio_type.push(thumb_name);
	ista_audio_nc_id.push('nc'+thumb_id);
	ista_audio_title.push(title_element.innerText);
	/* テキストリンクをdivに入れて追加 */
	let div_link = document.createElement('div');
	let a_link   = document.createElement('a');
	div_link.classList.add('ista_cmn_player');
	a_link.innerText = '試聴';
	a_link.href      = 'javascript:void(0)';
	a_link.addEventListener('click', playAudio.bind(this, ista_audio_obj.length-1));
	div_link.appendChild(a_link);
	parent.appendChild(div_link);
	parent.classList.add('ista_cmn_player_parent');
	ista_audio_link.push(a_link);
	// console.log(div_link);
};


/* --- 読み込み時の処理 --- */
const addPlayerToCards = () => {
	const img_list = [
		'a[href*="/works/nc"] img[src*="/audio00.png"]',
		'a[href*="/works/nc"] img[src*="/audio01.png"]',
		'a[href*="/works/nc"] img[src*="/audio02.png"]',
		'a[href*="/works/nc"] img[src*="/audio03.png"]',
		'a[href*="/material/nc"] img[src*="/audio00.png"]',
		'a[href*="/material/nc"] img[src*="/audio01.png"]',
		'a[href*="/material/nc"] img[src*="/audio02.png"]',
		'a[href*="/material/nc"] img[src*="/audio03.png"]',
		'a[href*="/tree/nc"] img[src*="/audio00.png"]',
		'a[href*="/tree/nc"] img[src*="/audio01.png"]',
		'a[href*="/tree/nc"] img[src*="/audio02.png"]',
		'a[href*="/tree/nc"] img[src*="/audio03.png"]'
	];
	let ista_divs = [... document.querySelectorAll(img_list.join(','))];
	// console.log(ista_divs);
	for (let i in ista_divs) {
		if (ista_divs[i].parentNode.parentNode.tagName.toLowerCase() === 'a') {
			appendPlayer(ista_divs[i].parentNode.parentNode.parentNode);
		} else {
			appendPlayer(ista_divs[i].parentNode.parentNode);
		}
	}
	const target = document.querySelector("div.indexContentsArea, div.l-globalMain, section.searchCardsArea, div.materialsContentsArea, div.tree-view, section.p-contentsTreeViewPage, section.p-treeParentsPage");
	if (target && !target.classList.contains('ista-observing')) {
		const observer = new MutationObserver(records => {
			if (records[0].addedNodes.length > 0) setTimeout(addPlayerToCards, 0);
		});
		observer.observe(target, {childList:true, subtree:true});
		target.classList.add('ista-observing');
	} else {
		setTimeout(addPlayerToCards, 500);
	}
};
setTimeout(addPlayerToCards, 0);
window.addEventListener('load', addPlayerToCards);



/* --- ポップアップからの操作 --- */
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	/* 音量の反映 */
	if (request.ctrl === 'update-volume') {
		/* まだ再生していない場合は無視 */
		if (ista_last_play_index === null || ista_audio_obj[ista_last_play_index] === null) return;
		/* 変数にも反映 */
		sessionStorage.setItem('ista_volume_master', request.master);
		sessionStorage.setItem('ista_volume_bgm'   , request.bgm);
		sessionStorage.setItem('ista_volume_se'    , request.se);
		ista_volume_master = Number(sessionStorage.getItem('ista_volume_master'));
		ista_volume_bgm    = Number(sessionStorage.getItem('ista_volume_bgm'));
		ista_volume_se     = Number(sessionStorage.getItem('ista_volume_se'));
		/* 音量の調整 */
		let ista_volume = ista_volume_se;
		if (ista_audio_type[ista_last_play_index] === 'audio01') ista_volume = ista_volume_bgm;
		ista_volume *= ista_volume_master / 100;
		ista_audio_obj[ista_last_play_index].volume = ista_volume / 100;
		return;
	}
	/* 連続再生の開始 */
	if (request.ctrl === 'start-autoplay') {
		/* 連続再生が可能かを確認 */
		if (ista_autoplaying || ista_audio_obj.length < 1) {
			sendResponse({is_playable:false, tab_id:request.tab_id});
			return;
		}
		ista_autoplaying = true;
		/* 再生を開始する */
		if (!ista_nowplaying) {
			playAudio(0, null);
			sendResponse({
				is_playable       : true,
				tab_id            : request.tab_id,
				title             : ista_audio_title[0],
				commons_id        : ista_audio_nc_id[0],
				bgm_filter_status : ista_bgm_filter
			});
		} else {
			sendResponse({
				is_playable       : true,
				tab_id            : request.tab_id,
				title             : ista_audio_title[ista_last_play_index],
				commons_id        : ista_audio_nc_id[ista_last_play_index],
				bgm_filter_status : ista_bgm_filter
			});
		}
		return;
	}
	/* 連続再生の停止 */
	if (request.ctrl === 'stop-autoplay') {
		ista_audio_link[ista_last_play_index].innerText = '試聴';
		ista_audio_link[ista_last_play_index].classList.remove('nowplaying');
		ista_audio_obj[ista_last_play_index].pause();
		ista_audio_obj[ista_last_play_index].currentTime = 0;
		ista_nowplaying  = false;
		ista_autoplaying = false;
		sendResponse({});
		return;
	}
	/* BGMフィルタのOn/Off */
	if (request.ctrl === 'change-bgm-filter') {
		ista_bgm_filter = request.status;
		return;
	}
	/* 連続再生ステータスの返信 */
	if (request.ctrl === 'get-autoplay-status') {
		if (!ista_autoplaying) {
			sendResponse({
				tab_id      : request.tab_id,
				autoplaying : false
			});
			if (ista_audio_obj.length < 1) addPlayerToCards();
			return;
		}
		sendResponse({
			tab_id            : request.tab_id,
			autoplaying       : true,
			commons_id        : ista_audio_nc_id[ista_last_play_index],
			title             : ista_audio_title[ista_last_play_index],
			now_playing       : ista_nowplaying,
			bgm_filter_status : ista_bgm_filter
		});
		return;
	}
	/* 再生/一時停止 */
	if (request.ctrl === 'play-audio') {
		playAudio(ista_last_play_index, null);
		sendResponse({});
		return;
	}
	if (request.ctrl === 'pause-audio' && ista_nowplaying) {
		ista_audio_link[ista_last_play_index].innerText = '試聴';
		ista_audio_link[ista_last_play_index].classList.remove('nowplaying');
		ista_audio_obj[ista_last_play_index].pause();
		ista_audio_obj[ista_last_play_index].currentTime = 0;
		ista_nowplaying = false;
		sendResponse({});
		return;
	}
	/* 次の/前のサウンド */
	if (request.ctrl === 'next-audio') {
		const new_play_index = (ista_last_play_index + 1) % ista_audio_obj.length;
		if (ista_nowplaying) playAudio(new_play_index, {button_ctrl:'next'});
		sendResponse({
			title      : ista_audio_title[new_play_index],
			commons_id : ista_audio_nc_id[new_play_index]
		});
	}
	if (request.ctrl === 'back-audio') {
		const new_play_index = Math.max(ista_last_play_index-1, 0);
		if (ista_nowplaying) playAudio(new_play_index, {button_ctrl:'back'});
		sendResponse({
			title      : ista_audio_title[new_play_index],
			commons_id : ista_audio_nc_id[new_play_index]
		});
	}
});
