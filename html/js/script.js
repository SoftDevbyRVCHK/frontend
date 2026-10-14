const field = document.getElementById("field");
field.setAttribute("viewBox", "0 0 " + window.screen.width + " " + (window.screen.height -125));
const connection = new WebSocket("ws://localhost:8080");

const planetLayer = d3.select("#PlanetsLayer");
const shipLayer = d3.select("#ShipsLayer");
const resourceLayer = d3.select("#resourses");
const interfaceLayer = d3.select("#InterfaceLayer");

canvas = {width: window.screen.width, height: window.screen.height -125, x: 0, y: 0, scale: 1}

joystick_g = interfaceLayer.append("g").attr("id", "joystick")
joystick_g.append("circle").attr("cx", canvas.width-100).attr("cy", canvas.height-100).attr("r", 90).attr("fill", "white").attr("stroke", "black")
line = joystick_g.append("line")
circle = joystick_g.append("circle").attr("cx", canvas.width-100).attr("cy", canvas.height-100).attr("r", 40)
.attr("stroke", "darkgray")
cx = circle.attr("cx")-0; cy = circle.attr("cy")-0;
line.attr("x1", cx).attr("y1", cy).attr("x2", cx).attr("y2", cy).attr("stroke", "darkgray").attr("stroke-width", 25);
joy = joystick_g.append("polygon").attr("points", `${[cx-25, cy+30, cx, cy+40, cx+25, cy+30, cx, cy-40]}`).attr("fill", "red")

joystick = {"x": 0, "y": 0, "angle": 0}


function image(el, x, y, img) {
    if (document.getElementById(img) == null){
        resourceLayer.append("image").attr("id", img).attr("href", img)
    }
    return el.append("use").attr("x", x).attr("y", y).attr("href", "#"+img);
}


connection.onopen = (event) => {
    connection.send('{"type": "New", "data": {}}');
};


connection.onmessage = (event) => {
    d3.selectAll("use").remove()
    data = JSON.parse(event.data.replaceAll("'", '"'));
    type = data["type"];
    data = data["data"];
    for (cell of data["planets"]) {
        res = image(planetLayer, cell.x, cell.y, cell.image).attr("width", cell.width).attr("height", cell.height).transition().duration(50)
        .attr("x", cell.x+cell.vx).attr("y", cell.y+cell.vy)
    }
    for (cell of data["ships"]) {
        res = image(shipLayer, cell.x, cell.y, cell.image).attr("transform",
        `rotate(${cell.angle}, ${cell.x+cell.width/2}, ${cell.y+cell.height/2})`).attr("width", cell.width).attr("height", cell.height)
        .transition().duration(500)
        .attr("x", cell.x+cell.vx).attr("y", cell.y+cell.vy).attr("transform",
        `rotate(${cell.angle+cell.w}, ${cell.x+cell.width/2+cell.vx}, ${cell.y+cell.height/2+cell.vy})`)
    }
    setTimeout(update, 500)
};


function stylize(){
    d3.select("#scalable").attr("style", `transform: translate(${canvas.x}px, ${canvas.y}px) scale(${canvas.scale})`)
}


function scale(event){
    canvas.scale -= event.deltaY * 0.001;
    stylize()
}

function move(event){
    if (event.buttons == 1) {
        canvas.x += event.movementX;
        canvas.y += event.movementY;
        stylize()
    }
}


function update(){
    connection.send('{"type": "New", "data": {"modules_state": ['+joystick.angle+', '+max(joystick.y, 0)/50+']}}');
    joystick.angle %= 360;
    if (joystick.angle > 0 && joystick.angle < 180) joystick.angle -= 0.1;
    if (joystick.angle >= 180) joystick.angle += 0.1;
    joy_update()
}

function joy_update(){
    circle.attr("transform", `translate(${joystick.x}, ${joystick.y})`)
    joy.attr("transform", `translate(${joystick.x}, ${joystick.y}), rotate(${joystick.angle}, ${cx}, ${cy})`)
    line.attr('x2', cx+joystick.x).attr("y2", cy+joystick.y);
}

function power(event) {
    if (event.buttons == 1) {
        console.log(event)
        k = canvas.width / document.getElementById("field").getBoundingClientRect().width;
//        k = 1;
        console.log(k, event.offsetX * k, parseFloat(circle.attr("cx")));
        joystick.x = event.offsetX * k - parseFloat(circle.attr("cx"));
        joystick.x = Math.max(-50, Math.min(joystick.x, 50))
        joystick.y = event.offsetY * k - parseFloat(circle.attr("cy"));
        joystick.y = Math.max(-50, Math.min(joystick.y, 50))
        console.log(joystick)
        joy_update()
    }
}

function rot(event) {
    console.log(event.deltaY)
    joystick.angle += event.deltaY * 0.5 / 200;
    joy_update()
}

document.body.addEventListener("mousemove", move)
document.body.addEventListener("mousewheel", scale)

document.getElementById("joystick").addEventListener("mousemove", power)
document.getElementById("joystick").addEventListener("mousewheel", rot)