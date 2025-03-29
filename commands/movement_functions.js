
let turtle_canvas = document.getElementById('turtle');
let sandbox_canvas = document.getElementById('sandbox');
let turtle_ctx = turtle_canvas.getContext('2d');
let sandbox_ctx = sandbox_canvas.getContext('2d');
let inner = document.getElementById('inner');

// let forwardBtn = document.getElementById('forward');
// let backwardBtn = document.getElementById('backward');
// let leftBtn = document.getElementById('left');
// let rightBtn = document.getElementById('right');
// let directionBtn = document.getElementById('direction');

// let input = document.getElementById('input');

let middle, displacement, angle, prevPoints;

const img = new Image();
img.src = './images/spiff.png';
img.onload = function () {
    resize()
}

window.addEventListener('resize', resize);
function resize() {
    console.log("resizing");
    let box = inner;
    let rect = box.getBoundingClientRect();
    let w = rect.width;
    let h = rect.height;
    sandbox.width = w; sandbox.height = h;
    turtle_canvas.width = w; turtle_canvas.height = h;

    //reset everything to 0
    middle = [w / 2, h / 2];
    displacement = [0, 0];
    prevPoints = [0, 0];
    angle = -Math.PI / 2;
    draw()
    // console.log(prevPoints);
}

//used for testing
function getInput() {
    if (input.value.trim() === "") {
        return 0;
    }
    return input.value;
}


// This literally just takes the arguments from the interpreter and is a big switch statement
// Create dictionary to : type check, arg check, send args to command.
const actions_dict = {
    // move
    fw: [move, ["NUM"], new Set([0]), ['fw', 0]],
    bw: [move, ["NUM"], new Set([0]), ['bw', 0]],
    forward: [move, ["NUM"], new Set([0]), ['fw', 0]],
    backward: [move, ["NUM"], new Set([0]), ['bw', 0]],
    // turns
    tl: [turn, ["NUM"], new Set([0]), ['tl', 0]],
    tr: [turn, ["NUM"], new Set([0]), ['tr', 0]],
    turnleft: [turn, ["NUM"], new Set([0]), ['tl', 0]],
    turnright: [turn, ["NUM"], new Set([0]), ['tr', 0]],
    dir: [setDirection, ["NUM"], new Set(), [0]],
    direction: [setDirection, ["NUM"], new Set(), [0]],
    // gotos
    go: [go, ["NUM", "NUM"], new Set(), [0, 1]],
    center: [go, [], new Set([0, 1]), [0, 0]],
    gox: [go, ["NUM"], new Set([1]), [0, null]],
    goy: [go, ["NUM"], new Set([0]), [null, 0]],
    getx: [go, ["NUM"], new Set([1]), [0, null]],
    gety: [go, ["NUM"], new Set([0]), [null, 0]],
    // cleanup
    clear: [dummy_function, [], new Set(), []],
    reset: [dummy_function, [], new Set(), []],
    spriteshow: [dummy_function, [], new Set(), []],
    spritehide: [dummy_function, [], new Set(), []],
    ss: [dummy_function, [], new Set(), []],
    sh: [dummy_function, [], new Set(), []],
    // draw
    penup: [dummy_function, [], new Set(), []],
    pendown: [dummy_function, [], new Set(), []],
    penwidth: [dummy_function, [], new Set(), []],
    pencolor: [dummy_function, [], new Set(), []],
    pu: [dummy_function, [], new Set(), []],
    pd: [dummy_function, [], new Set(), []],
    pw: [dummy_function, [], new Set(), []],
    pc: [dummy_function, [], new Set(), []],
    // canvas
    canvassize: [dummy_function, [], new Set(), []],
    canvascolor: [dummy_function, [], new Set(), []],
    cs: [dummy_function, [], new Set(), []],
    cc: [dummy_function, [], new Set(), []],
    // print
    print: [dummy_function, [], new Set(), []],
    fontsize: [dummy_function, [], new Set(), []],
    // other
    random: [dummy_function, [], new Set(), []],
    wait: [dummy_function, [], new Set(), []],
    message: [dummy_function, [], new Set(), []],
    ask: [dummy_function, [], new Set(), []],

}
function dummy_function() {
    console.log('Not yet implemented')
    return true
}
function action(CMD, args) {

    console.log(CMD, args);
    try {
        console.log('1', actions_dict[CMD]);
        if (!(CMD in actions_dict)) {
            console.log('Wrong usage/Not yet implemented');
            return false
        }
        [executable, types, static_args_index, executable_args] = actions_dict[CMD]
        if (types.length !== args.length) throw new Error(`Incorrect Number of args for command`)
        for (let i = 0; i < args.length; i++) {
            if (types[i] !== args[i][0]) throw new Error(`Type mismatch`)
        }
        let j = 0;
        for (let i = 0; i < executable_args.length; i++) {
            if (static_args_index.has(i)) continue;
            executable_args[i] = args[j][1];
            j++;
        }
        console.log(executable_args)
        executable(...executable_args);
        return true
    } catch (e) {
        console.log('ERMMMM');
        return false
    }
}

//functions
function go(x, y) {
    if (x != null) displacement[0] = x;
    if (y != null) displacement[1] = y;
    prevPoints = [...displacement]
    drawturtle();
}

function move(direction, d) {
    if (d === 0) {
        return;
    }
    r = angle;
    if (direction === 'backward' || direction === 'bw') {
        r += Math.PI;
    } else if (direction !== 'forward' && direction !== 'fw') {
        console.log('wrong usage turn');
        return;
    }
    x = displacement[0] + d * Math.cos(r);
    y = displacement[1] + d * Math.sin(r);
    displacement[0] = x;
    displacement[1] = y;
    draw();
    prevPoints = [displacement[0], displacement[1]]

}

function deg2rad(d) { return d / 180 * Math.PI; }

function turn(direction, a) {

    if (a === 0) {
        return;
    }
    if (direction === 'turnleft' || direction === 'tl') {
        angle -= deg2rad(a);
    } else if (direction === 'turnright' || direction === 'tr') {
        angle += deg2rad(a);
    } else {
        console.log('wrong usage turn');
        return;
    }
    draw();
}
function setDirection(a) {
    angle = -Math.PI / 2 + deg2rad(a)
    draw();
}

//drawing turtle and trails
function draw() {
    drawturtle();
    drawbackground();
}

// draw trails
function drawbackground() {
    sandbox_ctx.beginPath();
    sandbox_ctx.moveTo(middle[0] + prevPoints[0], middle[1] + prevPoints[1]);
    sandbox_ctx.lineTo(middle[0] + displacement[0], middle[1] + displacement[1]);
    sandbox_ctx.stroke();
}

// draw turtle
function drawturtle() {
    turtle_ctx.clearRect(0, 0, turtle_canvas.width, turtle_canvas.height);

    turtle_ctx.save();

    turtle_ctx.translate(middle[0] + displacement[0], middle[1] + displacement[1]);

    turtle_ctx.rotate(angle + Math.PI / 2);

    turtle_ctx.drawImage(img, -18, -18, 36, 36);

    turtle_ctx.restore();
}