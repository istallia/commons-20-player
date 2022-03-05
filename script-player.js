/* --- 各種パラメータの読み込み＆初期設定 --- */
if (typeof browser === 'undefined') browser = chrome;
browser.runtime.sendMessage({ctrl : 'get-volume'}, params => {
	sessionStorage.setItem('ista_volume_master', params['volume_master']);
	sessionStorage.setItem('ista_volume_bgm'   , params['volume_bgm']);
	sessionStorage.setItem('ista_volume_se'    , params['volume_se']);
	ista_volume_master = Number(sessionStorage.getItem('ista_volume_master') || '100');
	ista_volume_bgm    = Number(sessionStorage.getItem('ista_volume_bgm')    || '100');
	ista_volume_se     = Number(sessionStorage.getItem('ista_volume_se')     || '100');
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


/* --- 指定番号の音声を再生する関数 --- */
const playAudio = (num, event) => {
	/* 音量の確認処理を挟む */
	browser.runtime.sendMessage({ctrl : 'get-volume'}, params => {
		sessionStorage.setItem('ista_volume_master', params['volume_master']);
		sessionStorage.setItem('ista_volume_bgm'   , params['volume_bgm']);
		sessionStorage.setItem('ista_volume_se'    , params['volume_se']);
    ista_volume_master = Number(sessionStorage.getItem('ista_volume_master'));
    ista_volume_bgm    = Number(sessionStorage.getItem('ista_volume_bgm'));
    ista_volume_se     = Number(sessionStorage.getItem('ista_volume_se'));
		/* インデックスを検証 */
		if (num >= ista_audio_obj.length) return;
		/* 素材種別に合わせて音量を設定 */
		let ista_volume = ista_volume_se;
		if (ista_audio_type[num] === 'audio01') ista_volume = ista_volume_bgm;
		ista_volume *= ista_volume_master / 100;
		/* 再生中の音声を停止 */
		if (ista_last_play_index !== null && ista_audio_obj[ista_last_play_index] !== null) {
			ista_audio_obj[ista_last_play_index].pause();
			ista_audio_obj[ista_last_play_index].currentTime = 0;
			if (num === ista_last_play_index && ista_audio_link[num].innerText === '再生中') {
				ista_audio_link[ista_last_play_index].innerText = '試聴';
				ista_nowplaying                                 = false;
				return;
			}
			ista_audio_link[ista_last_play_index].innerText = '試聴';
		}
		/* Audioオブジェクトを用意して再生 */
		if (ista_audio_obj[num] === null) return;
		ista_audio_obj[num].volume = ista_volume / 100;
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
			ista_audio_obj[num]            = null;
			ista_nowplaying                = false;
			if (ista_autoplaying && num < ista_audio_obj.length - 1) playAudio(num+1, null);
		});
		ista_last_play_index = num;
	});
};


/* --- プレイヤーを埋め込む関数 --- */
const appendPlayer = parent => {
	/* プレイヤー追加済みdivを除外 */
	if (parent.classList.contains('ista_cmn_player_parent')) return;
	/* 素材種別を判定 */
	let thumb_el = parent.querySelector('a img[src]')
	if (thumb_el === null) return;
	let thumb_url = thumb_el.getAttribute('src');
	thumb_url     = thumb_url.slice(-11, -4);
	if (thumb_url.slice(0,5) !== 'audio') return;
	/* コモンズIDを取り出す */
	const thumb_id = parent.querySelector('a').getAttribute('href').match(/(?<=\bnc)\d+/)[0];
	/* 素材種別に合わせて音量を設定 */
	let ista_volume = ista_volume_se;
	if (thumb_url === 'audio01') ista_volume = ista_volume_bgm;
	ista_volume *= ista_volume_master / 100;
	/* Audioを用意 */
	let audio_obj     = new Audio();
	audio_obj.volume  = ista_volume / 100;
	audio_obj.preload = 'none';
	audio_obj.src     = 'https://commons.nicovideo.jp/api/preview/get?cid=' + thumb_id;
	let ended_func = (n, event) => {
		ista_audio_link[n].innerText = '試聴';
		if (ista_autoplaying && n < ista_audio_obj.length - 1) {
			playAudio(n+1, null);
			return;
		} else if (ista_autoplaying) {
			browser.runtime.sendMessage({
				ctrl        : 'update-title',
				title       : ista_audio_title[ista_last_play_index],
				commons_id  : ista_audio_nc_id[ista_last_play_index],
				now_playing : false
			});
		}
		ista_nowplaying = false;
	};
	audio_obj.addEventListener('ended', ended_func.bind(this, ista_audio_obj.length));
	ista_audio_obj.push(audio_obj);
	ista_audio_type.push(thumb_url);
	ista_audio_nc_id.push('nc'+thumb_id);
	let alt_parent = parent;
	if (alt_parent.tagName.toLowerCase() !== 'li') alt_parent = alt_parent.parentNode;
	let title_element = alt_parent.querySelector('span.searchTitle, span.materialTitle, div.thumb_list_title > a, h3 > a, a.title_link[href], div.contentArea > a');
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
	console.log(div_link);
};


/* --- 読み込み時の処理 --- */
let ista_put_func = () => {
	const ista_thumb_list = [
		'li.searchItemCardArea',                        // 検索
		'tr[id^="material_"] > td.log_border',          // ユーザー投稿素材一覧
		'div.thumb_list_thumb',                         // ユーザーページ
		'li.materialsItemCardArea',                     // ランキング(トップページ)
		'div.materialsItemCardArea',                    // 新着作品(トップページ)
		'#index_box td.log_border',                     // ランキング
		'div.parentsCardArea',                          // コンテンツツリー
		'ul.childrenContentsCardList > li.childrenItem' // 小作品
	];
	let ista_divs = [... document.querySelectorAll(ista_thumb_list.map(selector => selector+' > a img[src]').join(', '))];
	console.log(ista_divs);
	for (let i in ista_divs) {
		if (ista_divs[i].parentNode.parentNode.tagName.toLowerCase() === 'a') {
			appendPlayer(ista_divs[i].parentNode.parentNode.parentNode);
		} else {
			appendPlayer(ista_divs[i].parentNode.parentNode);
		}
	}
};
setTimeout(ista_put_func, 0);
window.addEventListener('load', ista_put_func);
const target = document.querySelector("#index_box, #index_content, section.searchCardsArea, div.materialsContentsArea, div.tree-view, section.p-contentsTreeViewPage, section.p-treeParentsPage");
if (target !== null) {
	const observer = new MutationObserver(records => {
		if (records[0].addedNodes.length > 0) setTimeout(ista_put_func, 0);
	});
	observer.observe(target, {childList:true, subtree:true});
}


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
				is_playable : true,
				tab_id      : request.tab_id,
				title       : ista_audio_title[0],
				commons_id  : ista_audio_nc_id[0]
			});
		} else {
			sendResponse({
				is_playable : true,
				tab_id      : request.tab_id,
				title       : ista_audio_title[ista_last_play_index],
				commons_id  : ista_audio_nc_id[ista_last_play_index]
			});
		}
		return;
	}
	/* 連続再生の停止 */
	if (request.ctrl === 'stop-autoplay') {
		ista_audio_link[ista_last_play_index].innerText = '試聴';
		ista_audio_obj[ista_last_play_index].pause();
		ista_audio_obj[ista_last_play_index].currentTime = 0;
		ista_nowplaying                                  = false;
		ista_autoplaying                                 = false;
		sendResponse({});
		return;
	}
	/* 連続再生ステータスの返信 */
	if (request.ctrl === 'get-autoplay-status') {
		if (!ista_autoplaying) {
			sendResponse({
				tab_id      : request.tab_id,
				autoplaying : false
			});
			return;
		}
		sendResponse({
			tab_id      : request.tab_id,
			autoplaying : true,
			commons_id  : ista_audio_nc_id[ista_last_play_index],
			title       : ista_audio_title[ista_last_play_index],
			now_playing : ista_nowplaying
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
		ista_audio_obj[ista_last_play_index].pause();
		ista_audio_obj[ista_last_play_index].currentTime = 0;
		ista_nowplaying                                  = false;
		sendResponse({});
		return;
	}
	/* 次の/前のサウンド */
	if (request.ctrl === 'next-audio') {
		const new_play_index = (ista_last_play_index + 1) % ista_audio_obj.length;
		if (ista_nowplaying) playAudio(new_play_index, null);
		sendResponse({
			title      : ista_audio_title[new_play_index],
			commons_id : ista_audio_nc_id[new_play_index]
		});
	}
	if (request.ctrl === 'back-audio') {
		const new_play_index = Math.max(ista_last_play_index-1, 0);
		if (ista_nowplaying) playAudio(new_play_index, null);
		sendResponse({
			title      : ista_audio_title[new_play_index],
			commons_id : ista_audio_nc_id[new_play_index]
		});
	}
});
