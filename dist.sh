#!/bin/sh
set -eu

# 呼び出し元の作業ディレクトリに関係なく、リポジトリのルートで作業する。
cd -- "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

# 配布に必要な共通ファイルだけをコピーする（ビルド・ZIP 作成はしない）。
set -- \
	background.js \
	script-player.js \
	script-material.js \
	style-player.css \
	popup.html \
	popup.css \
	popup.js \
	icon_32.png \
	icon_48.png \
	icon_128.png \
	LICENSE

# 入力の欠落時には、コピー前に停止する。
for file in "$@" manifest.json manifest.firefox.json; do
	if [ ! -f "$file" ]; then
		printf 'Missing file: %s\n' "$file" >&2
		exit 1
	fi
done

# シンボリックリンク経由で出力先の外へ書き込まない。
for directory in dist dist/chrome dist/firefox; do
	if [ -L "$directory" ] || { [ -e "$directory" ] && [ ! -d "$directory" ]; }; then
		printf 'Invalid output directory: %s\n' "$directory" >&2
		exit 1
	fi
done
for browser in chrome firefox; do
	for file in "$@" manifest.json; do
		target="dist/$browser/$file"
		if [ -L "$target" ] || { [ -e "$target" ] && [ ! -f "$target" ]; }; then
			printf 'Invalid output file: %s\n' "$target" >&2
			exit 1
		fi
	done
done

# 必要なファイルだけ上書きし、それ以外の既存ファイルは削除しない。
for browser in chrome firefox; do
	mkdir -p "dist/$browser"
	cp "$@" "dist/$browser/"
done
cp manifest.json dist/chrome/manifest.json
cp manifest.firefox.json dist/firefox/manifest.json

printf 'Copied extension files to dist/chrome/ and dist/firefox/\n'
