"use strict";

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