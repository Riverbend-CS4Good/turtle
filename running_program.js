const runButton = document.getElementById('run-button');
const saveButton = document.getElementById('save-button');
let isPaused = true; // Initial state is paused
let lines = []; // Array to hold each line of the file
const fileInput = document.getElementById('file-input');
const input = document.getElementById('editor');
let currentLine = 0;
let intervalID = null;

// added this as a global variable to be saved
// if a file is uploaded, text will be extracted to here
// if text is saved, it will be saved to here - Aaron
var text = ''

// Reconfigured this to literally just call the compiler on run now - Aaron
runButton.addEventListener("click", () => {
    compiler(text);
    // if (isPaused) {
    //     isPaused = false;
    //     runButton.textContent = "Pause";
    //     readNext()
    // } else {
    //     isPaused = true;
    //     runButton.textContent = "Run";
    //     clearInterval(intervalID)
    // }
});

// Saves the text from the textbox into the text file - Aaron
saveButton.addEventListener("click", () => {
    text = input.value;
    fileInput.value = '';
    displayContents(text);
    saveButton.textContent = "Saved";
});

// If input changes, you'll need to resave, so give a visual indicator - Aaron
input.addEventListener('input', () => {
    saveButton.textContent = "Save";
})

// Reads the file; allows ppl to upload files; saves it to text - Aaron
function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;
        displayContents(contents);
        text = contents;
    };
    reader.readAsText(file);
}

// didnt touch anything under this - Aaron
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