// Import inputs for testing
const movement_code = `
$hi = 105;
dir 180;
fw 100;
tr 90;
fw 100;
tr 90;
fw 100;
tr 90;
fw 100;
tr 90;
bw 100;
tl 90;
bw 100; 
tl 90;
bw 100;
tl 90;
bw 10;
tl 90;
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

