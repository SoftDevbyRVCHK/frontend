const field = document.getElementById("field");
field.setAttribute("viewBox", "0 0 " + window.screen.width + " " + (window.screen.height -125));
let canvas = {width: window.screen.width, height: (window.screen.height -125)}
const connection = new WebSocket("ws://localhost:8765");
let tm = 0;
let data;
let updates = false;

let sc = 1;
let mv = {x: 0, y:0}

//d3.select("#resourses").append("image").attr("x", canvas.width/2-197/2).attr("y", canvas.height/2-186/2).attr("id", "solar").attr("href", 'data/images/solar_ship.png')
//d3.select("#resourses").append("image").attr("x", canvas.width/2-146/2).attr("y", canvas.height/2-145/2).attr("id", "earth").attr("href", 'data/images/earth_ship.png')
//d3.select("#resourses").append("image").attr("x", canvas.width/2-250/2).attr("y", canvas.height/2-250/2).attr("id", "pluto").attr("href", 'data/images/pluto_ship.png')
d3.select("#resourses").append("rect").attr("x", 0).attr("y", 0).attr("width", canvas.width).attr("height", canvas.height);

connection.onopen = (event) => {
    console.log("Connection opened");
    connection.send("Reload");
};


connection.onmessage = (event) => {
    updates = true;
//    d3.selectAll("use").remove();
//    console.log(event.data);
    data = JSON.parse(event.data.replaceAll("'", '"'));
//    console.log(data);

    create();
}

function create(){
    d3.selectAll(".Planets").remove()
        for (key in data){
//        console.log(key, data[key]);
        res = PlanetPosition2D(a=data[key]["a"], e=data[key]["e"], data[key]["s"], data[key]["t"], tm)
        let x = res.x;
        let y = res.y;
        el = d3.select("#PlanetsLayer")
//        el = d3.select("#PlanetsLayer").append("g").attr("class", "Planet").attr("id", "G"+key.split("/").pop().split(".")[0]).attr("style", "transform-origin:"+canvas.width/2+"px "+canvas.height/2+"px; transform:rotate("+data[key]['n']+"deg)")
//        el = d3.select("#G"+key.split("/").pop().split(".")[0])
        a=data[key]["a"]; e=data[key]["e"];r=data[key]["r"];
        d3.select("#OrbitsLayer").append("ellipse").attr("cx", canvas.width/2-e*a).attr("cy", canvas.height/2).attr("rx", a).attr("ry", Math.sqrt(1-e*e)*a).attr("stroke", "white").attr("fill", "rgba(0, 0, 0,0)").attr("class", "Planet").attr("style", "transform-origin:"+canvas.width/2+"px "+canvas.height/2+"px; transform:rotate("+data[key]['n']+"deg)")
        el.append("image").attr("class", "Planet").attr("x", canvas.width/2+x-r).attr("y", canvas.height/2+y-r).attr("width", 2*r).attr("height", r*2).attr("href", key).attr("id", "P"+key.split('/').pop().split(".")[0]).attr("style", "transform-origin:"+canvas.width/2+"px "+canvas.height/2+"px; transform:rotate("+data[key]['n']+"deg)");
//        res = PlanetPosition2D(data[key]["a"], data[key]["e"], data[key]["s"], data[key]["t"], tm -5)
//        let x0 = res.x;
//        let y0 = res.y;

        }
      updates = false;
      setTimeout(update, 50);
//    tm += 5;
}


function update(){

        for (key in data){

//        console.log(key, data[key]);
        res0 = PlanetPosition2D(a=data[key]["a"], e=data[key]["e"], data[key]["s"], data[key]["t"], tm - 50)
        res = PlanetPosition2D(a=data[key]["a"], e=data[key]["e"], data[key]["s"], data[key]["t"], tm)
        let x = res.x-res0.x*0;
        let y = res.y-res0.y*0;
//        x=0;
//        y=0;
//        el = d3.select("#G"+key.split('/').pop().split(".")[0])
        r = data[key]["r"];
//        strs = el.attr("style").split("transform:")
//        nd = strs.pop().split(" ").pop();
//        st = strs.pop();

        d3.select("#P"+key.split('/').pop().split(".")[0]).attr("x", canvas.width/2+x-r).attr("y", canvas.height/2+y-r)
//        d3.select("#PlanetsLayer").append("use").attr("x", x).attr("y", y).attr("href", "#P"+key.split(".")[0]);
//        res = PlanetPosition2D(data[key]["a"], data[key]["e"], data[key]["s"], data[key]["t"], tm -5)
//        let x0 = res.x;
//        let y0 = res.y;
//        a=data[key]["a"]; e=data[key]["e"]
//        d3.select("#ShipsLayer").append("line").attr("x1", canvas.width/2+x0).attr("y1", canvas.height/2+y0).attr("x2", canvas.width/2+x).attr("y2", canvas.height/2+y).attr("stroke", "white")
//        d3.select("#InterfaceLayer").append("ellipse").attr("cx", canvas.width/2-e*a).attr("cy", canvas.height/2).attr("rx", a).attr("ry", Math.sqrt(1-e*e)*a).attr("stroke", "purple").attr("fill", "rgba(0, 0, 0,0)")
        }
    tm += 50;
    if (!updates)setTimeout(update, 50);
}

update();


function stylize(){
    d3.select("#scalable").attr("style", `transform: translate(${mv.x}px, ${mv.y}px) scale(${sc})`)
}


function scale(event){
    sc -= event.deltaY * 0.001;
    stylize()
}

function move(event){
    if (event.buttons == 1) {
        mv.x += event.movementX;
        mv.y += event.movementY;
        stylize()
    }
}

document.body.addEventListener("mousemove", move)
document.body.addEventListener("mousewheel", scale)