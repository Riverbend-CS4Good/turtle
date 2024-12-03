const runButton = document.getElementById('run-button');
const saveButton = document.getElementById('save-button');
let isPaused = true; // Initial state is paused
let lines = []; // Array to hold each line of the file
const fileInput = document.getElementById('file-input');
const input = document.getElementById('editor');
let currentLine = 0;
let intervalID = null;

runButton.addEventListener("click", () => {
    if (isPaused) {
        isPaused = false;
        runButton.textContent = "Pause";
        readNext()
    } else {
        isPaused = true;
        runButton.textContent = "Run";
        clearInterval(intervalID)
    }
});

saveButton.addEventListener("click", () => {
    var text = input.value;
    fileInput.value = '';
    console.log(text);
    displayContents(text);
    saveButton.textContent = "Saved";
});
input.addEventListener('input', () => {
    saveButton.textContent = "Save";
})

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
            runButton.textContent = "Finished";
        }
    }
}