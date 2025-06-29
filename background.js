/*
 * Copyright (C) 2021-2025 istallia
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

/* --- browserの読み込み --- */
if (typeof browser === 'undefined') browser = chrome;


/* --- 音量の取得など --- */
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.ctrl === 'get-preferences') {
		browser.storage.local.get(['volume_master', 'volume_bgm', 'volume_se', 'bgm_filter_status'], data => {
			sendResponse({
				volume_master     : Number(data['volume_master'] || '100'),
				volume_bgm        : Number(data['volume_bgm']    || '100'),
				volume_se         : Number(data['volume_se']     || '100'),
				bgm_filter_status : data['bgm_filter_status'] !== null ? data['bgm_filter_status'] : false
			});
		});
		return true;
	} else if (request.ctrl === 'set-volume') {
		browser.storage.local.set({
			volume_master : Number(request.master),
			volume_bgm    : Number(request.bgm),
			volume_se     : Number(request.se)
		});
		return;
	} else if (request.ctrl === 'update-title') {
		browser.runtime.sendMessage(request);
		return;
	} else if (request.ctrl === 'change-bgm-filter') {
		browser.tabs.sendMessage(request.tab_id, {
			ctrl   : 'change-bgm-filter',
			status : request.status
		});
		browser.storage.local.set({bgm_filter_status:request.status});
		return;
	} else if (request.ctrl === 'check-bookmarks') {
		browser.bookmarks.search('https://commons.nicovideo.jp/material/nc', nodes => {
			sendResponse({registered:nodes.some(node => node.url.indexOf(request.id) > -1)});
		});
		return true;
	} else if (request.ctrl === 'add-bookmark') {
		addBookmark(request);
		return;
	} else if (request.ctrl === 'remove-bookmark') {
		removeBookmark(request);
		return;
	}
});


/* --- ブックマーク登録 --- */
const addBookmark = request => {
	browser.storage.sync.get('bookmarks_folder_id', data => {
		if (!data['bookmarks_folder_id']) {
			browser.bookmarks.create({title:'コモンズ20プレイヤー', index:0}, node => {
				browser.storage.sync.set({bookmarks_folder_id:node.id}, set_res => addBookmark(request));
			});
		} else {
			browser.bookmarks.get(data['bookmarks_folder_id'], folder_node => {
				if (!folder_node || folder_node.length < 1) {
					browser.bookmarks.create({title:'コモンズ20プレイヤー', index:0}, node => {
						browser.storage.sync.set({bookmarks_folder_id:node.id}, set_res => addBookmark(request));
					});
					return;
				}
				folder_node = folder_node[0];
				browser.bookmarks.create({parentId:folder_node.id, title:request.title, url:`https://commons.nicovideo.jp/material/${request.commons_id}`});
			});
		}
	});
};


/* --- ブックマーク削除 --- */
const removeBookmark = request => {
	browser.bookmarks.search(`https://commons.nicovideo.jp/material/${request.commons_id}`, nodes => {
		if (nodes.length < 1) return;
		const node = nodes[0];
		browser.bookmarks.remove(node.id);
	});
};
