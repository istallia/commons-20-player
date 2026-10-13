# commons-20-player

ニコニ・コモンズのBGM/SE素材を検索ページで再生できるようにする拡張機能(アドオン)  
https://chrome.google.com/webstore/detail/kmkkanllnppjgpjbkfbocgeflcbbbdgf  
https://addons.mozilla.org/ja/firefox/addon/コモンズ20プレイヤー/



## ブラウザ別の配布用ファイル

リポジトリのルートで次のコマンドを実行します（POSIX シェルが必要です）。

```sh
sh dist.sh
```

- Chrome 用: `dist/chrome/`（`manifest.json` を使用）
- Firefox 用: `dist/firefox/`（`manifest.firefox.json` を `manifest.json` として配置）

JavaScript・CSS・HTML・アイコン・LICENSE をコピーするだけで、ビルドや追加の依存関係、ZIP 作成はありません。
再実行するとコピー対象のファイルを上書きし、それ以外の既存ファイルは削除しません。配布前には不要なファイルが混ざっていないか確認してください。
出力先を直接編集せず、ルートのファイルを編集してから再実行してください。
出力先のディレクトリやコピー対象にシンボリックリンクがある場合は、安全のためコピー前に停止します。
`dist/` は Git の管理対象外です。

Chrome では `chrome://extensions` でデベロッパーモードを有効にし、「パッケージ化されていない拡張機能を読み込む」から `dist/chrome/` を選択します。
Firefox では `about:debugging#/runtime/this-firefox` の「一時的なアドオンを読み込む」から `dist/firefox/manifest.json` を選択します。

両方とも Manifest V3 ですが、Chrome 用は `background.service_worker`、Firefox 用は `background.scripts` を指定しています。
Firefox 用の `browser_specific_settings.gecko.id` は既存アドオンの ID `{e222740e-8427-4c51-8e38-4cc74d03f7ff}` を使用します。
バージョン、権限、コンテンツスクリプトなど共通の設定を変更する場合は、両方の manifest を更新してください。
拡張機能で使用するファイルを追加した場合は、`dist.sh` のコピー対象にも追加してください。

## やりたいユーザ操作

+ ニコニ・コモンズでBGMや効果音のアイコンの下に小さなプレイヤーを配置したい
+ 再生と停止がボタンクリックでできる
+ 音量はBGMとサウンド・SEで個別に保存できる(ポップアップから設定)
+ 設定した音量は素材ページにも反映(反映するだけ。プレイヤーの置換はしない)

## 具体的な動作
+ クラス`cmn_thumb_frm`の要素がそれぞれの素材のカード。プレイヤーのdivにクラス`cmn_thumb_L`を付けて`appendChild()`する
+ 元々の`div.cmn_thumb_frm > div.cmn_thumb_L > a > img`のsrcの末尾が`audio01.gif`ならBGM、00や02ならSE扱い
+ 再生/停止ボタンはbase64でハードコーディング -> v0.1.0ではテキストリンク？
+ 音量は0～100、5刻み、SEとBGMの2系統
+ 音量保存はcontent-script側のlocalStorageに保管、調整時はpopup側から`chrome.tabs.sendMessage()`する
	+ http://ogatism.jp/post/chrome_ext_4
	+ backgroundを作らないと保存できないっぽい？popupは表示されている状態でしか音量を取得できない
	+ Content-ScriptからPopupに送るならこれ: https://pastak.hatenablog.com/entry/2014/08/13/020226
+ オプション(popup)でBGMとSEのプリロードをOn/Off可能 (実装中止。いらないと思うので)
	+ Offのほうがコモンズのシステムに優しいが、Onだと不安定な回線でも安定して次々と視聴できる
+ Audioオブジェクトについてはここ: https://medium.com/@bbxxuw/mp3をjsで再生制御する-36edffb28041
+ Auto Pager系拡張機能を利用している場合、読み込み時に1度動作させるだけでは続きに反映できない。オプションで用意
