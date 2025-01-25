// Import inputs for testing
const movement_code = `
dir 180
fw 100 
tr 90
fw 100 
tr 90
fw 100 
tr 90
fw 100 
tr 90
bw 100 
tl 90
bw 100 
tl 90
bw 100 
tl 90
bw 100 
tl 90
`;

const control_code = `
if (x > 5) {
    fw 10;
} else {
    bw 5;
}
`;

const loop_code = `
while (y < 20) {
    fw 5;
    y = y + 5;
}

for i = 0 to 5 {
    fw 10;
}
`;

let turtle_canvas = document.getElementById('turtle');
let sandbox_canvas = document.getElementById('sandbox');
let turtle_ctx = turtle_canvas.getContext('2d');
let sandbox_ctx = sandbox_canvas.getContext('2d');
let inner = document.getElementById('inner');

function draw() {
  drawturtle();
  drawbackground();
}
function drawbackground() {
  sandbox_ctx.beginPath();
  sandbox_ctx.moveTo(middle[0] + prevPoints[0], middle[1] + prevPoints[1]);
  sandbox_ctx.lineTo(middle[0] + displacement[0], middle[1] + displacement[1]);
  sandbox_ctx.stroke();
}

function drawturtle() {
  turtle_ctx.clearRect(0, 0, turtle_canvas.width, turtle_canvas.height);

  turtle_ctx.save();

  turtle_ctx.translate(middle[0] + displacement[0], middle[1] + displacement[1]);

  turtle_ctx.rotate(angle + Math.PI / 2);

  turtle_ctx.drawImage(img, -18, -18, 36, 36);

  turtle_ctx.restore();
}

// TODO
// Lexer - takes inputs and creates tokens
// Parser - takes tokens and produces an abstract syntax tree
// Interpreter - uses the ast and interprets it on the fly, line per line

// Use regex if needed
function lexer(input) {
  tokens = []
  regex = ''


  return tokens;
}


function parser(tokens) {
  const ast = [];

  return ast;
}

function interpreter (ast) {
  const turtleState = {
    displacement: [0, 0],
    angle: -Math.PI / 2,
  };

  const commands = {

  };

  ast.forEach((node) => {

  })

  function draw() {

  }
}
