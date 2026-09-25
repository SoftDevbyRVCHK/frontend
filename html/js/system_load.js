const field = document.getElementById("field");
field.setAttribute("viewBox", "0 0 " + window.screen.width + " " + (window.screen.height -125));
let canvas = {width: window.screen.width, height: (window.screen.height -125)}
const connection = new WebSocket("ws://localhost:8765");
let tm = 0;

d3.select("#resourses").append("image").attr("x", canvas.width/2-197/2).attr("y", canvas.height/2-186/2).attr("id", "solar").attr("href", 'data/images/solar_ship.png')
d3.select("#resourses").append("image").attr("x", canvas.width/2-146/2).attr("y", canvas.height/2-145/2).attr("id", "earth").attr("href", 'data/images/earth_ship.png')
d3.select("#resourses").append("image").attr("x", canvas.width/2-146/2).attr("y", canvas.height/2-145/2).attr("id", "pluto").attr("href", 'data/images/pluto_ship.png')
d3.select("#resourses").append("rect").attr("x", 0).attr("y", 0).attr("width", canvas.width).attr("height", canvas.height);

connection.onopen = (event) => {
    console.log("Connection opened");
    connection.send("Reload");
};


connection.onmessage = (event) => {
    d3.selectAll("use").remove();
//    console.log(event.data);
    data = JSON.parse(event.data.replaceAll("'", '"'));
//    console.log(data);
    for (key in data){
//        console.log(key, data[key]);
        res = PlanetPosition2D(data[key]["a"], data[key]["e"], data[key]["s"], data[key]["t"], tm)
        let x = res.x;
        let y = res.y;
        d3.select("#PlanetsLayer").append("use").attr("x", x).attr("y", y).attr("href", "#"+key.split(".")[0]);
        }
    tm += 5;
    setTimeout(() => {connection.send("Reload")}, 50);
}
