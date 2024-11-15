let runButtonClass = document.getElementsByClassName('run-button');
const button = runButtonClass[0]
let isPaused = true; // Initial state is paused
let lines = []; // Array to hold each line of the file
let currentLine = 0;
let intervalID = null;

button.addEventListener("click", () => {
    if (isPaused) {
        isPaused = false;
        button.textContent = "Pause";
        readFile()
    } else {
        isPaused = true;
        button.textContent = "Run";
        clearInterval(intervalID)
    }
});

function readFile() {
    if(lines.length === 0) {
        fetch('text.txt')
        .then(response => response.text())
        .then(text => {
            lines = text.split('\n');
            readNext();
        });
    }
    else {
        readNext();
    }
}

function readNext() {
    intervalID = setInterval(printLine, 1000)
}

function printLine() {
    if(currentLine < lines.length && !isPaused) {
        console.log(lines[currentLine]);
        currentLine++;
    }
    else {
        clearInterval(intervalID)
        if(currentLine >= lines.length) {
            button.textContent = "Finished";
        }
    }
}