/* --- アイコンを定数として設定 --- */
const icons = {
	icon_play  : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMiAyNHYtMjRsMjAgMTItMjAgMTJ6Ii8+PC9zdmc+',
	icon_pause : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTEgMjJoLTR2LTIwaDR2MjB6bTYtMjBoLTR2MjBoNHYtMjB6Ii8+PC9zdmc+',
	icon_stop  : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMiAyaDIwdjIwaC0yMHoiLz48L3N2Zz4=',
	icon_back  : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNNCAydjIwaC0ydi0yMGgyem0xOCAwbC0xNiAxMCAxNiAxMHYtMjB6Ii8+PC9zdmc+',
	icon_next  : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMjAgMjJ2LTIwaDJ2MjBoLTJ6bS0xOCAwbDE2LTEwLTE2LTEwdjIweiIvPjwvc3ZnPg=='
};
const icon_captions = {
	icon_play  : '再生',
	icon_pause : '一時停止',
	icon_stop  : '連続再生を停止',
	icon_back  : '前のサウンド',
	icon_next  : '次のサウンド'
};

/* --- 各種パラメータの読み込み＆初期設定 --- */
if (typeof browser === 'undefined') browser = chrome;
document.addEventListener('DOMContentLoaded', () => {
	browser.runtime.sendMessage({ctrl : 'get-volume'}, params => {
		/* 音量の読み出し */
		sessionStorage.setItem('ista_volume_bgm', params['volume_bgm']);
		sessionStorage.setItem('ista_volume_se' , params['volume_se']);
		ista_volume_bgm = Number(sessionStorage.getItem('ista_volume_bgm') || '100');
		ista_volume_se  = Number(sessionStorage.getItem('ista_volume_se') || '100');
		document.getElementById('ista-volume-bgm').value = ista_volume_bgm;
		document.getElementById('ista-volume-se').value  = ista_volume_se;
		document.getElementById('ista-view-volume-bgm').innerText = String(ista_volume_bgm);
		document.getElementById('ista-view-volume-se').innerText  = String(ista_volume_se);
		/* 音量調整用のイベント登録 */
		document.getElementById('ista-volume-bgm').addEventListener('input', applyVolumeToBackground);
		document.getElementById('ista-volume-bgm').addEventListener('change', applyVolumeToBackground);
		document.getElementById('ista-volume-se').addEventListener('input', applyVolumeToBackground);
		document.getElementById('ista-volume-se').addEventListener('change', applyVolumeToBackground);
		/* 連続再生を開始するためのボタンを登録 */
		document.getElementById('start-autoplay').addEventListener('click', () => {
			browser.tabs.query({active:true, currentWindow:true, url:'*://commons.nicovideo.jp/*'}, tabs => {
				if (tabs.length < 1) return;
				const tab = tabs[0];
				browser.tabs.sendMessage(tab.id, {ctrl:'start-autoplay', tab_id:tab.id}, response => {
					/* ミニプレイヤーを配置 */
					const main        = document.querySelector('main');
					const mini_player = document.createElement('div');
					mini_player.id    = 'player-tab-' + String(response.tab_id);
					mini_player.classList.add('mini-player');
					const span_title     = document.createElement('span');
					span_title.innerText = '(準備中...)';
					span_title.classList.add('mini-player-title');
					mini_player.appendChild(span_title);
					const icon_elements = Object.keys(icons).filter(str => str !== 'icon_play').map(str => {
						const img = document.createElement('img');
						img.src   = icons[str];
						img.title = icon_captions[str];
						mini_player.appendChild(img);
					});
					main.appendChild(mini_player);
				});
			});
		});
		/* 表示テスト用のハリボテプレイヤーを配置 */
		// const main        = document.querySelector('main');
		// const mini_player = document.createElement('div');
		// mini_player.classList.add('mini-player');
		// const span_title     = document.createElement('span');
		// span_title.innerText = '【Chrome拡張機能】サンプルテキストです。【特に何があるわけではない】';
		// span_title.classList.add('mini-player-title');
		// mini_player.appendChild(span_title);
		// const icon_elements = Object.keys(icons).filter(str => str !== 'icon_play').map(str => {
		// 	const img = document.createElement('img');
		// 	img.src   = icons[str];
		// 	img.title = icon_captions[str];
		// 	mini_player.appendChild(img);
		// });
		// main.appendChild(mini_player);
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
	browser.tabs.query({url:['*://commons.nicovideo.jp/*']}, tab => {
		for (let i in tab) {
			let id = tab[i].id;
			browser.tabs.sendMessage(id, {
				ctrl : 'update-volume',
				bgm  : ista_volume_bgm,
				se   : ista_volume_se
			});
		}
	});
};
