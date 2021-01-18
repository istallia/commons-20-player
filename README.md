# commons-20-player

ニコニ・コモンズのBGM/SE素材を検索ページで再生できるようにする拡張機能(アドオン)



## やりたいユーザ操作

+ ニコニ・コモンズでBGMや効果音のアイコンの下に小さなプレイヤーを配置したい
+ 再生と停止がボタンクリックでできる
+ 音量はBGMとサウンド・SEで個別に保存できる(ポップアップから設定)
+ 設定した音量は素材ページにも反映(反映するだけ。プレイヤーの置換はしない)

## 具体的な動作
+ クラス`cmn_thumb_frm`の要素がそれぞれの素材のカード。プレイヤーのdivにクラス`cmn_thumb_L`を付けて`appendChild()`する
+ 元々の`div.cmn_thumb_frm > div.cmn_thumb_L > a > img`のsrcの末尾が`audio01.gif`ならBGM、00や02ならSE扱い
+ 再生/停止ボタンはbase64でハードコーディング
+ 音量保存はcontent-script側のlocalStorageに保管、調整時はpopup側から`chrome.tabs.sendMessage()`する
	+ http://ogatism.jp/post/chrome_ext_4
+ 音量は音量は0～100、5刻み。BGM、SE、マスターの3系統
+ オプション(popup)でBGMとSEのプリロードをOn/Off可能
	+ Offのほうがコモンズのシステムに優しいが、Onだと不安定な回線でも安定して次々と視聴できる
+ Audioオブジェクトについてはここ: https://medium.com/@bbxxuw/mp3をjsで再生制御する-36edffb28041
