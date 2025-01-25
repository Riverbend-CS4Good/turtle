"use strict";

function lineNumbers() {
    const textArea = document.querySelector(".editor");
    const lineNumbers = document.querySelector(".line-numbers");

    const textAreaStyles = window.getComputedStyle(textArea);
    [
	'fontFamily',
	'fontSize',
	'fontWeight',
	'letterSpacing',
	'lineHeight',
	'padding',
    ].forEach((property) => {
	lineNumbers.style[property] = textAreaStyles[property];
    });

    const lines = textArea.value.split("\n");
    const lineAmt = lines.length;



    lineNumbers.innerHTML = '';

    for (let i = 0; i < lineAmt; i++) {
	lineNumbers.innerHTML += (i + 1) + '<br>';
    }
}

document.addEventListener('DOMContentLoaded', () => { 
    lineNumbers(); 
}); 

// Vertical movable divider
var resizer = document.querySelector(".resizer")
var leftSide = document.querySelector(".left-side")
var coordsText = document.querySelector(".coords")
var spiffContainer = document.querySelector(".spiff-container");

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
var editor = document.querySelector(".editor");
var coordsText = document.querySelector(".coords");

editor.wrap = "off";

editor.addEventListener("input", function() {
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
