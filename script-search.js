/* --- 各種パラメータの読み込み＆初期設定 --- */
if (typeof browser === 'undefined') browser = chrome;
browser.runtime.sendMessage({ctrl : 'get-volume'}, params => {
	sessionStorage.setItem('ista_volume_bgm', params['volume_bgm']);
	sessionStorage.setItem('ista_volume_se' , params['volume_se']);
	ista_volume_bgm = Number(sessionStorage.getItem('ista_volume_bgm') || '100');
	ista_volume_se  = Number(sessionStorage.getItem('ista_volume_se') || '100');
});
let ista_volume_bgm      = Number(sessionStorage.getItem('ista_volume_bgm') || '100');
let ista_volume_se       = Number(sessionStorage.getItem('ista_volume_se') || '100');
let ista_audio_obj       = [];
let ista_audio_link      = [];
let ista_audio_type      = [];
let ista_last_play_index = null;


/* --- 指定番号の音声を再生する関数 --- */
const playAudio = (num, event) => {
	/* 音量の確認処理を挟む */
	browser.runtime.sendMessage({ctrl : 'get-volume'}, params => {
		sessionStorage.setItem('ista_volume_bgm', params['volume_bgm']);
		sessionStorage.setItem('ista_volume_se' , params['volume_se']);
    ista_volume_bgm = Number(sessionStorage.getItem('ista_volume_bgm'));
    ista_volume_se  = Number(sessionStorage.getItem('ista_volume_se'));
		/* インデックスを検証 */
		if (num >= ista_audio_obj.length) return;
		/* 素材種別に合わせて音量を設定 */
		let ista_volume = ista_volume_se;
		if (ista_audio_type[num] === 'audio01') ista_volume = ista_volume_bgm;
		/* 再生中の音声を停止 */
		if (ista_last_play_index !== null && ista_audio_obj[ista_last_play_index] !== null) {
			ista_audio_obj[ista_last_play_index].pause();
			ista_audio_obj[ista_last_play_index].currentTime = 0;
			if (num === ista_last_play_index && ista_audio_link[num].innerText === '再生中') {
				ista_audio_link[ista_last_play_index].innerText = '試聴';
				return;
			}
			ista_audio_link[ista_last_play_index].innerText = '試聴';
		}
		/* Audioオブジェクトを用意して再生 */
		if (ista_audio_obj[num] === null) return;
		ista_audio_obj[num].volume = ista_volume / 100;
		ista_audio_obj[num].play().then(() => {
			ista_audio_link[num].innerText = '再生中';
			let ended_func = (n, event) => ista_audio_link[n].innerText = '試聴';
			ista_audio_obj[num].addEventListener('ended', ended_func.bind(this, num));
		}, () => {
			ista_audio_link[num].innerText = '試聴不可';
			ista_audio_obj[num]            = null;
		});
		ista_last_play_index = num;
	});
};


/* --- プレイヤーを埋め込む関数 --- */
const appendPlayer = parent => {
	/* プレイヤー追加済みdivを除外 */
	if (parent.querySelectorAll('.cmn_thumb_L').length > 1) return;
	/* 素材種別を判定 */
	let thumb_url = parent.querySelector('div.cmn_thumb_L > a > img').getAttribute('src');
	thumb_url     = thumb_url.slice(-11, -4);
	if (thumb_url.slice(0,5) !== 'audio') return;
	/* コモンズIDを取り出す */
	let thumb_id = parent.querySelector('div.cmn_thumb_L > a').getAttribute('href');
	thumb_id     = thumb_id.split('/')[2].slice(2);
	/* 素材種別に合わせて音量を設定 */
	let ista_volume = ista_volume_se;
	if (thumb_url === 'audio01') ista_volume = ista_volume_bgm;
	/* Audioを用意 */
	let audio_obj     = new Audio();
	audio_obj.volume  = ista_volume / 100;
	audio_obj.preload = 'none';
	audio_obj.src     = 'https://commons.nicovideo.jp/api/preview/get?cid=' + thumb_id;
	ista_audio_obj.push(audio_obj);
	ista_audio_type.push(thumb_url);
	/* テキストリンクをdivに入れて追加 */
	let div_link = document.createElement('div');
	let a_link   = document.createElement('a');
	div_link.classList.add('ista_cmn_player');
	a_link.innerText = '試聴';
	a_link.href      = 'javascript:void(0)';
	a_link.addEventListener('click', playAudio.bind(this, ista_audio_obj.length-1));
	div_link.appendChild(a_link);
	parent.querySelector('.cmn_thumb_L').appendChild(div_link);
	ista_audio_link.push(a_link);
};


/* 読み込み時の処理 */
let ista_put_func = () => {
	let ista_divs = [... document.getElementsByClassName('cmn_thumb_frm')];
	if (ista_divs.length < 1) {
		setTimeout(ista_put_func, 200);
		return;
	}
	for (let i in ista_divs) {
		appendPlayer(ista_divs[i]);
	}
};
setTimeout(ista_put_func, 0);


/* --- 音量変更時の反映 --- */
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.ctrl === 'update-volume') {
		/* まだ再生していない場合は無視 */
		if (ista_last_play_index === null || ista_audio_obj[ista_last_play_index] === null) return;
		/* 変数にも反映 */
		sessionStorage.setItem('ista_volume_bgm', request.bgm);
		sessionStorage.setItem('ista_volume_se' , request.se);
    ista_volume_bgm = Number(sessionStorage.getItem('ista_volume_bgm'));
    ista_volume_se  = Number(sessionStorage.getItem('ista_volume_se'));
		/* 音量の調整 */
		let ista_volume = ista_volume_se;
		if (ista_audio_type[ista_last_play_index] === 'audio01') ista_volume = ista_volume_bgm;
		ista_audio_obj[ista_last_play_index].volume = ista_volume / 100;
	}
});
