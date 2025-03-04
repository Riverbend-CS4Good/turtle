"use strict";

// Vertical movable divider
var resizer = document.querySelector(".resizer")
var leftSide = document.querySelector(".left-side")
var coordsText = document.querySelector(".coords")
var spiffContainer = document.querySelector("#inner");
// let spiffContainer = document.getElementById('turtle');
// let sandbox_canvas = document.getElementById('sandbox');
// let turtle_ctx = turtle_canvas.getContext('2d');
// let sandbox_ctx = sandbox_canvas.getContext('2d');

function initResizer(resizer, leftSide, coordsText, spiffContainer) {
	var x, w;

	function rs_mousedown(e) {
		x = e.clientX;

		var leftWidth = window.getComputedStyle(leftSide).width;
		w = parseInt(leftWidth, 10);

		document.addEventListener("mousemove", rs_mousemove);
		document.addEventListener("mouseup", rs_mouseup);

	}

	function rs_mousemove(e) {
		var dx = e.clientX - x;

		// Computes new width
		var cw = w + dx;

		if (cw < 1350 && cw > 250) {
			leftSide.style.width = `${cw}px`;
		}

		var spiffContainerWidth = parseInt(window.getComputedStyle(spiffContainer).width, 10);
		var spiffContainerHeight = parseInt(window.getComputedStyle(spiffContainer).height, 10);
		resize();
		coordsText.innerHTML = `Box size: ${spiffContainerWidth} x ${spiffContainerHeight}`;

	}

	function rs_mouseup() {
		document.removeEventListener("mouseup", rs_mouseup);
		document.removeEventListener("mousemove", rs_mousemove);
	}

	resizer.addEventListener("mousedown", rs_mousedown)
}

initResizer(resizer, leftSide, coordsText, spiffContainer);
var spiffContainerWidth = parseInt(window.getComputedStyle(spiffContainer).width, 10);
var spiffContainerHeight = parseInt(window.getComputedStyle(spiffContainer).height, 10);
coordsText.innerHTML = `Box size: ${spiffContainerWidth} x ${spiffContainerHeight}`;

// update coordsText when you type
var editor = document.getElementById("editor");
var coordsText = document.querySelector(".coords");

editor.addEventListener("input", function () {
	var content = editor.value;
	var lineCount = content.split('\n').length;
	coordsText.innerHTML = `Lines: ${lineCount}`;
});


function onReady() {
	console.log("DOM fully loaded and parsed");
	let p = document.getElementById("game");
	// p.innerText = "Hello World!";
}

if (document.readyState !== "loading") {
	onReady();
} else {
	document.addEventListener("DOMContentLoaded", onReady);
}
