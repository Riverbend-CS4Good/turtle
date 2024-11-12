
let turtle_canvas = document.getElementById('turtle');
let sandbox_canvas = document.getElementById('sandbox');
let turtle_ctx = turtle_canvas.getContext('2d');
let sandbox_ctx = sandbox_canvas.getContext('2d');
let inner = document.getElementById('inner');

let forwardBtn = document.getElementById('forward');
let backwardBtn = document.getElementById('backward');
let leftBtn = document.getElementById('left');
let rightBtn = document.getElementById('right');
let directionBtn = document.getElementById('direction');

let input = document.getElementById('input');

let middle, displacement, angle, prevPoints;

const img = new Image();
img.src = './images/spiff.png';
img.onload = function () {
    resize()
}

window.addEventListener('resize', resize);
function resize() {
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

forwardBtn.addEventListener('click', () => move('forward', getInput()));
backwardBtn.addEventListener('click', () => move('backward', getInput()));
leftBtn.addEventListener('click', () => turn('left', getInput()));
rightBtn.addEventListener('click', () => turn('right', getInput()));
directionBtn.addEventListener('click', () => setDirection(getInput()));

//functions
function move(direction, d) {
    if (d === 0) {
        return;
    }
    r = angle;
    if (direction === 'backward') {
        r += Math.PI;
    } else if (direction !== 'forward') {
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
    if (direction === 'left') {
        angle -= deg2rad(a);
    } else if (direction === 'right') {
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

    turtle_ctx.drawImage(img, -25, -25, 50, 50);

    turtle_ctx.restore();
}