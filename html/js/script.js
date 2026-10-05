const field = document.getElementById("field");
field.setAttribute("viewBox", "0 0 " + window.screen.width + " " + (window.screen.height -125));
const connection = new WebSocket("ws://localhost:8080");

const planetLayer = d3.select("#PlanetsLayer");
const shipLayer = d3.select("#ShipsLayer");
const resourceLayer = d3.select("#resourses");


canvas = {width: window.screen.width, height: window.screen.height -125, x: 0, y: 0, scale: 0}


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
    for (cell in data["ships"]) {
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
    connection.send('{"type": "New", "data": {}}');
}

document.body.addEventListener("mousemove", move)
document.body.addEventListener("mousewheel", scale)