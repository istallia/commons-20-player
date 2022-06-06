/*
 * Copyright (C) 2021-2022 istallia
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

/* --- アイコンを定数として設定 --- */
const icons = {
	icon_play         : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMiAyNHYtMjRsMjAgMTItMjAgMTJ6Ii8+PC9zdmc+',
	icon_pause        : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTEgMjJoLTR2LTIwaDR2MjB6bTYtMjBoLTR2MjBoNHYtMjB6Ii8+PC9zdmc+',
	icon_stop         : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMiAyaDIwdjIwaC0yMHoiLz48L3N2Zz4=',
	icon_back         : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNNCAydjIwaC0ydi0yMGgyem0xOCAwbC0xNiAxMCAxNiAxMHYtMjB6Ii8+PC9zdmc+',
	icon_next         : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMjAgMjJ2LTIwaDJ2MjBoLTJ6bS0xOCAwbDE2LTEwLTE2LTEwdjIweiIvPjwvc3ZnPg==',
	icon_bookmark_off : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIgNS4xNzNsMi4zMzUgNC44MTcgNS4zMDUuNzMyLTMuODYxIDMuNzEuOTQyIDUuMjctNC43MjEtMi41MjQtNC43MjEgMi41MjUuOTQyLTUuMjctMy44NjEtMy43MSA1LjMwNS0uNzMzIDIuMzM1LTQuODE3em0wLTQuNTg2bC0zLjY2OCA3LjU2OC04LjMzMiAxLjE1MSA2LjA2NCA1LjgyOC0xLjQ4IDguMjc5IDcuNDE2LTMuOTY3IDcuNDE2IDMuOTY2LTEuNDgtOC4yNzkgNi4wNjQtNS44MjctOC4zMzItMS4xNS0zLjY2OC03LjU2OXoiLz48L3N2Zz4=',
	icon_bookmark_on  : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIgLjU4N2wzLjY2OCA3LjU2OCA4LjMzMiAxLjE1MS02LjA2NCA1LjgyOCAxLjQ4IDguMjc5LTcuNDE2LTMuOTY3LTcuNDE3IDMuOTY3IDEuNDgxLTguMjc5LTYuMDY0LTUuODI4IDguMzMyLTEuMTUxeiIvPjwvc3ZnPg=='
};
const icon_captions = {
	icon_play         : '再生',
	icon_pause        : '一時停止',
	icon_stop         : '連続再生を停止',
	icon_back         : '前のサウンド',
	icon_next         : '次のサウンド',
	icon_bookmark_off : 'ブックマーク',
	icon_bookmark_on  : 'ブックマークを取り消し'
};

/* --- 各種パラメータの読み込み＆初期設定 --- */
if (typeof browser === 'undefined') browser = chrome;
document.addEventListener('DOMContentLoaded', () => {
	browser.runtime.sendMessage({ctrl:'get-volume'}, params => {
		/* 音量の読み出し */
		sessionStorage.setItem('ista_volume_master', params['volume_master']);
		sessionStorage.setItem('ista_volume_bgm'   , params['volume_bgm']);
		sessionStorage.setItem('ista_volume_se'    , params['volume_se']);
		ista_volume_master = Number(sessionStorage.getItem('ista_volume_master') || '100');
		ista_volume_bgm    = Number(sessionStorage.getItem('ista_volume_bgm')    || '100');
		ista_volume_se     = Number(sessionStorage.getItem('ista_volume_se')     || '100');
		document.getElementById('ista-volume-master').value = ista_volume_master;
		document.getElementById('ista-volume-bgm').value    = ista_volume_bgm;
		document.getElementById('ista-volume-se').value     = ista_volume_se;
		document.getElementById('ista-view-volume-master').innerText = String(ista_volume_master);
		document.getElementById('ista-view-volume-bgm').innerText    = String(ista_volume_bgm);
		document.getElementById('ista-view-volume-se').innerText     = String(ista_volume_se);
		/* 音量調整用のイベント登録 */
		document.getElementById('ista-volume-master').addEventListener('input' , applyVolumeToBackground);
		document.getElementById('ista-volume-master').addEventListener('change', applyVolumeToBackground);
		document.getElementById('ista-volume-bgm').addEventListener('input' , applyVolumeToBackground);
		document.getElementById('ista-volume-bgm').addEventListener('change', applyVolumeToBackground);
		document.getElementById('ista-volume-se').addEventListener('input' , applyVolumeToBackground);
		document.getElementById('ista-volume-se').addEventListener('change', applyVolumeToBackground);
		/* 連続再生を開始するためのボタンを登録 */
		document.getElementById('start-autoplay').addEventListener('click', () => {
			browser.tabs.query({active:true, currentWindow:true, url:'*://commons.nicovideo.jp/*'}, tabs => {
				if (tabs.length < 1) return;
				const tab = tabs[0];
				browser.tabs.sendMessage(tab.id, {ctrl:'start-autoplay', tab_id:tab.id}, response => {
					if (response.is_playable) {
						/* ミニプレイヤーを配置 */
						addMiniPlayer(response.tab_id, response.title, response.commons_id);
					}
				});
			});
		});
		/* 再生中のタブ用のミニプレイヤーを用意 */
		browser.tabs.query({url:'*://commons.nicovideo.jp/*'}, tabs => {
			for (let i in tabs) {
				let tab_id = tabs[i].id;
				browser.tabs.sendMessage(tab_id, {ctrl:'get-autoplay-status', tab_id:tab_id}, response => {
					if (!response) return;
					if (response.autoplaying) {
						addMiniPlayer(response.tab_id, response.title, response.commons_id, response.now_playing);
					}
				});
			}
		});
	});
	/* そもそもコモンズのタブじゃなかったらボタン有効にしなくていいよね */
	browser.tabs.query({active:true, currentWindow:true, url:'*://commons.nicovideo.jp/*'}, tabs => {
		if (tabs.length < 1) document.getElementById('start-autoplay').disabled = true;
	});
});
let ista_volume_master = Number(sessionStorage.getItem('ista_volume_master') || '100');
let ista_volume_bgm    = Number(sessionStorage.getItem('ista_volume_bgm')    || '100');
let ista_volume_se     = Number(sessionStorage.getItem('ista_volume_se')     || '100');


/* --- ミニプレイヤーの追加(関数化) --- */
const addMiniPlayer = (tab_id, title, commons_id, now_playing = true) => {
	const main        = document.getElementById('mini-player');
	const mini_player = document.createElement('div');
	mini_player.id    = 'player-tab-' + String(tab_id);
	mini_player.setAttribute('tab_id', String(tab_id));
	mini_player.classList.add('mini-player');
	const span_title     = document.createElement('span');
	span_title.innerText = title;
	span_title.classList.add('mini-player-title');
	span_title.setAttribute('commons_id', commons_id);
	let func = span => browser.tabs.create({active:true, url:'https://commons.nicovideo.jp/material/'+span.getAttribute('commons_id')});
	span_title.addEventListener('click', func.bind(this, span_title));
	mini_player.appendChild(span_title);
	const icon_elements = Object.keys(icons).map(key => {
		if (key === 'icon_bookmark_on') return;
		const img = document.createElement('img');
		if (key === 'icon_play' || key === 'icon_pause') img.addEventListener('click', playAndPause);
		if (key === 'icon_next') img.addEventListener('click', nextAudio);
		if (key === 'icon_back') img.addEventListener('click', backAudio);
		if (key === 'icon_stop') img.addEventListener('click', stopAutoplay);
		if (key === 'icon_bookmark_off') img.addEventListener('click', toggleBookmark);
		if (key !== 'icon_pause' && !now_playing) {
			img.src   = icons[key];
			img.title = icon_captions[key];
			mini_player.appendChild(img);
		} else if (key !== 'icon_play' && now_playing) {
			img.src   = icons[key];
			img.title = icon_captions[key];
			mini_player.appendChild(img);
		}
	});
	main.appendChild(mini_player);
	updateBookmarkButton(tab_id, commons_id);
	func = id => {
		browser.tabs.sendMessage(id, {ctrl:'get-autoplay-status', tab_id:id}, response => {
			const mini_player = document.getElementById('player-tab-' + String(response.tab_id));
			if (mini_player) {
				const span = mini_player.querySelector('span.mini-player-title');
				if (response.title === span.innerText) return;
				const img      = mini_player.querySelector('img[title="'+icon_captions['icon_play']+'"], img[title="'+icon_captions['icon_pause']+'"]');
				span.innerText = response.title;
				span.setAttribute('commons_id', response.commons_id);
				icon_type = 'icon_play';
				if (response.now_playing) icon_type = 'icon_pause';
				img.src   = icons[icon_type];
				img.title = icon_captions[icon_type];
				updateBookmarkButton(id, response.commons_id);
			}
		});
	};
	const interval_id = setInterval(func.bind(this, tab_id), 250);
	mini_player.setAttribute('interval_id', interval_id);
};


/* --- 再生/一時停止ボタンの処理 --- */
const playAndPause = event => {
	const img    = event.currentTarget;
	const tab_id = Number(img.parentNode.getAttribute('tab_id'));
	if (img.title === icon_captions['icon_play']) {
		browser.tabs.sendMessage(tab_id, {ctrl:'play-audio'}, response => {
			img.src   = icons['icon_pause'];
			img.title = icon_captions['icon_pause'];
		});
	} else {
		browser.tabs.sendMessage(tab_id, {ctrl:'pause-audio'}, response => {
			img.src   = icons['icon_play'];
			img.title = icon_captions['icon_play'];
		});
	}
};


/* --- 次の/前のサウンドの処理 --- */
const nextAudio = event => {
	const img    = event.currentTarget;
	const tab_id = Number(img.parentNode.getAttribute('tab_id'));
	browser.tabs.sendMessage(tab_id, {ctrl:'next-audio'}, response => {
		const span     = img.parentNode.querySelector('span.mini-player-title');
		span.innerText = response.title;
		span.setAttribute('commons_id', response.commons_id);
		updateBookmarkButton(tab_id, response.commons_id);
	});
};
const backAudio = event => {
	const img    = event.currentTarget;
	const tab_id = Number(img.parentNode.getAttribute('tab_id'));
	browser.tabs.sendMessage(tab_id, {ctrl:'back-audio'}, response => {
		const span     = img.parentNode.querySelector('span.mini-player-title');
		span.innerText = response.title;
		span.setAttribute('commons_id', response.commons_id);
		updateBookmarkButton(tab_id, response.commons_id);
	});
};


/* --- 連続再生の停止処理 --- */
const stopAutoplay = event => {
	const img    = event.currentTarget;
	const tab_id = Number(img.parentNode.getAttribute('tab_id'));
	browser.tabs.sendMessage(tab_id, {ctrl:'stop-autoplay'}, response => {
		clearInterval(Number(img.parentNode.getAttribute('interval_id')));
		img.parentNode.remove();
	});
};


/* --- ブックマークの確認 --- */
const updateBookmarkButton = (tab_id, commons_id) => {
	const mini_player     = document.getElementById('player-tab-' + String(tab_id));
	const bookmark_button = mini_player.querySelector('img[title="'+icon_captions['icon_bookmark_off']+'"], img[title="'+icon_captions['icon_bookmark_on']+'"]');
	browser.runtime.sendMessage({
		ctrl : 'check-bookmarks',
		id   : commons_id
	}, check_result => {
		if (check_result.registered) {
			bookmark_button.src   = icons['icon_bookmark_on'];
			bookmark_button.title = icon_captions['icon_bookmark_on'];
		} else {
			bookmark_button.src   = icons['icon_bookmark_off'];
			bookmark_button.title = icon_captions['icon_bookmark_off'];
		}
	});
}


/* --- ブックマークの切り替え --- */
const toggleBookmark = event => {
	const icon = event.currentTarget;
	if (icon.title === icon_captions['icon_bookmark_off']) {
		addBookmark(event);
		icon.src   = icons['icon_bookmark_on'];
		icon.title = icon_captions['icon_bookmark_on'];
	} else {
		removeBookmark(event);
		icon.src   = icons['icon_bookmark_off'];
		icon.title = icon_captions['icon_bookmark_off'];
	}
};


/* --- ブックマークの追加 --- */
const addBookmark = event => {
	const mini_player = event.currentTarget.parentNode;
	const span        = mini_player.querySelector('span[commons_id]');
	browser.runtime.sendMessage({
		ctrl       : 'add-bookmark',
		commons_id : span.getAttribute('commons_id'),
		title      : span.innerText + ' - ニコニ・コモンズ'
	});
};


/* --- ブックマークの削除 --- */
const removeBookmark = event => {
	const mini_player = event.currentTarget.parentNode;
	const span        = mini_player.querySelector('span[commons_id]');
	browser.runtime.sendMessage({
		ctrl       : 'remove-bookmark',
		commons_id : span.getAttribute('commons_id')
	});
};


/* --- 音量バーからの反映 --- */
let applyVolumeToBackground = event => {
	ista_volume_master = Number(document.getElementById('ista-volume-master').value);
	ista_volume_bgm    = Number(document.getElementById('ista-volume-bgm').value);
	ista_volume_se     = Number(document.getElementById('ista-volume-se').value);
	sessionStorage.setItem('ista_volume_master', ista_volume_master);
	sessionStorage.setItem('ista_volume_bgm'   , ista_volume_bgm);
	sessionStorage.setItem('ista_volume_se'    , ista_volume_se);
	document.getElementById('ista-view-volume-master').innerText = String(ista_volume_master);
	document.getElementById('ista-view-volume-bgm').innerText    = String(ista_volume_bgm);
	document.getElementById('ista-view-volume-se').innerText     = String(ista_volume_se);
	browser.runtime.sendMessage({
		ctrl   : 'set-volume',
		master : ista_volume_master,
		bgm    : ista_volume_bgm,
		se     : ista_volume_se
	});
	browser.tabs.query({url:['*://commons.nicovideo.jp/*']}, tab => {
		for (let i in tab) {
			let id = tab[i].id;
			browser.tabs.sendMessage(id, {
				ctrl   : 'update-volume',
				master : ista_volume_master,
				bgm    : ista_volume_bgm,
				se     : ista_volume_se
			});
		}
	});
};


/* --- メッセージ受信 --- */
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.ctrl === 'update-title') {
		const mini_player = document.getElementById('player-tab-' + String(request.tab_id));
		if (mini_player) {
			const span     = mini_player.querySelector('span.mini-player-title');
			span.innerText = request.title;
			let icon_type  = 'icon_play';
			if (request.now_playing) icon_type = 'icon_pause';
			span.setAttribute('commons_id', request.commons_id);
			const img = mini_player.querySelector('img[title="' + icon_captions[icon_type] + '"]');
			img.src   = icons[icon_type];
			img.title = icon_captions[icon_type];
		}
	}
});


/* --- タブが更新されたら --- */
browser.tabs.onUpdated.addListener((tab_id, change_info, tab) => {
	if (['loading', 'complete'].indexOf(change_info.status) > -1 || change_info.url !== undefined) {
		/* ミニプレイヤーがあれば破棄 */
		const mini_player = document.getElementById('player-tab-'+String(tab_id));
		if (mini_player) {
			clearInterval(Number(mini_player.getAttribute('interval_id')));
			mini_player.remove();
		}
	}
});


/* --- タブが閉じられたら --- */
browser.tabs.onRemoved.addListener((tab_id, remove_info) => {
	/* ミニプレイヤーがあれば破棄 */
	const mini_player = document.getElementById('player-tab-'+String(tab_id));
	if (mini_player) {
		clearInterval(Number(mini_player.getAttribute('interval_id')));
		mini_player.remove();
	}
});
