const button = document.getElementsByClassName('run-button')[0];
const forwardButton = document.getElementsByClassName('foward-button')[0];

let isPaused = true; // Initial state is paused
let lines = []; // Array to hold each line of the file
let currentLine = 0;
let intervalID = null;

forwardButton.addEventListener("click", () => {
    clearInterval(intervalID);
    for(let i = currentLine; i < lines.length; i++) {
        console.log(lines[i]);
    }
    currentLine = lines.length;
    isPaused = true;
});

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
    reader.onload = function(e) {
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