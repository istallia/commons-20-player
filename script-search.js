/* --- 各種パラメータの読み込み＆初期設定 --- */
let ista_volume_bgm      = Number(localStorage.getItem('ista_volume_bgm') || '1');
let ista_volume_se       = Number(localStorage.getItem('ista_volume_se') || '1');
let ista_audio_obj       = [];
let ista_audio_link      = [];
let ista_last_play_index = null;


/* --- 指定番号の音声を再生する関数 --- */
const playAudio = (num, event) => {
	/* インデックスを検証 */
	if (num >= ista_audio_obj.length) return;
	/* 再生中の音声を停止 */
	if (ista_last_play_index !== null && ista_audio_obj[ista_last_play_index] !== null) {
		ista_audio_obj[ista_last_play_index].pause();
		ista_audio_obj[ista_last_play_index].currentTime = 0;
	}
	/* Audioオブジェクトを用意して再生 */
	if (ista_audio_obj[num] === null) return;
	ista_audio_obj[num].play().then(() => {}, () => {
		ista_audio_link[num].innerHTML = '試聴不可';
		ista_audio_obj[num]            = null;
	});
	ista_last_play_index = num;
};


/* --- プレイヤーを埋め込む関数 --- */
const appendPlayer = parent => {
	/* プレイヤー追加済みdivを除外 */
	console.log('parent', parent);
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
	console.log('thumb_id' , thumb_id);
	console.log('thumb_url', thumb_url);
	/* Audioを用意 */
	let audio_obj     = new Audio();
	audio_obj.volume  = ista_volume;
	audio_obj.preload = 'none';
	audio_obj.src     = 'https://commons.nicovideo.jp/api/preview/get?cid=' + thumb_id;
	ista_audio_obj.push(audio_obj);
	/* テキストリンクをdivに入れて追加 */
	let div_link = document.createElement('div');
	let a_link   = document.createElement('a');
	div_link.classList.add('cmn_thumb_L');
	a_link.innerHTML = '試聴';
	a_link.href      = 'javascript:void(0)';
	a_link.addEventListener('click', playAudio.bind(this, ista_audio_obj.length-1));
	div_link.appendChild(a_link);
	parent.appendChild(div_link);
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
