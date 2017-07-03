/* Copyright 2017 Mert Bora ALPER <bora@boramalper.org>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use strict";


var browser = (typeof browser === "undefined") ? chrome : browser;


window.onload = function() {
	let currentStateE = document.getElementsByTagName("current-state")[0];

	chrome.storage.local.get("current-state", items => {
		// most likely the first time add-on is running, enable LWP-1
		// TODO (I was being lazy): if key does not exist, is it an error OR
		// just undefined?
		if (browser.runtime.lastError || items["current-state"] === undefined) {
			enable_LWP_1();
		}
		else {
			currentStateE.textContent = items["current-state"];
			if (items["current-state"] === "") {
				disable_LWP();
			}
			else if (items["current-state"] === "0") {
				enable_LWP_0();
			}
			else if (items["current-state"] === "1") {
				enable_LWP_1();
			}
		}
	});
};


function disable_LWP() {
	let currentState = document.getElementsByTagName("current-state")[0];
	currentState.textContent = "";

	browser.storage.local.set({"current-state": ""});

	if (browser.webRequest.onBeforeSendHeaders.hasListener(LWP_0)) {
		browser.webRequest.onBeforeSendHeaders.removeListener(LWP_0);
	}

	if (browser.webRequest.onBeforeSendHeaders.hasListener(LWP_1)) {
		browser.webRequest.onBeforeSendHeaders.removeListener(LWP_1);
	}
}


function enable_LWP_0() {
	let currentState = document.getElementsByTagName("current-state")[0];
	currentState.textContent = "0";

	browser.storage.local.set({"current-state": "0"});

	if (browser.webRequest.onBeforeSendHeaders.hasListener(LWP_1)) {
		browser.webRequest.onBeforeSendHeaders.removeListener(LWP_1);
	}

	browser.webRequest.onBeforeSendHeaders.addListener(
		LWP_0,
		{urls: ["<all_urls>"]},
		["blocking", "requestHeaders"]
	);
}


function LWP_0(details) {
	details.requestHeaders.push({name: "LWP", value: "0"});
	return {requestHeaders: details.requestHeaders};
}


function enable_LWP_1() {
	let currentState = document.getElementsByTagName("current-state")[0];
	currentState.textContent = "1";

	browser.storage.local.set({"current-state": "1"});

	if (browser.webRequest.onBeforeSendHeaders.hasListener(LWP_0)) {
		browser.webRequest.onBeforeSendHeaders.removeListener(LWP_0);
	}

	browser.webRequest.onBeforeSendHeaders.addListener(
		LWP_1,
		{urls: ["<all_urls>"]},
		["blocking", "requestHeaders"]
	);
}


function LWP_1(details) {
	details.requestHeaders.push({name: "LWP", value: "1"});
	return {requestHeaders: details.requestHeaders};
}