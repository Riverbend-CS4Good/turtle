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
        readNext()
    } else {
        isPaused = true;
        button.textContent = "Run";
        clearInterval(intervalID)
    }
});

function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;
        displayContents(contents);
    };
    reader.readAsText(file);
}

function displayContents(contents) {
    lines = contents.split("\n");
}

document.getElementById('file-input')
    .addEventListener('change', readSingleFile, false);


// function readFile() {
//     readNext();
// }

function readNext() {
    intervalID = setInterval(printLine, 1000)
}

function printLine() {
    if (currentLine < lines.length && !isPaused) {
        console.log(lines[currentLine]);
        let args = lines[currentLine].split(" ");
        action(args[0], Number(args[1]));
        currentLine++;
    }
    else {
        clearInterval(intervalID)
        if (currentLine >= lines.length) {
            button.textContent = "Finished";
        }
    }
}