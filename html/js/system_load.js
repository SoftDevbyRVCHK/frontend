const field = document.getElementById("field");
field.setAttribute("viewBox", "0 0 " + window.screen.width + " " + (window.screen.height -125));
let canvas = {width: window.screen.width, height: (window.screen.height -125)}
const connection = new WebSocket("ws://localhost:8765");
let tm = 0;
let data;
let updates = false;

let sc = 1;
let mv = {x: 0, y:0}

let ship = {x: 300, y: 0, angle: 0, vx: 0, vy: 0, va: 0, orbit: {a: 0, e:0, s: 0, t:0, n:0}, mass: 1e-5}
let planet = {x: 0, y:0}

const steps = 200;
let step = 50;

const speed = 0.1, aspeed=1;

const forward = ["KeyW", "ArrowUp"]
const backward = ["KeyS","ArrowDown"]
const left = ["KeyA","ArrowLeft"]
const right = ["KeyD", "ArrowRight"]

//d3.select("#resourses").append("image").attr("x", canvas.width/2-197/2).attr("y", canvas.height/2-186/2).attr("id", "solar").attr("href", 'data/images/solar_ship.png')
//d3.select("#resourses").append("image").attr("x", canvas.width/2-146/2).attr("y", canvas.height/2-145/2).attr("id", "earth").attr("href", 'data/images/earth_ship.png')
//d3.select("#resourses").append("image").attr("x", canvas.width/2-250/2).attr("y", canvas.height/2-250/2).attr("id", "pluto").attr("href", 'data/images/pluto_ship.png')
d3.select("#resourses").append("rect").attr("x", 0).attr("y", 0).attr("width", canvas.width).attr("height", canvas.height);
d3.select("#resourses").append("linearGradient").attr("id", "grad");
d3.select("#grad").append("stop").attr("stop-color", "aqua").attr("offset", 0)
d3.select("#grad").append("stop").attr("stop-color", "white").attr("offset", 0.5)
d3.select("#ShipsLayer").append("ellipse").attr("cx", 0).attr("cy", 0).attr("rx", 20).attr("ry", 10).attr("id", "user").attr("fill", "url(#grad)")

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
        el.append("image").attr("class", "Planet").attr("x", canvas.width/2+x-r).attr("y", canvas.height/2+y-r).attr("width", 2*r).attr("height", r*2).attr("href", key).attr("id", "P"+key.split('/').pop().split(".")[0]).attr("style", "transform-origin:"+canvas.width/2+"px "+canvas.height/2+"px; transform:rotate("+data[key]['n']+"deg");
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
        res0 = PlanetPosition2D(a=data[key]["a"], e=data[key]["e"], data[key]["s"], data[key]["t"], tm - step)
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
    tm += step;
    ship_update();
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

function orbit(){

}

function ship_move(e){
    console.log(e)
    if (forward.includes(e.code))
        {ship.vx += speed*Math.cos(ship.angle/180*3.14); ship.vy += speed*Math.sin(ship.angle/180*3.14);

//        sum_v = Math.pow(ship.vx, 2) + Math.pow(ship.vy, 2)
//        sum_v = 90000;
//        sum_c = Math.pow(ship.x - planet.x, 2) + Math.pow(ship.y - planet.y, 2)
//
//        a_div_ec = Math.sqrt(sum_c)
//        a_add_ec = sum_v / a_div_ec
//
//        a = (a_div_ec + a_add_ec) / 2
//        ec = (a_add_ec - a)
//        console.log(a_div_ec, a_add_ec)
//        // выражение для кв. синуса неверно
//        sin2s = (sum_v + Math.pow(ec, 2)) / (Math.pow(a, 2))
//        coss = Math.sqrt(1 - sin2s)
//        if (ec < 0){
//            coss = -coss;
//        }
//        sins = Math.sqrt(sin2s);
//        e = ec / coss / a;
//        b = a * Math.sqrt(1 - e*e);
//        console.log([b])
//        if (! (b>0) )
//            b  = 3;
//        console.log(b)
//        cosn = (-ship.vx * a * sins + ship.vy * b * coss) / (a*a + b*b)
//        sinn = (-ship.vy * a * sins - ship.vx * b * coss) / (a*a + b*b)
//        xc = planet.x - a * e * cosn;
//        yc = planet.y - a * e * sinn;
//        xc=0;
//        yc=0;
////        console.log(a, b, ec, coss, e);
//        d3.select("#userOrbit").remove();
//        d3.select("#OrbitsLayer").append("ellipse").attr("cx", xc+canvas.width/2).attr("cy", yc+canvas.height/2).attr("rx", a).attr("ry", b).attr("id", "userOrbit").attr("fill", "rgba(0, 0, 0, 0)").attr("stroke", "purple")
//        .attr("style", "transform-origin:"+(xc+canvas.width/2)+"px "+(yc+canvas.height/2)+"px;transform: rotate("+Math.atan2(sinn, cosn)*180/3.14+"deg)")
//        a=0;
//        ship.orbit.a = a; ship.orbit.e = e; ship.orbit.n = Math.atan2(sinn, cosn); ship.orbit.s = Math.sqrt(sum_v) / a; ship.orbit.t = -ship.orbit.n + Math.atan2(ship.y-planet.y, ship.x-planet.x);
        //ship.orbit.
        }
    if (left.includes(e.code))
        {ship.va -= aspeed}
    if (right.includes(e.code))
        {ship.va += aspeed}
    }


function ship_update(){
    //ship.vx, ship.vy = orbit
//    if (ship.orbit.a){
//    ship.orbit.n = 0; ship.orbit.t = 0;
//    console.log(ship.orbit)
//    res = PlanetPosition2D(ship.orbit.a, ship.orbit.e,ship.orbit.s, ship.orbit.t, 50);
//    x = (res.x-planet.x)*Math.cos(ship.orbit.n) - (res.y-planet.y)*Math.sin(ship.orbit.n) + planet.x;
//    y = (res.x-planet.x)*Math.sin(ship.orbit.n) + (res.y-planet.y)*Math.cos(ship.orbit.n) + planet.y;
//    console.log(x, y, res, Math.cos(orbit.n));
//    ship.vx = x - ship.x;
//    ship.vy = y - ship.y;}
    d3.select("#O"+(tm - step * steps)).remove();
    d3.select("#OP"+(tm - step * 40 * steps)).remove();
//    v = ship.vx*ship.vx+ship.vy*ship.vy
//    if (v > 10000) {ship.vx =0;ship.vy=0;v=0}
//
    for (key in data){
        g = data[key]["G"] * ship.mass;
        el = d3.select("#P"+key.split('/').pop().split(".")[0]);
        x = el.attr("x")-0+data[key]["r"]; y= el.attr("y")-0+data[key]["r"];
//        console.log(x, y)
        x0 = canvas.width/2+ship.x; y0 = canvas.height/2+ship.y;
        d = (x0-x)*(x0-x) + (y0-y)*(y0-y);
        g /= d;
        ship.vx += g * (x-x0);
        ship.vy += g * (y-y0);
    }

//    let vx=ship.vx/step, vy=ship.vy/step;
//    ship.vx = 0;
//    ship.vy = 0;

//
//    for (let p =0; p < step; p++ ){
//
//        for (key in data){
//            g = data[key]["G"] * ship.mass;
//            el = d3.select("#P"+key.split('/').pop().split(".")[0]);
//            x = el.attr("x")-0+data[key]["r"]; y= el.attr("y")-0+data[key]["r"];
//    //        console.log(x, y)
//            x0 = canvas.width/2+ship.x; y0 = canvas.height/2+ship.y;
//            d = (x0-x)*(x0-x) + (y0-y)*(y0-y);
//            g /= d;
//            ship.vx += g * (x-x0) / step;
//            ship.vy += g * (y-y0) / step;
//        }
//        ship.x += ship.vx / step ;
//        ship.y += ship.vy / step ;
//        }
//    ship.vx += vx*step; ship.vy += vy*step;
    d3.select("#OrbitsLayer").append("line").attr("x1", ship.x).attr("y1", ship.y)
    .attr("x2", ship.x+ship.vx).attr("y2", ship.y+ship.vy).attr("stroke", "aqua").attr("id", "O"+tm)
    .attr("style", `transform:translate(${canvas.width/2}px, ${canvas.height/2}px)`)
    if (tm % (40*step) == 0){
        d3.select("#OrbitsLayer").append("circle").attr("cx", ship.x+canvas.width/2).attr("cy", ship.y+canvas.height/2).attr("r", 3).attr("fill", "green").attr("id", "OP"+tm)
    }
    ship.x += ship.vx;
    ship.y += ship.vy;
    ship.angle += ship.va;

//    console.log(ship);

    d3.select("#user").attr("cx", canvas.width/2+ship.x).attr("cy", canvas.height/2+ship.y).attr("style", "transform-origin:"+(canvas.width/2+ship.x)+"px "+(canvas.height/2+ship.y)+"px;"+`transform:rotate(${ship.angle}deg)`);
}

document.body.addEventListener("mousemove", move)
document.body.addEventListener("mousewheel", scale)
document.body.addEventListener("keydown", ship_move)