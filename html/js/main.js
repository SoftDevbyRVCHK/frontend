let angle = 0;
let x=0;
let y=0;

let speed = 0;
let aspeed = 0;

const forward = ["W","w", "ArrowUp"]
const backward = ["S","s","ArrowDown"]
const left = ["A","a","ArrowLeft"]
const right = ["D", "d", "ArrowRight"]


function btn_click(e){
    if (forward.includes(e.key) && speed == 0)
        speed = 10
    if (backward.includes(e.key) && speed == 0)
        speed = -10
    if (left.includes(e.key) && aspeed == 0)
        aspeed = -5
    if (right.includes(e.key) && aspeed == 0)
        aspeed = 5
    console.log(e.key)
}


function update(){
    angle -= 90
    x += speed*Math.cos(angle*3.14/180)
    y += speed*Math.sin(angle*3.14/180)
    angle += 90
    angle += aspeed;
    const ship = document.getElementById("player_ship");
    ship.style.transform = "translate(" + x + "px, " +y +"px)";
    ship.style.transform += "rotate(" + angle + "deg)";
    setTimeout(update, 50)
}

function btn_unclick(e){
    if (forward.includes(e.key) && speed == 10)
        speed = 0
    if (backward.includes(e.key) && speed == -10)
        speed = 0
    if (left.includes(e.key) && aspeed == -5)
        aspeed = 0
    if (right.includes(e.key) && aspeed == 5)
        aspeed = 0
    }


document.body.addEventListener("keydown", btn_click);
document.body.addEventListener("keyup", btn_unclick);
update()
