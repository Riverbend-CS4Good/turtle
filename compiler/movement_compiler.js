// Import inputs for testing

const movement_code = `
dir 10;
fw 100;
center;
dir 180;
fw 100;
go 100, 200;
center;
`;
const if_code = `
if $x > 5 {
  fw 10;
}
`;
const var_code = `
$x = 5 + 5 + 5;
$q = $a < $b and $c > $d;
$q = $isActive or $isValid;
$q = not $isEmpty;
$q = $x == 5 and $y != 10;
$q = $status == "active" or $isLoggedIn;
$q = not ($a == $b or $c == $d);
$q = $score > 50 and not $isFinished;
$q = $isReady or not $isPaused;
$q = not ($a + $b == $c);
$q = $x > $y and $z < 100;
`

const control_code = `
if $x > 5 {
    fw 10;
} else {
    bw 5;
}
`;

const while_code = `
while $y < 20 {
    fw 5;
    $y = $y + 5;
}
`
const for_code = `
for $i = 0 to 5 {
    fw 10;
}
`;

const rep_code = `
repeat 10 {
    fw 10;
}
`;


// Lexer - takes inputs and creates tokens
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
  ["CTRL", /^(if|else|while|repeat|for)/],
  ["TO", /^(to)/],
  ["SBRTN", /^(learn)/],
  ["VAR", /^\$[a-zA-Z]+/],
  ["COM", /^#[^\n]+/],
  ["NUM", /^[0-9]+/],
  ["{", /^\{/],
  ["}", /^\}/],
  ["(", /^\(/],
  [")", /^\)/],
  ["BOOL", /^(==|!=|<=|>=|<|>|and|or|not)/],
  ["ASSIGN", /^=/],
  ["ARITH", /^(\+|-|\/|\*)/],
  ["STR", /^"[^"]*"/]
]

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
      throw new Error(`Unexpected item`);
    }
  }

  return tokens;
}

// Parser - takes tokens and produces an abstract syntax tree
class ASTNode {
  constructor(type, value = null, children = []) {
    this.type = type;
    this.value = value;
    this.children = children;
  }
}

/*
PARSER: HOW IT WORKS

It goes through the lexer's token list.
If it finds a command, it looks for whats expected next (an argument, maybe 2 or 3) and then semicolon.
If it finds a variable, it looks for either a string or a numeric expression or string
TODO: PARSING CONTROL SEQUENCE

Right after a semicolon, any new set of things can be looked for.
At anytime if it expects something and doesnt get it, it throws an error.
AKA: gox; -> THis expects a number argument and doesnt get one; will throw error
*/
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

  function parseExpression(delimiter) {
    let expression = []
    while (peek() && delimiter !== peek().tokenKind) {
      let token = consume(["ARITH", "BOOL", "VAR", "NUM", "STR", "(", ")"])
      expression.push(new ASTNode(token.tokenKind, token.value))
    }
    consume(delimiter)
    // return new ASTNode("Expression", null, expression)
    function treeify(expr) {
      function parseBinaryOperator(operators) {
        let new_expr = [];
        let i = 0;
        while (i < expr.length) {
          let flag = false;
          if (operators.includes(expr[i].value)) {
            let token = new_expr.pop();
            expr[i].children.push(token);
            expr[i].children.push(expr[i + 1]);
            flag = true
          }
          new_expr.push(expr[i]);
          i++;
          if (flag) i++;
        }
        expr = new_expr
      }
      function parseUnaryOperator(operators) {
        let new_expr = [];
        let i = 0;
        while (i < expr.length) {
          let flag = false;
          if (operators.includes(expr[i].value)) {
            expr[i].children.push(expr[i + 1]);
            flag = true
          }
          new_expr.push(expr[i]);
          i++;
          if (flag) i++;
        }
        expr = new_expr
      }
      parseUnaryOperator(["not"]); // Level 2
      parseBinaryOperator(["*", "/"]); // Level 3
      parseBinaryOperator(["+", "-"]); // Level 4
      parseBinaryOperator([">", "<", ">=", "<="]); // Level 6
      parseBinaryOperator(["==", "!="]); // Level 7
      parseBinaryOperator(["and"]); // Level 11
      parseBinaryOperator(["or"]); // Level 12

      if (expr.length !== 1) {
        throw new Error("Invalid Expression")
      }
      return expr[0]
    }
    function _parseExpression(index, subexpr) {
      let cur_expr = []
      while (index < expression.length) {
        c = expression[index]
        if (c.value === '(') {
          // open subexpression
          c, index = _parseExpression(index + 1, true)
        }
        else if (c.value === ')') {
          // close subexpression
          if (!subexpr) {
            throw new Error('error: expected end of expression )')
          }
          c = new ASTNode('Expression', null, [treeify(cur_expr)])
          return c, index
        }
        cur_expr.push(c);
        index++;
      }

      if (subexpr) {
        throw new Error('error: expected )')
      }

      // close total expression
      return treeify(cur_expr)
    }
    return _parseExpression(0, false);
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
      let value = parseExpression("SC")
      arguments.push(value);
    } else if (["go", "cs", "canvassize", "random"].includes(token.value)) {
      // The 'go' command expects 2 arguments (e.g., go 50, 100;)
      let value1 = parseExpression("C");
      let value2 = parseExpression("SC");
      arguments.push(value1, value2);
    } else if (["pc", "cc"].includes(token.value)) {
      // The 'go' command expects 3 number arguments (e.g., pc 50, 100, 250;)
      let value1 = parseExpression("C");
      let value2 = parseExpression("C");
      let value3 = parseExpression("SC");
      arguments.push(value1, value2, value3);
    } else if (["print", "message", "ask"].includes(token.value)) {
      // These commands expect 1 string argument (e.g., print "Hello";)
      let value = parseExpression("SC");
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
    let value = parseExpression("SC");
    return new ASTNode("VAR", token.value, [value]);
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
      return parseRepeat();
    } else if (token.value === "learn") {
      return parseLearn();
    }

    throw new Error(`Unexpected control flow keyword: ${token.value}`);
  }

  function parseIfStatement() {
    //parse condition
    let condition = new ASTNode('Condition', null, [parseExpression("{")])

    // parse if block
    let body1 = parseBlock();
    body1.value = "if";
    consume("}");

    // parse else block if exists, else empty
    let body2 = new ASTNode("Block")
    if (peek() && "else" === peek().value) {
      consume("CTRL");
      consume("{");
      body2 = parseBlock();
      consume("}");
    }
    body2.value = "else";
    return new ASTNode("If", null, [condition, body1, body2])
  }

  function parseWhileStatement() {
    //parse while condition
    let condition = new ASTNode('Condition', null, [parseExpression("{")])

    //parse while block
    let body = parseBlock();
    body.value = "while";
    consume("}");
    return new ASTNode("While", null, [condition, body])
  }

  function parseForLoop() {
    // consume variable assignment
    let var_to_assign = consume("VAR")
    consume("ASSIGN")
    // consume 'to'
    let condition = new ASTNode("VAR", var_to_assign.value, [parseExpression("TO")]);
    // consume ending num
    let endingNum = new ASTNode("NUM", consume("NUM").value);
    // consume block
    consume("{");
    let body = parseBlock();
    body.value = "FOR";
    consume("}");
    return new ASTNode("FOR", null, [condition, endingNum, body])
  }

  function parseRepeat() {
    let endingNum = new ASTNode("NUM", consume("NUM").value);
    // consume block
    consume("{");
    let body = parseBlock();
    body.value = "REPEAT";
    consume("}");
    return new ASTNode("REPEAT", null, [endingNum, body])
  }

  function parseBlock() {
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

// Interpreter - uses the ast and interprets it on the fly, line per line
// TODO: NOT COMPLETE; ONLY PARSES PROGRAMS THAT ONLY HAVE MOVEMENT COMMANDS AND ONLY IF THEY ARE CORRECT
// This does not work. Literally only works rn. Dont question it. Will work as long as no control sequence
function interpreter(ast) {

  const turtleState = {
    displacement: [0, 0],
    angle: -Math.PI / 2,
  };

  const commands = {

  };

  ast.children.forEach((node) => {
    // this only works if numbers are correctly given rn.
    action(node.type, ...(node.children.map((n) => n.value)));
  })

}

// Literally just for me to see if my AST generates as I expected it to
function dfsprinttree(node, tabs = 0) {
  spacing = ''
  for (let i = 0; i < tabs; i++) {
    spacing += '  '
  }
  console.log(spacing, node.type, node.value !== null ? node.value : '');
  if (node.children.length == 0) return;
  for (const child of node.children) {
    dfsprinttree(child, tabs + 1)
  }
}

// Compiler tries to lex, parse, and then interpret code, catching errors along the way if they exist
function compiler(code) {
  let tokens;
  try {
    tokens = lexer(code)
    console.log(tokens)
  } catch (e) {
    console.log("Lexer error")
    return;
  }
  let tree;
  // try {
  tree = parser(tokens);
  dfsprinttree(tree);
  // console.log(tree);
  // } catch (e) {
  //   console.log("Parser Error")
  //   return;
  // }
  console.log("")
  console.log("")
  console.log("")
  console.log("")
  console.log("")
  // try {
  //   interpreter(tree);
  // } catch (e) {
  //   console.log("Interpreter error")
  //   return;
  // }


}

// this test case for node js only, does not work in browser
// compiler(control_code)
// compiler(movement_code)
// compiler(while_code)
compiler(rep_code)

// compiler(var_code)
// let lines = var_code.split('\n');
// for (let line of lines) {
//   console.log(line)
//   compiler(line);
// }
