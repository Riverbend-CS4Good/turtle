// Import inputs for testing
const movement_code = `
dir 80 + 100*10/10;
fw 100;
center;
go 100, 200;
print "Hello World";
`;

const control_code = `
if $x > 5 {
    fw 10;
} else {
    bw 5;
}
`;

const loop_code = `
while $y < 20 {
    fw 5;
    $y = $y + 5;
}

for $i = 0 to 5 {
    fw 10;
}
`;

// let turtle_canvas = document.getElementById('turtle');
// let sandbox_canvas = document.getElementById('sandbox');
// let turtle_ctx = turtle_canvas.getContext('2d');
// let sandbox_ctx = sandbox_canvas.getContext('2d');
// let inner = document.getElementById('inner');

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
class Token {
  constructor(tokenKind, value) {
    // tokenKind = CMD, NUM, 
    this.tokenKind = tokenKind
    this.value = value
  }
}


const patterns = [
  ["WS", /^[^\S\r\n]+/],
  ["NL", /^\n/],
  ["SC", /^;/],
  ["C", /^,/],
  ["CLEANUP", /^(clear|reset|spriteshow|spritehide|ss|sh)/],
  ["MVMT", /^(fw|bw|tl|tr|dir|center|go|gox|goy|getx|gety)/],
  ["DRAW", /^(penup|pendown|penwidth|pencolor|pu|pd|pw|pc)/],
  ["CNV", /^(canvassize|canvascolor|cs|cc)/],
  ["PRINT", /^(print|fontsize)/],
  ["OTHER", /^(random|wait|message|ask)/],
  ["CTRL", /^(if|else|while|repeat|for|to)/],
  ["SBRTN", /^(learn)/],
  ["VAR", /^\$[a-zA-Z]+/],
  ["COM", /^#[^\n]+/],
  ["NUM", /^[0-9]+/],
  ["{", /^\{/],
  ["}", /^\}/],
  ["(", /^\(/],
  [")", /^\)/],
  ["BOOL", /^(==|!=|<=|>=|<|>|!|and|or|not)/],
  ["ASSIGN", /^=/],
  ["ARITH", /^(\+|-|\/|\*)/],
  ["STR", /^"[^"]*"/]
]

// Use regex if needed
function lexer(input) {
  let tokens = [];
  let src = input;
  while (src) {
    let noMatch = true;
    for (const [type, pattern] of patterns) {
      matched = src.match(pattern)
      if (matched) {
        if (type !== "WS" && type !== "COM" && type !== "NL") {
          let value = matched[0]
          if (type === "NUM") {
            value = Number(value)
          } else if (type === "STR") {
            value = value.slice(1, value.length - 1)
          }
          const token = new Token(type, value)
          tokens.push(token)
        }
        src = src.slice(matched[0].length)
        noMatch = false
        break
      }
    }
    if (noMatch) {
      return null;
    }
  }

  return tokens;
}


// Lexer - takes inputs and creates tokens
// Parser - takes tokens and produces an abstract syntax tree
// Interpreter - uses the ast and interprets it on the fly, line per line

// function print(token) {

// }

class ASTNode {
  constructor(type, value = null, children = []) {
    this.type = type;
    this.value = value;
    this.children = children;
  }
}


function parser(tokens) {
  let index = 0;

  function peek() {
    return tokens[index] || null;
  }

  function consume(types) {
    if (peek() && types.includes(peek().tokenKind)) {
      let tokenKind = peek().tokenKind;
      if (types.includes(tokenKind)) {
        return tokens[index++];
      }
      throw new Error(`Expected ${types}, got ${peek()?.tokenKind}`);
    }
    throw new Error(`Expected ${types}, got ${peek()?.tokenKind}`);
  }

  function parseArithmetic(delimiter) {
    // acquire arithmetic expression up to next delimiter, comma or semicolon
    let tokens = []
    while (peek() && delimiter !== peek().tokenKind) {
      tokens.push(consume(["ARITH", "NUM", "VAR"]))
    }
    consume(delimiter)
    // console.log(tokens)
    if (tokens.length % 2 == 0) {
      throw new Error(`Improper Mathematical Expression`)
    }
    for (let i = 0; i < tokens.length; i++) {
      if (i % 2 == 0 && !(["NUM", "VAR"].includes(tokens[i].tokenKind))) {
        throw new Error(`Improper Mathematical Expression`)
      } else if (i % 2 == 1 && !("ARITH" === tokens[i].tokenKind)) {
        throw new Error(`Improper Mathematical Expression`)
      }
    }
    tokens = tokens.map((token) => new ASTNode(type = token.tokenKind, value = token.value))
    // console.log(tokens)
    //parse multiplication/division
    first = []
    let i = 0
    let n = tokens.length
    while (i < n) {
      if (["*", "/"].includes(tokens[i].value)) {
        tokens[i].children.push(first.pop())
        tokens[i].children.push(tokens[i + 1])
        first.push(tokens[i])
        i += 2
      } else {
        first.push(tokens[i])
        i += 1
      }
    }
    // console.log(first)

    //parse addition/subtraction
    second = []
    i = 0
    n = first.length
    while (i < n) {
      if (["+", "-"].includes(first[i].value)) {
        first[i].children.push(second.pop())
        first[i].children.push(first[i + 1])
        second.push(first[i])
        i += 2
      } else {
        second.push(first[i])
        i += 1
      }
    }
    // console.log("SECOND TIME")
    // console.log(second)
    return second[0]
  }

  function parseString(delimiter) {
    // acquire string expression up to next delimiter, comma or semicolon
    let tokens = []
    while (peek() && delimiter !== peek().tokenKind) {
      tokens.push(consume(["ARITH", "STR", "VAR"]))
    }
    consume(delimiter)
    // console.log(tokens)
    if (tokens.length % 2 == 0) {
      throw new Error(`Improper String Expression`)
    }
    for (let i = 0; i < tokens.length; i++) {
      if (i % 2 == 0 && !(["STR", "VAR"].includes(tokens[i].tokenKind))) {
        throw new Error(`Improper String Expression`)
      } else if (i % 2 == 1 && !("ARITH" === tokens[i].tokenKind && "+" === tokens[i].value)) {
        throw new Error(`Improper String Expression`)
      }
    }
    tokens = tokens.map((token) => new ASTNode(type = token.tokenKind, value = token.value))

    first = []
    let i = 0
    let n = tokens.length
    while (i < n) {
      if (["+"].includes(tokens[i].value)) {
        tokens[i].children.push(first.pop())
        tokens[i].children.push(tokens[i + 1])
        first.push(tokens[i])
        i += 2
      } else {
        first.push(tokens[i])
        i += 1
      }
    }
    return first[0]
  }

  function parseCommand(type) {
    let token = consume([type]);

    let arguments = [];

    // Handle built in commands
    if (["clear", "reset", "ss", "spriteshow", "sh", "spritehide", "getx", "gety", "center", "pu", "penup", "pd", "pendown"].includes(token.value)) {
      // These commands expect no arguments (e.g., getx;)
      arguments = [];
      consume("SC"); // Expecting `;`
    } else if (["fw", "forward", "bw", "backward", "tl", "turnleft", "tr", "turnright", "dir", "direction", "gox", "goy", "penwidth", "pw", "fontsize", "wait"].includes(token.value)) {
      // These commands expect 1 number argument (e.g., fw 100;)
      let value = parseArithmetic("SC")
      arguments.push(value);
    } else if (["go", "cs", "canvassize", "random"].includes(token.value)) {
      // The 'go' command expects 2 arguments (e.g., go 50, 100;)
      let value1 = parseArithmetic("C");
      let value2 = parseArithmetic("SC");
      arguments.push(value1, value2);
    } else if (["pc", "cc"].includes(token.value)) {
      // The 'go' command expects 3 number arguments (e.g., pc 50, 100, 250;)
      let value1 = parseArithmetic("C");
      let value2 = parseArithmetic("C");
      let value3 = parseArithmetic("SC");
      arguments.push(value1, value2, value3);
    } else if (["print", "message", "ask"].includes(token.value)) {
      // These commands expect 1 string argument (e.g., print "Hello";)
      let value = parseString("SC");
      arguments.push(value);
    } else {
      // Handle unexpected command types
      throw new Error(`Unexpected movement command: ${token.value}`);
    }


    return new ASTNode(token.value, null, arguments);
  }

  function parseAssignment() {
    // TODO: dunno how to handle string vs number
    let token = consume(["VAR"]);
    consume(["ASSIGN"]);
    let value = consume(["NUM", "STR"]);
    consume("SC")
    return new ASTNode(token.value, 0, [value]);
  }

  function parseControlFlow() {
    // TODO
    let token = consume("CTRL");

    if (token.value === "if") {
      return parseIfStatement();
    } else if (token.value === "while") {
      return parseWhileStatement();
    } else if (token.value === "for") {
      return parseForLoop();
    } else if (token.value === "repeat") {
      return parseForLoop();
    } else if (token.value === "learn") {
      return parseLearn();
    }

    throw new Error(`Unexpected control flow keyword: ${token.value}`);
  }

  function parseIfStatement() {
    // TODO WRITTEN BY CHAT DID NOT LOOK
    consume("CTRL"); // `if`
    consume("(");
    let condition = parseExpression();
    consume(")");
    consume("{");
    let body = parseBlock();
    consume("}");
    return new ASTNode("IfStatement", { condition, body });
  }

  function parseBlock() {
    // TODO WRITTEN BY CHAT DID NOT LOOK
    let block = new ASTNode("Block");
    while (peek() && peek().tokenKind !== "}") {
      block.children.push(parseStatement());
    }
    return block;
  }

  function skipNewlines() {
    while (peek() && peek().tokenKind === "NL") {
      index++;
    }
  }

  function parseStatement() {
    skipNewlines();  // Skip empty lines before parsing

    if (peek() === null) return null; // Handle end of input safely

    let token = peek();

    if (token.tokenKind === "MVMT") return parseCommand("MVMT");
    if (token.tokenKind === "CTRL") return parseControlFlow();
    if (token.tokenKind === "VAR") return parseAssignment();
    if (token.tokenKind === "DRAW") return parseCommand("DRAW");
    if (token.tokenKind === "CNV") return parseCommand("CNV");
    if (token.tokenKind === "SBRTN") return parseFunctionDefinition();
    if (token.tokenKind === "PRINT") return parseCommand("PRINT");
    if (token.tokenKind === "NUM") return parseArithmetic();

    throw new Error(`Unexpected token: ${token.tokenKind} (${token.value})`);
  }

  function parseProgram() {
    let program = new ASTNode("Program");
    while (index < tokens.length) {
      program.children.push(parseStatement());
    }
    return program;
  }

  return parseProgram();
}

function interpreter(ast) {
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

function dfs(node) {
  console.log(node);
  for (const child of node.children) {
    dfs(child)
  }
}

let expr = "5*3-7+2+10/3;"
function compiler(code) {
  let tokens = lexer(code)
  if (tokens === null) {
    console.log("Error")
    return
  }
  let tree = parser(tokens);
  // dfs(tree)

}
compiler(movement_code)