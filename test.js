
let turtle_canvas = document.getElementById('turtle');
let sandbox_canvas = document.getElementById('sandbox');
let turtle_ctx = turtle_canvas.getContext('2d');
let sandbox_ctx = sandbox_canvas.getContext('2d');
let inner = document.getElementById('inner');

let forwardBtn = document.getElementById('forward');
let backwardBtn = document.getElementById('backward');
let leftBtn = document.getElementById('left');
let rightBtn = document.getElementById('right');

let distance = document.getElementById('distance');
let ang = document.getElementById('angle');

let middlex, middley, displacementX, displacementY, angle, prevPoints;

window.addEventListener('resize', resize);
window.addEventListener('DOMContentLoaded', resize);
function resize() {
    let box = inner;
    let rect = box.getBoundingClientRect();
    let w = rect.width;
    let h = rect.height;
    sandbox.width = w; sandbox.height = h;
    turtle_canvas.width = w; turtle_canvas.height = h;
    middlex = w / 2; middley = h / 2;
    displacementX = 0;
    displacementY = 0;
    prevPoints = [0, 0];
    angle = -Math.PI / 2;
    draw()
    console.log(prevPoints);
}


forwardBtn.addEventListener('click', () => move('forward'));
backwardBtn.addEventListener('click', () => move('backward'));

function move(direction) {
    if (distance.value.trim() === "") {
        console.log("Input is empty or only whitespace.");
        return;
    }
    let displacement = distance.value;
    r = angle;
    if (direction === 'backward') {
        r += Math.PI;
    }
    x = displacementX + displacement * Math.cos(r);
    y = displacementY + displacement * Math.sin(r);
    displacementX = x;
    displacementY = y;
    draw();
    prevPoints = [displacementX, displacementY]

}

leftBtn.addEventListener('click', () => turn('left'));
rightBtn.addEventListener('click', () => turn('right'));
function turn(direction) {
    function deg2rad(d) { return d / 180 * Math.PI; }
    if (ang.value.trim() === "") {
        console.log("Input is empty or only whitespace.");
        return; // Exit the function if input is empty
    }
    let a = ang.value;
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
function draw() {
    drawturtle();
    drawbackground();
}
function drawbackground() {
    console.log('hi')
    sandbox_ctx.beginPath();
    sandbox_ctx.moveTo(middlex + prevPoints[0], middley + prevPoints[1]);
    sandbox_ctx.lineTo(middlex + displacementX, middley + displacementY);
    sandbox_ctx.stroke();
}
function drawturtle() {
    function invert(p) { return [-p[0], p[1]]; }
    function _draw(ctx) {
        ctx.save();
        ctx.translate(middlex + displacementX, middley + displacementY);
        ctx.rotate(Math.PI / 2 + angle);
        ctx.beginPath();

        var points = [
            [0, -20], // Head
            [2.5, -17],
            [3, -12],

            [6, -10],
            [9, -13], // Arm
            [13, -12],
            [18, -4],
            [18, 0],
            [14, -1],
            [10, -7],

            [8, -6], // Shell
            [10, -2],
            [9, 3],
            [6, 10],

            [9, 13], // Foot
            [6, 15],
            [3, 12],

            [0, 13],
        ];

        points.concat(points.slice(1, -1).reverse().map(invert))
            .forEach(function (pair, index) {
                ctx[index ? 'lineTo' : 'moveTo'](pair[0], pair[1]);
            });

        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }
    turtle_ctx.clearRect(0, 0, turtle_canvas.width, turtle_canvas.height);
    turtle_ctx.lineCap = 'round';
    turtle_ctx.strokeStyle = 'green';
    turtle_ctx.lineWidth = 2;
    _draw(turtle_ctx)
}