const field = document.getElementById("field");
field.setAttribute("viewBox", "0 0 " + window.screen.width + " " + (window.screen.height -125));
const connection = new WebSocket("ws://localhost:8080");

const planetLayer = d3.select("#PlanetsLayer");
const shipLayer = d3.select("#ShipsLayer");
const resourceLayer = d3.select("#resourses");
resourceLayer.attr("transform", "scale(0)")
const interfaceLayer = d3.select("#InterfaceLayer");

canvas = {width: window.screen.width, height: window.screen.height -125, x: 0, y: 0, scale: 1}

//joystick_g = interfaceLayer.append("g").attr("id", "joystick")
//joystick_g.append("circle").attr("cx", canvas.width-100).attr("cy", canvas.height-100).attr("r", 90).attr("fill", "white").attr("stroke", "black")
//line = joystick_g.append("line")
//circle = joystick_g.append("circle").attr("cx", canvas.width-100).attr("cy", canvas.height-100).attr("r", 40)
//.attr("stroke", "darkgray")
//cx = circle.attr("cx")-0; cy = circle.attr("cy")-0;
//line.attr("x1", cx).attr("y1", cy).attr("x2", cx).attr("y2", cy).attr("stroke", "darkgray").attr("stroke-width", 25);
//joy = joystick_g.append("polygon").attr("points", `${[cx-25, cy+30, cx, cy+40, cx+25, cy+30, cx, cy-40]}`).attr("fill", "red")

joystick = {"x": 0, "y": 0, "angle": 0}

localStorage.clear()


class D3Image {
    static count = 0;
    constructor(layer, filename, x, y, size=null) {
       let res=null;
        if ((res = localStorage.getItem(filename)) == null)
            {
            resourceLayer.append("image").attr("href", filename).attr("id", "__img"+(++D3Image.count));
            res = localStorage[filename] = D3Image.count;
            }
        this.el = layer.append("use").attr("x", x).attr("y", y).attr("href", "#__img"+res)
        if (size)
            this.el.attr("width", size.width).attr("height", size.height)
        return this.el;
    }
}


class IControls {
    constructor(){}
    active_modules() {return []}
}


class Joystick extends IControls {
    constructor(xc, yc, img_base, img_connector, img_controller) {
        super();
        this.joystick_g = interfaceLayer.append("g").attr("id", "joystick");
        this.circle = new D3Image(this.joystick_g, img_base, xc-100, yc-100, {width: 200, height: 200});
        this.line = new D3Image(this.joystick_g, img_connector, xc-100, yc-100, {width: 200, height: 200}).attr("transform", "scale(1,"+"0"+ ")");
        this.joy = new D3Image(this.joystick_g, img_controller, xc-100, yc-100, {width: 200, height: 200});
        
        this.cx = xc;
        this.cy = yc;

        this.x = 0;
        this.y = 0;
        this.angle = 0;

//        this.connect();
        console.log(this)
    }
    
    joy_update() {
        //this.circle.attr("transform", `translate(${this.x}, ${this.y})`)
        let sc = Math.min(Math.sqrt(this.x*this.x+this.y*this.y) / 60 + 1e-22, 1.33333333333);

        let ang = Math.atan2(this.y, this.x);
        this.line.attr('transform', `scale(${1},${sc}), translate(${0}, ${-this.cy+this.cy/sc})`)
        this.circle.attr("transform", `rotate(${-ang/3.14*180+90}, ${this.cx}, ${this.cy})`)
        this.joy.attr("transform", `rotate(${this.angle-ang/3.14*180-90}, ${this.cx}, ${this.cy-sc*60}) translate(${0}, ${-sc*60})`)
        this.joystick_g.attr("transform", `rotate(${ang/3.14*180+90}, ${this.cx}, ${this.cy})`)
    }

    power(event) {
        if (event.buttons == 1) {
//            console.log(event)
//            console.log(this)
            let k = canvas.width / document.getElementById("field").getBoundingClientRect().width;
//            k = 1;
//            console.log(k, event.offsetX * k, this.cx);
            this.x = event.offsetX * k - this.cx;
            this.y = event.offsetY * k - this.cy;

            //console.log(joystick)
            this.joy_update()
        }
        if (event.buttons == 2) {
            event.preventDefault();
            let k = canvas.width / document.getElementById("field").getBoundingClientRect().width;
            this.angle = Math.atan2(event.offsetY * k - this.cy-this.y, event.offsetX * k - this.cx-this.x) / Math.PI * 180+90;
            this.joy_update()
        }
    }

    rot(event) {
        event.preventDefault();
    //    console.log(event)
    //    console.log(event.wheelDelta)
        this.angle += event.wheelDelta * 0.5 / 200;
        this.joy_update()
    }

    connect(){
        document.getElementById("joystick").addEventListener("mousemove", (event) => {this.power(event)});
        document.getElementById("joystick").addEventListener("mousewheel", (event) => {this.rot(event)});
    }

    active_modules(){
        return [("engine1", Math.min(Math.sqrt(this.x*this.x+this.y*this.y) / 60 + 1e-22, 1.33333333333)), ("rotator1", this.angle)]
    }
}


let move_control = new Joystick(canvas.width -100, canvas.height -100, "data/icons/base.png", "data/icons/connector.png", "data/icons/controller.png")
console.log(move_control)
move_control.connect();


function image(el, x, y, img) {
    return new D3Image(el, img, x, y)
}


connection.onopen = (event) => {
    connection.send('{"type": "New", "data": {}}');
};


connection.onmessage = (event) => {
    d3.selectAll(".IUpdatable").remove()
    data = JSON.parse(event.data.replaceAll("'", '"'));
//    console.log(data)
    type = data["type"];
    data = data["data"];
    for (cell of data["planets"]) {
        res = image(planetLayer, cell.x, cell.y, cell.image).attr("width", cell.width).attr("height", cell.height).transition().duration(50)
        .attr("x", cell.x+cell.vx).attr("y", cell.y+cell.vy).attr("class", "IUpdatable")
    }
    for (cell of data["ships"]) {
        res = image(shipLayer, cell.x, cell.y, cell.image).attr("transform",
        `rotate(${cell.angle}, ${cell.x+cell.width/2}, ${cell.y+cell.height/2})`).attr("width", cell.width).attr("height", cell.height)
        .transition().duration(500)
        .attr("x", cell.x+cell.vx).attr("y", cell.y+cell.vy).attr("transform",
        `rotate(${cell.angle+cell.w}, ${cell.x+cell.width/2+cell.vx}, ${cell.y+cell.height/2+cell.vy})`).attr("class", "IUpdatable")
    }
    setTimeout(update, 500)
};


function stylize(){
    d3.select("#scalable").attr("style", `transform: translate(${canvas.x}px, ${canvas.y}px) scale(${canvas.scale})`)
}


function scale(event){
    event.preventDefault();
    canvas.scale -= event.wheelDelta * 0.001;
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
    connection.send('{"type": "Update", "data": {"modules_state": ['+move_control.active_modules()+']}}');
    console.log('{"type": "Update", "data": {"modules_state": ['+move_control.active_modules()+']}}')
//    joystick.angle %= 360;
//    if (joystick.angle > 0 && joystick.angle < 180) joystick.angle -= 0.1;
//    if (joystick.angle >= 180) joystick.angle += 0.1;
//    //joy_update()
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
        //console.log(joystick)
        joy_update()
    }
}

function rot(event) {
    event.preventDefault();
//    console.log(event)
//    console.log(event.wheelDelta)
    joystick.angle += event.wheelDelta * 0.5 / 200;
    joy_update()
}


document.body.addEventListener("mousemove", move)
document.getElementById("field").addEventListener("mousewheel", scale)

//document.getElementById("joystick").addEventListener("mousemove", power)
//document.getElementById("joystick").addEventListener("mousewheel", rot)
