const field = document.getElementById("field");
field.setAttribute("viewBox", "0 0 " + window.screen.width + " " + (window.screen.height -125));
const connection = new WebSocket("ws://localhost:8080");

const planetLayer = d3.select("#PlanetsLayer");
const shipLayer = d3.select("#ShipsLayer");
const resourceLayer = d3.select("#resourses");
resourceLayer.attr("transform", "scale(0)")
const interfaceLayer = d3.select("#InterfaceLayer");

const base64 = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");

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

modules = []

localStorage.clear()


function SizeFromPng(data) {
    let w = 0;
    for (i=25+22; i<28+22;i++){
        w <<= 6;
        let symb = data[i];
        w += base64.findIndex((s) => s==symb);
    }
    w >>= 8;
    let h = 0;
    for (i=30+22; i<32+22;i++){
        h <<= 6;
        let symb = data[i];
        h += base64.findIndex((s) => s==symb);
    }
    nw = w/32;
    nh = h/32;
    return {width: w, height:h}
}

class D3Use {
    constructor(){
        this.base_transform = "";
        this.x=0; this.y=0;
    }

    transform(transformation, f) {
        if (this.attr("transform") == null)
            this.attr("transform", "");
        if (f){
            this.attr("transform", this.attr("transform").replace(new RegExp(this.base_transform.replaceAll("(", "\\(").replaceAll(")", "\\)")+"$"),
            (this.base_transform = transformation + " " +this.base_transform)));
//            this.base_transform = transformation + " " +this.base_transform;
            transformation = "";
        }

        this.attr("transform", transformation + " " +this.attr("transform"));
        return this;
    }

	translate(dx, dy, f=false){
		this.transform(`translate(${dx}, ${dy})`, f);
		return this;
    }

	scale(sx, sy=null, f=false, cx=this.x, cy=this.y) {
		if (sy != null) {
			 this.translate(-this.x+cx, -this.y+cy, f).transform(`scale(${sx}, ${sy})`, f).translate(this.x-cx, this.y-cy, f);
		}
		else {
			 this.translate(-this.x+cx, -this.y+cy, f).transform(`scale(${sx})`, f).translate(this.x-cx, this.y-cy, f);
		}
		return this;
	}

	rotate(ang, cx=null, cy=null, f=false){
		if (cx == null | cy == null)
			this.transform(`rotate(${ang})`, f);
		else
			this.transform(`rotate(${ang}, ${cx}, ${cy})`, f);
		return this;
	}

	attr(func, arg=null){
	    if (arg == null)
	        return this.el.attr(func);
	    else
	        return this.el.attr(func, arg);
	}

	animate() {
	    this.attr("transform", this.base_transform);
	    this.transform("");
	    return this;
	}
}


class D3Image extends D3Use{
    static count = 0;
    constructor(layer, filename, x, y, size=null) {
        super()
        let res=null;
        if ((res = localStorage.getItem(filename)) == null)
            {
            resourceLayer.append("image").attr("href", filename).attr("id", "__img"+(++D3Image.count));
            res = (localStorage[filename] = D3Image.count);
            }
        this.el = layer.append("use").attr("href", "#__img"+res)
        let bsize = document.getElementById("__img"+res).getBBox();
    //        while (bsize.width == 0)
    //            bsize = document.getElementById("__img"+res).getBBox()
        if (size == null)
            size = bsize
        this.attr("x", 0).attr("y", 0);
        this.x = x+size.width/2; this.y = y+size.height/2;
        this.scale("1e-7", "1e-8", true).translate(x, y, true);
//        if (size)
//            this.el.attr("transform", (this.base_transform = `scale(${size.width}, ${size.height}) translate(${x * (1/size.width-1)}, ${y * (1/size.height-1)})`))
//        return this.el;
        this.animate();
        if (bsize.width != 0)
            this.sizer(size.width/bsize.width, size.height/bsize.height);
        else{
            let handler = () => {bsize = document.getElementById("__img"+res).getBBox();this.sizer(size.width/bsize.width, size.height/bsize.height);  document.getElementById("__img"+res).removeEventListener("load", handler);}
            document.getElementById("__img"+res).addEventListener("load", handler)
            console.log("!")
            }
    }

    sizer(sx, sy){
        this.base_transform = this.base_transform.replace("1e-7", sx).replace("1e-8", sy);
        this.attr("transform", this.attr("transform").replace("1e-7", sx).replace("1e-8", sy))
//        console.log("!!", this.base_transform, this.base_transform.replace("1e-7", sx).replace("1e-8", sy))
    }
}


class IModule {
    constructor(_id){
        this.id = _id;
        this.power = 0;
    }
    stringify(){
        return `{id: ${this.id}, power: ${this.power}}`;
    }

    set(_power){
        this.power = _power;
    }

    add(_power){
        this.power += _power;
        this.power = Math.min(Math.max(this.power, 0), 1)
    }
}


class Joystick{
    constructor(xc, yc, mx, img_base, img_connector, img_controller, mm, mr) {
//        super();
        this.joystick_g = interfaceLayer.append("g").attr("id", "joystick");
        this.circle = new D3Image(this.joystick_g, img_base, xc-100, yc-100, {width: 200, height: 200});
        this.line = new D3Image(this.joystick_g, img_connector, xc-100, yc-100, {width: 200, height: 200});
        this.joy = new D3Image(this.joystick_g, img_controller, xc-100, yc-100, {width: 160, height: 160});

        //this.line.transform("scale(1,"+"0"+ ")").attr("id", "jline");
        this.line.scale(1.2, 0).attr("id", "jline");
//        this.joy.transform("translate(20, 20)", true)
        this.joy.translate(20, 20, true);
        console.log("!")

        this.cx = xc;
        this.cy = yc;

        this.x = 0;
        this.y = 0;
        this.angle = 0;

        this.mx = mx;

        document.getElementById("joystick").addEventListener("mousemove", (event) => {this.power(event)});
        document.getElementById("joystick").addEventListener("mousewheel", (event) => {this.rot(event)});


//        this.connect();
        console.log(this)
        this.movement_module = mm;
        this.rotation_module = mr;
    }
    
    joy_update() {
        //this.circle.attr("transform", `translate(${this.x}, ${this.y})`)
        let sc = Math.min(Math.sqrt(this.x*this.x+this.y*this.y) / 60 + 1e-22, this.mx/60);

        let ang = Math.atan2(this.y, this.x);
        const sc_x = 1.2;
//        this.line.attr('transform', `scale(${sc_x},${sc}), translate(${this.cx*(1/sc_x-1)}, ${this.cy*(1/sc-1)})`)
        console.log(document.getElementById("jline").getBoundingClientRect())
        //this.line.transform(`scale(${sc_x},${sc}), translate(${this.cx*(1/sc_x-1)}, ${this.cy*(1/sc-1)})`)
        this.line.animate().scale(sc_x, sc, false, 0, 0).rotate(ang/3.14*180+90, this.cx, this.cy);
        console.log(document.getElementById("jline").getBoundingClientRect())
//        this.circle.attr("transform", `rotate(${-ang/3.14*180+90}, ${this.cx}, ${this.cy})`)
        this.circle.animate()
//        this.joy.attr("transform", `rotate(${this.angle-ang/3.14*180-90}, ${this.cx}, ${this.cy-sc*60}) translate(${0}, ${-sc*60})`)
        this.joy.animate().rotate(this.angle-(ang/3.14*180+90), this.cx, this.cy).translate(0, -60*sc).rotate(ang/3.14*180+90, this.cx, this.cy)
//        this.joy.animate().transform(`rotate(${this.angle-ang/3.14*180-90}, ${this.cx}, ${this.cy-sc*60}) translate(${0}, ${-sc*60})`)
//        this.joystick_g.attr("transform", `rotate(${ang/3.14*180+90}, ${this.cx}, ${this.cy})`)
//        this.joystick_g.transform(`rotate(${ang/3.14*180+90}, ${this.cx}, ${this.cy})`);
        this.movement_module.set(Math.min(Math.sqrt(this.x*this.x+this.y*this.y) / this.mx, 1))
        ang  = this.angle % 360
        if (ang>180)
            ang = 360 - ang
        this.rotation_module.set(ang)
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
        let ang  = this.angle % 360
        if (ang>180)
            ang = 360 - ang
        return [{id: 1, power: Math.min(Math.sqrt(this.x*this.x+this.y*this.y) / this.mx + 1e-22, 1)}, {id: 2, power: ang/180}]
    }
}


let mm = new IModule(1);
let mr = new IModule(2);

let move_control = new Joystick(canvas.width -100, canvas.height -100, 90-40*0.8, "data/icons/base.png", "data/icons/connector.png", "data/icons/controller.png", mm, mr)
console.log(move_control)

modules.push(mm)
modules.push(mr)
//move_control.connect();


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
//        res = image(planetLayer, cell.x, cell.y, cell.image).attr("width", cell.width).attr("height", cell.height).transition().duration(50)
//        .attr("x", cell.x+cell.vx).attr("y", cell.y+cell.vy).attr("class", "IUpdatable")
        D3Image(planetLayer, cell.image, cell.x, cell.y, cell).attr("class", "IUpdatable")
    }
    for (cell of data["ships"]) {
//        res = image(shipLayer, cell.x, cell.y, cell.image).attr("transform",
//        `rotate(${cell.angle}, ${cell.x+cell.width/2}, ${cell.y+cell.height/2})`).attr("width", cell.width).attr("height", cell.height)
//        .transition().duration(500)
//        .attr("x", cell.x+cell.vx).attr("y", cell.y+cell.vy).attr("transform",
//        `rotate(${cell.angle+cell.w}, ${cell.x+cell.width/2+cell.vx}, ${cell.y+cell.height/2+cell.vy})`).attr("class", "IUpdatable")
        D3Image(shipLayer, cell.image, cell.x, cell.y, cell).attr("class", "IUpdatable")
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
    mess = '{"type": "Update", "data": {"modules_state": ['
    for (el of modules)
        {console.log(el)
        mess += el.stringify()+', ';
        }
    if (mess[-2] == ',')
        mess = mess.slice(0, -3);
    mess += ']}}';
    connection.send(mess)
//    connection.send('{"type": "Update", "data": {"modules_state": ['+move_control.active_modules()+']}}');
//    console.log('{"type": "Update", "data": {"modules_state": ['+move_control.active_modules()+']}}')
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


function change_movement(event) {
    console.log(event, event.keyCode)
    switch (event.keyCode) {
        case 65:
        case 68:
        case 87:
            mm.set(1);
            break;
        case 83:
            mm.set(0);
            break;
        case 81:
            mr.add(-0.01);
            break;
        case 69:
            mr.add(0.01);
            break;
    }
}


document.body.addEventListener("keydown", change_movement)

//document.getElementById("joystick").addEventListener("mousemove", power)
//document.getElementById("joystick").addEventListener("mousewheel", rot)
