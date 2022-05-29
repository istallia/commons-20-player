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

/* --- browserの読み込み --- */
if (typeof browser === 'undefined') browser = chrome;


/* --- 音量の取得など --- */
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	ista_volume_master = Number(localStorage.getItem('ista_volume_master') || '100');
	ista_volume_bgm    = Number(localStorage.getItem('ista_volume_bgm')    || '100');
	ista_volume_se     = Number(localStorage.getItem('ista_volume_se')     || '100');
	if (request.ctrl === 'get-volume') {
		sendResponse({
			volume_master : ista_volume_master,
			volume_bgm    : ista_volume_bgm,
			volume_se     : ista_volume_se
		});
		return true;
	} else if (request.ctrl === 'set-volume') {
		ista_volume_master = Number(request.master);
		ista_volume_bgm    = Number(request.bgm);
		ista_volume_se     = Number(request.se);
		localStorage.setItem('ista_volume_master', ista_volume_master);
		localStorage.setItem('ista_volume_bgm'   , ista_volume_bgm);
		localStorage.setItem('ista_volume_se'    , ista_volume_se);
		return;
	} else if (request.ctrl === 'update-title') {
		browser.runtime.sendMessage(request);
		return;
	}
});
