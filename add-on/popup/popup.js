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
	let bgWin = browser.extension.getBackgroundPage();
	let currentState = bgWin.document.getElementsByTagName("current-state")[0];

	let query = 'input[value="' + currentState.textContent + '"]';
	let currentInput = document.querySelector(query);
	currentInput.setAttribute("checked", "");
}


document.addEventListener("click", (e) => {
	if (e.target.tagName === "STRONG") {
		browser.tabs.create({
			active: true,
			url: "http://labs.boramalper.org"
		});
	}
	else if (e.target.tagName === "INPUT") {
		let bgWin = browser.extension.getBackgroundPage();

		if (e.target.value === "") {
			bgWin.disable_LWP();
		}
		else if (e.target.value === "0") {
			bgWin.enable_LWP_0();
		}
		else if (e.target.value === "1") {
			bgWin.enable_LWP_1();
		}
	}
});
