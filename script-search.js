/* --- 各種パラメータの読み込み＆初期設定 --- */
let ista_volume_master = Number(localStorage.getItem('ista_volume_master') || '1');
let ista_volume_bgm    = Number(localStorage.getItem('ista_volume_bgm') || '1');
let ista_volume_se     = Number(localStorage.getItem('ista_volume_se') || '1');


/* --- プレイヤーを埋め込む関数 --- */
const appendPlayer = parent => {
	/* プレイヤー追加済みdivを除外 */
	if (parent.querySelectorAll('cmn_thumb_L').length > 1) return;
	/* 素材種別を判定 */
	const thumb_url = parent.querySelector('div.cmn_thumb_L > a > img').getAttribute('src');
	thumb_url       = thumb_url.slice(-11, -4);
	if (thumb_url.slice(0,6) !== 'audio') return;
	/* 素材種別に合わせて音量を設定 */
	let volume = ista_volume_se;
	if (thumb_url === 'audio01') volume = ista_volume_bgm;
	volume *= ista_volume_master;
};