let canvas = document.getElementById("canvas").getBoundingClientRect();
const loader = document.getElementById("fileInput");
const downloader = document.getElementById("download");
const reader = new FileReader();
const decoder = new TextDecoder('utf-8');
const encoder = new TextEncoder('utf-8');

const modeB = document.getElementById("mode");

document.getElementById("canvas").setAttribute("viewBox", "0 0 " + canvas.width + " " + canvas.height);

const base64 = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");

let mode = "Floor";
let last = [-1, -1];

let global_move = [0, 0];
let cash = new Map();

let matrix = [];

for (y=0; y<8; y++){
    matrix[y] = [];
    for (x=0; x<8; x++)
        matrix[y][x] = [0, 0, 0, 0];
    }


let filename = "";


let nw = 8;
let nh = 8;
let k = Math.min(canvas.width/256, canvas.height/256);
let sz = 32*k;
let rsz = sz;

let start_list = [];
let phase = 0;
let delays = [];

for (y=0; y<8; y++) {
    delays.push([]);
    for (x=0; x<8; x++) {
        delays[y].push(-1);
    }
}

const mainIm = d3.select("#layer0").append("image").attr("width", 8*sz).attr("height", 8*sz).attr("id", "main");

if ((data = localStorage.getItem("floorIm")) == null)
    localStorage.setItem("floorIm", data="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAkUlEQVR4nO2UMQ7AIAwDTdXH+kl5LEOXQhGkVYcIGJwxOJKFrUskMxbO2S/MzNtnkuEaADj+mHJ2UZrHwO0YXiRlF62pBsp3ecfdUbgmkcxm1n7NkJOTZ4iGZN6nA6tmMNBm9VaoKE01UB76osApVLQm9a4EIoEIAtHkEYgEIoFIIBKIBKL9SvgFkGgN4EQwey7ZGKxapp/qnQAAAABJRU5ErkJggg==");
const floorIm = d3.select("#fixed").append("image").attr("width", sz).attr("height", sz).attr("id", "floor").attr("x", -sz).attr("href", data);
const UIm = d3.select("#fixed").append("image").attr("width", sz).attr("height", sz).attr("id", "U").attr("x", -sz)
.attr("href", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACWklEQVR4nO2WEZAjQRSG/7t60BAIBAYGAgOBgcBCYGAgeBAIBBYOFxYCgcODwMLhwcJCYGEgsLAwcBAIHAQaBgYaBhoaAgeBhh+OsrVVm6pMklm52w9n6r339Zvu6Qd88L/z6ZwgV5bEzgP0AAkoBbTbCKJI3lXArdekLkBrge0W3O0AT0inDXQ6kDCE9GMgDBF0u7Vkagk4Y8jnHH61hsQ9SC+CxDGCfl8AwOmCrCqwLEGtodIUkiQI4t5RiaMCbrWif3oGrUW0zI4mdJWln8+BbhdqmCIYDE7+LC/Y55xmNGF194Mnx94/sJrOaFerk2MBAG6jaYZfaBeP5yUAYJdLVtMZndan5XCloRmNWc3vzi7+IvGwOL2DdrGgieKLi++p5nd0m83BfJ8PPfTLJ8hk1FR9qDQBS3Pw3RsBt9GkqaDG48YEgiQRmpoC1BoAX854Y7RUTYHtFipJGq0NABKE9QREml34Hp8t6wlQKbAoGxdgeTjn2w5EESCAK4rGjqErS0rdPSBBB1AtcLVuqj74ewNEUT2BoN8XuerDZ1lzAnkONUzrCQCAJAOg1cYl98Aem2X0RYHw5ua03V3dTmkG6ekXySvcas2y26PNluflqG6nNOmQ52xIpzVNfMXq+/yyLprJNc3VgHZZfxV28ciyHbCazo7G1BrJqtk3UmtAtaCuJ5Bu+GbScUVBag3/8x7wHvL1Gt3p9PKRbI/Nc/rHDLAWEAG8B/7sIMMUPv8FabeBVguSDKDGIwRx3NxQ+hpnDOEcWJSg9xAQUC1I3EOQJO/zH//gn+Yvw0gjT+psaEgAAAAASUVORK5CYII=");
const EIm = d3.select("#fixed").append("image").attr("width", sz).attr("height", sz).attr("id", "E").attr("x", -sz)
.attr("href", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACcUlEQVR4nN2Xr3bbUAzGf90RELjgAoOAgILBgoGAgYE9QuHAQMHAQEFAHyMgoGCgcKBgD1BYUFg4EBAwEBBgYGAgIDAgx9maNK2d7K+Aj8+1LX3S90n3GvawyWjqk9HU9/HxYp/g2+5/G4BD2f8DoC8NvQDsK7y9ARzS/jiAo64fTEZTFxUQEBEQQZLgtWNlzcX9WLr46/QyQBpmJCnuIYM8GlJ/XSKpj7c+FKiAgjTBNGsbWLP+WgCXp1eOO5gTHACqYIAI7vDp3edOHfKkBiajqWuhiD7ITmBwetKWoryZIUmwyhDAHbwyzm8+7CRm68Mf+1yzIjlFHBHcPLyLhAgbc3e8ckQFHCQJuDN9c+lu4W6bQOVhwI0XkiBZ8crADFHBkQjUZBo3UQy3ACEAKiFYqzcSWwE6emqq6SAhSVu4xetjJCcwAwSPwlDPSnSYkJwo7+brylRGPS8f9f9k4xRvX6I54bVFuhqldXOsrMKJKhBrVDVpkKGpXHk73+U+RLirClokpFBwwJ38atjOgXoWmaXjjLvHemnYomz4iKZ5rAIX92PZ6IKHYDQrUqT1ghD8i6BZ8dqRrNgiqrEShTcXW1SsRLgKulGBXTYZTT0NI0MtEl4Zsho4Kk2XaFTD1/PBzbFlxfj2fCfNnfaCq7NrDy00cZKiw0w6zixv5y1NH7+cPXsod96Mrt5feys4EfLJgGq2bKYjnYJDj73AraGgGUIrfYjK5rR8hnXev+pv1U9cx8xdeep+UOpMAazPBFoobrRzYXy3W3DbrMcOHubm1Iu67+et/fEjWS8AXY9dBwewzfqC+jcp+GvsEL/n3wE8kRQX2knxRgAAAABJRU5ErkJggg==");
const PIm = d3.select("#fixed").append("image").attr("width", sz).attr("height", sz).attr("id", "P").attr("x", -sz)
.attr("href", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAhElEQVR4nO2VMQqAMBRDq3Rw9Bje/zQew7GDg5NQSkWaBMqHvL36fEFNyRiCc9tv9hore3NWAhZQAQm0T81UiFlgqsBXbnQGqsBRrsycpwUUDAn8ZUZmgAu8+dkZYk1Qo/gPDAv0ctciyBxxJ1CxIId6+6Nvw/QCMQXa3MzHKGYBY4ySBzVDJ9q1SkOSAAAAAElFTkSuQmCC");
const CIm = d3.select("#fixed").append("image").attr("width", sz).attr("height", sz).attr("id", "C").attr("x", -sz)
.attr("href", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAe0lEQVR4nO2Uuw3AIAwFnYiSgRiIsRiIgSgp0iNj/EGp3lUUiDs+gggAAECA3MrMrczIGm9Ezo1/CeCE3ghzgCTyRJgCVsGoPY3aUyRCHcDJubE1wv0Ib6EOkHYpnc6JRztxJ1uxyIkcVyAJrHJXwE7kkYe58RUDAAD4AMzoNzzrQPzLAAAAAElFTkSuQmCC");
const BIm = d3.select("#fixed").append("image").attr("width", sz).attr("height", sz).attr("id", "B").attr("x", -sz)
.attr("href", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAV0lEQVR4nGNgGAWjYBSMglEwCgYYMJKts+fKHzi7RIeFXGOYKLYcG5+mDsBlGZmOIC8EYICCoKeOAygIevIdgMvXZIYGeSGAbhkVomIUjIJRMApGwcgFAHbNEg4ogNyBAAAAAElFTkSuQmCC");

d3.select("#fixed").append("rect").attr("x", -sz).attr("y", 0).attr("width", sz).attr("height", sz).attr("id", "pin").attr("fill", 'rgba(0, 0, 255, 0.5)');
d3.select("#fixed").append("rect").attr("x", -sz).attr("y", 0).attr("width", sz).attr("height", sz).attr("id", "bin").attr("fill", 'rgba(255, 0, 0, 0.3)');
d3.select("#fixed").append("rect").attr("x", -sz).attr("y", 0).attr("width", sz).attr("height", sz).attr("id", "sel").attr("fill", 'rgba(0, 255, 0, 0.3)');
d3.select("#fixed").append("rect").attr("x", -sz*2/3).attr("y", sz/3).attr("width", sz/3).attr("height", sz/3).attr("id", "lab").attr("fill", 'white');

function line(x1, y1, x2, y2, col) {
    d3.select("#fixed").append("line").attr("x1", x1).attr("x2", x2).attr("y1", y1).attr("y2", y2).attr("stroke", "black");
}

for (x=0; x<9; x++) {
    line(x*sz, 0, x*sz, canvas.width);
    line(0, x*sz, canvas.height, x*sz);
}

function Clear() {
    for (var el of d3.selectAll('use'))
        el.remove();
    for (var el of d3.selectAll('text'))
        el.remove();
}


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
    return {w: w, h:h}
}

function StartPlaces() {
    start_list.splice(0);
    start_list.length = 0;
//    for (let x= 1; x < nw; x++)
//        start_list.push([x, 0]);
//    for (let y = 1; y < nh; y++)
//        start_list.push([nw - 1, y]);
//    for (let x = nw - 2; x>-1; x--)
//        start_list.push([x, nh - 1]);
//    for (let y = nh - 2; y >-1; y--)
//        start_list.push([0, y]);
//    console.log(start_list);
}


function click(event) {
    let x = Math.floor(event.x/rsz);
    let y = Math.floor(event.y/rsz);
    tag = ""+(x-global_move[0])+"x"+(y-global_move[1]);
//    last = [x + global_move[0], y + global_move[1]];
    if (mode == "Floor") {
        if (x - global_move[0] >= nw || y - global_move[1] >= nh)
            return
        if (x - global_move[0] < 0 || y - global_move[1] < 0)
            return
//        console.log(matrix[y][x][2]);
        matrix[y][x][2] = 1-matrix[y][x][2];
        if (x == global_move[0] || x == nw -1+global_move[0] || y == global_move[1] || y == nh -1+global_move[1])
            {
            if (matrix[y][x][2])
                {start_list.push([x, y]);length++;}
            else
                {start_list.splice(start_list.indexOf([x, y]), 1);length--;}
            start_list.sort(sortf)
//            console.log(start_list);
            }
//        console.log(matrix[y][x][2]);
        x1 = (x+1) * sz;
        y1 = (y) * sz;
        if (matrix[y][x][2])
            d3.select("#layer2").append("use").attr("href", "#floor").attr("x", x1).attr("y", y1).attr("id", "f"+tag);
        else
            d3.select("#f"+tag).remove();
    }
    else if (mode == "Pins") {
        if (x - global_move[0] >= nw || y - global_move[1] >= nh)
            return
        if (x - global_move[0] < 0 || y - global_move[1] < 0)
            return
        if (matrix[y][x][0] != matrix[y][x][1])
            return
        matrix[y][x][0] = 1-matrix[y][x][0];
        if (matrix[y][x][0]){
            matrix[y][x][1] = 1;
            x1 = (x+1) * sz;
            y1 = (y) * sz;
            d3.select("#layer1").append("use").attr("x", x1).attr("y", y1).attr("href", "#pin").attr("id", "P"+tag);
            }
        else
        {
            matrix[y][x][1] = 0;
            d3.select("#P"+tag).remove();
        }
    }
    else if (mode == "Change"){
        if (Math.pow(d3.select("#Circle").attr("cx")-event.x/rsz*sz, 2)+Math.pow(d3.select("#Circle").attr("cy")-event.y/rsz*sz, 2) >= Math.pow(d3.select("#Circle").attr("r"), 2)){
            mode = "Floor";
            for (el of d3.selectAll(".changer")){
                el.remove();
            }
        }
    }
}


function label(x, y, code) {
//    console.log(y, x);
    matrix[y][x][3] = code;
    x -= global_move[0];
    y -= global_move[1];
    tag = "t"+x+"x"+y;
    x += global_move[0]
    y += global_move[1]
    for (el of d3.selectAll('.'+tag)) el.remove();
    col = (code == 31) ? "DarkRed" : ((code > 28) ? "purple" : ((code > 23) ? "red" : ((code > 16) ? "green" : "blue")));
    if (code) {
        x+=1;
//        console.log(col);
        d3.select("#layer3").append("use").attr("x", x*sz).attr("y", y*sz).attr("href", "#lab").attr("class", tag).attr("id", "txt"+tag);
        d3.select("#layer3").append("text").attr("x", x*sz - 2*sz/3).attr("y", y*sz + 1.9*sz/3).attr("class", tag).attr("fill", col).attr("id", "tx"+tag)
        .attr("text-anchor", "center").attr("font-size", sz/3).attr("textLength", sz/3).text(code);
    }
    for (el of d3.selectAll(".changer"))
        el.remove();
    mode = "Floor";
}


function selector(x, y, tag) {
//    console.log(x, y, tag);
    if (tag == "Z") {
        label(x, y, 0);
    }
    if (tag == "U") {
        label(x, y, 31);
    }
    if (tag == "E") {
        res = prompt("Выберите эпический значок [29, 30]", 29);
        if (res == null || (code=parseInt(res)) > 30 || code < 29){
            for (el of d3.selectAll(".changer"))
                el.remove();
            return;
        }
        label(x, y, code);
    }
    if (tag == "P") {
        res = prompt("Выберите значок усиления [24,..., 28]", 24);
        if (res == null || (code=parseInt(res)) > 28 || code < 24){
            for (el of d3.selectAll(".changer"))
                el.remove();
            return;
        }
        label(x, y, code);
    }
    if (tag == "C") {
        res = prompt("Выберите значок способности [17,..., 23]", 17);
        if (res == null || (code=parseInt(res)) > 23 || code < 17){
            for (el of d3.selectAll(".changer"))
                el.remove();
            return;
        }
        label(x, y, code);
    }
    if (tag == "B") {
        res = prompt("Выберите значок характеристики [1,..., 16]", 1);
        if (res == null || (code=parseInt(res)) > 16 || code < 1){
            for (el of d3.selectAll(".changer"))
                el.remove();
            return;
        }
        label(x, y, code);
    }
}


function right_click(event) {
    if (mode == "Floor" || mode == "Change") {
        for (el of d3.selectAll(".changer"))
            el.remove();
        mode = "Change"
        let x = Math.floor(event.x/rsz);
        let y = Math.floor(event.y/rsz);
        if (x==0) {
            x+=1;
        }
        if (x==7) {
            x-=1;
        }
        if (y==0) {
            y+=1;
        }
        if (y==7) {
            y-=1;
        }
        cx = (x+0.5)*sz; cy=(y+0.5)*sz;
        rd = 50*sz/32; ld = 35*sz/32; rm = 16*sz/32;
        d3.select("svg").append("circle").attr("cx", cx).attr("cy", cy).attr("r", rd)
        .attr("class", "changer").attr("fill", "white").attr("stroke", "black").attr("id", "Circle");
        d3.select("svg").append("line").attr("x1", cx-ld).attr("x2", cx+ld).attr("y1", cy-ld).attr("y2", cy+ld)
        .attr("stroke", "black").attr("class", "changer");
        d3.select("svg").append("line").attr("x1", cx+ld).attr("x2", cx-ld).attr("y1", cy-ld).attr("y2", cy+ld)
        .attr("stroke", "black").attr("class", "changer");
        d3.select("svg").append("circle").attr("cx", cx).attr("cy", cy).attr("r", rm)
        .attr("class", "changer U").attr("fill", "white").attr("stroke", "black")
        d3.select("svg").append("use").attr("x", (x+1)*sz).attr("y", y*sz).attr("href", "#U").attr("class", "changer U");
        d3.select("svg").append("use").attr("x", (x)*sz).attr("y", y*sz).attr("href", "#C").attr("class", "changer C");
        d3.select("svg").append("use").attr("x", (x+2)*sz).attr("y", y*sz).attr("href", "#P").attr("class", "changer P");
        d3.select("svg").append("use").attr("x", (x+1)*sz).attr("y", (y -1)*sz).attr("href", "#E").attr("class", "changer E");
        d3.select("svg").append("use").attr("x", (x+1)*sz).attr("y", (y+1)*sz).attr("href", "#B").attr("class", "changer B");
        d3.select("svg").append("rect").attr("x", (x+1)*sz).attr("y", (y -0.5)*sz).attr("width", sz/2).attr("height", sz/2).attr("class", "changer Z");
        x = Math.floor(event.x/rsz);
        y = Math.floor(event.y/rsz);
//        console.log(x, y);
        for (let tg of "UEPCBZ") for (el of document.querySelectorAll("."+tg)) el.addEventListener('click', (event) => {selector(x, y, tg)});
//        for (el of document.querySelectorAll(".U")) el.addEventListener('click', (event) => {selector(x, y, "U")});
//        for (el of document.querySelectorAll(".E")) el.addEventListener('click', (event) => {selector(x, y, "E")});
//        for (el of document.querySelectorAll(".P")) el.addEventListener('click', (event) => {selector(x, y, "P")});
//        for (el of document.querySelectorAll(".C")) el.addEventListener('click', (event) => {selector(x, y, "C")});
//        for (el of document.querySelectorAll(".B")) el.addEventListener('click', (event) => {selector(x, y, "B")});
    }
    else if (mode == "Pins") {
        x = Math.floor(event.x/rsz);
        y = Math.floor(event.y/rsz);
        if (event.x >= 8*sz || event.y >= 8*sz)
            return
        if (matrix[y][x][0])
            return
        matrix[y][x][1] = 1-matrix[y][x][1];
        x1 = (x+1) * sz;
        y1 = (y) * sz;
        if (matrix[y][x][1])
           d3.select("#layer1").append("use").attr("x", x1).attr("y", y1).attr("href", "#bin").attr("id", "P"+x+"x"+y);
        else
           d3.select("#P"+x+"x"+y).remove();
    }
}


function change_mode(event) {
    for (el of d3.selectAll(".changer"))
        el.remove();
    if (mode == "Floor" || mode == "Change"){
        modeB.innerText = "Режим: Расстановка соединений/запретных зон";
        mode = "Pins"}
    else if (mode == "Pins"){
        modeB.innerText = "Режим: Расстановка полов/значков";
        mode = "Floor"}
    }


function move(dx, dy) {
    dx1 = global_move[0];
    dy1 = global_move[1];
    if (0 <= dx1+dx && dx1+dx <= 8-nw && 0 <= dy1+dy && dy1+dy <= 8-nh){
        global_move = [dx+dx1, dy+dy1]
//        console.log(dx, dy);
//        console.log(matrix);
        if (dx)
        {
            st = dx > 0 ? 6: 1;
            nd = dx > 0 ? -1: 8;
            for (y=0; y<8; y++)
                {
                for (x=st; x!=nd; x-=dx) {
//                    console.log(matrix[y][x]);
                    matrix[y][x+dx] = [...matrix[y][x]];
//                    console.log(matrix[y][x+dx]);
                }
                matrix[y][dx > 0 ? 0: 7] = [0, 0, 0, 0];
                }
        }
        if (dy)
        {
            st = dy > 0 ? 6: 1;
            nd = dy > 0 ? -1: 8;
            for (x=0; x<8; x++) {
                for (y=st; y!=nd; y-=dy){
                    matrix[y+dy][x] = [...matrix[y][x]];
                }
                matrix[dy > 0 ? 0: 7][x] = [0, 0, 0, 0];
            }
        }
//        console.log(matrix);
        dx *= sz;
        dy *= sz;
        for (var el of d3.selectAll("use")) {
            //console.log(el, dx, dy);
            el = d3.select("#"+el.id);
            x = parseFloat(el.attr("x"));
            y = parseFloat(el.attr("y"));
            el.attr("x", x+dx);
            el.attr("y", y+dy);
            //console.log(el);
            if (x+dx>sz*8 || y+dy >= sz*8 || x+dx < 1 || y+dy < 0) {
                el.remove();
            }
        }
        for (el of d3.selectAll("text")) {
            el = d3.select("#"+el.id);
            x = parseFloat(el.attr("x"));
            y = parseFloat(el.attr("y"));
            el.attr("x", x+dx);
            el.attr("y", y+dy);
            if (x+dx>=sz*8 || y+dy >= sz*8 || x+dx < 0 || y+dy <0) {
                el.remove();
            }
        }
        mainIm.attr("x", global_move[0]*sz).attr("y", global_move[1]*sz);
    }
}


function next(mass, x, y, d) {
//    console.log(y, x);
    if (matrix[y][x][2]) {
        if (mass[y][x] != -1)
            if (mass[y][x] < d)
                return
        mass[y][x] = d;
        for (mv of [[0, 1], [0, -1], [1, 0], [-1, 0]])
        {
            dx = mv[0]; dy=mv[1];
            if (0 <= x+dx && x+dx < 8 && 0 <= y+dy && y+dy < 8)
                next(mass, x+dx, y+dy, d+50);
        }
    }

}


function sortf(a, b) {
    x0 = a[0]; y0 = a[1];
    x1 = b[0]; y1 = b[1];
    if (x0 == 7 || y0 == 0){
        n0 = x0+y0;
    }
    else
    {
        n0 = 28 - x0 - y0;
    }
    if (x1 == 7 || y1 == 0){
        n1 = x1+y1;
    }
    else
    {
        n1 = 28 - x1 - y1;
    }
    return n0 - n1;
}


function create(x, y) {
    let el = d3.select("svg").append("use").attr("x", (x+1)*sz).attr("y", y*sz).attr("id", "temp"+x+"x"+y).attr("href", "#sel");
    setTimeout(() => {el.remove()}, 150)
    }


function update() {

    start_list.splice(0);

    y = global_move[1];

    for (x=global_move[0]; x<global_move[0]+nw-1; x++)
        if (matrix[y][x][2])
            start_list.push([x, y]);

    x = global_move[0]+nw-1;

    for (y=global_move[1]; y<global_move[1]+nh-1; y++)
        if (matrix[y][x][2])
            start_list.push([x, y]);


    y = global_move[1]+nh-1;

    for (x=global_move[0]+nw-1; x>global_move[0]; x--)
        if (matrix[y][x][2])
            start_list.push([x, y]);

    x = global_move[0];

    for (y=global_move[1]+nh-1; y>global_move[0]; y--)
        if (matrix[y][x][2])
            start_list.push([x, y]);

    if (start_list.length > 0)
    {
        phase %= start_list.length;
        p = start_list[phase++];
//        console.log(p);
        x = p[0]; y = p[1];

        let copy = [];
        for (i=0; i<8; i++)
            copy.push([...delays[i]]);
//        console.log(copy, delays);
        next(copy, x, y, 0);

        for (let y=0; y<8; y++)
            for (let x=0; x<8; x++)
                if (copy[y][x] >= 0)
                    setTimeout(() => {create(x, y)}, copy[y][x])


    }
    setTimeout(update, 1500)
}


function New() {
    loader.accept = '.png';
    loader.onchange = function (event) {
        const files = event.target.files;
        if (files.length > 0) {
            Clear();
            const file = files[0];
//            console.log(file);
            filename = file.name;

            if ((res = localStorage.getItem(filename)) == null){
                reader.onload = function(event) {
//                    console.log(reader);
                    res = event.target.result;
                    size = SizeFromPng(res);
                    StartPlaces();
                    localStorage.setItem(filename, res);
                    w = size.w; h=size.h;
                    mainIm.attr("width", w*k).attr("height", h*k).attr("href", res).attr("x", 0).attr("y", 0);
                    mode = "Floor";
                    modeB.innerText = "Режим: Расстановка полов/значков";
                    global_move = (0, 0);
                }
                reader.readAsDataURL(file);
            }
            else {
                size = SizeFromPng(res);
                StartPlaces();
                w = size.w; h=size.h;
                mainIm.attr("width", w*k).attr("height", h*k).attr("href", res).attr("x", 0).attr("y", 0);
                mode = "Floor";
                modeB.innerText = "Режим: Расстановка полов/значков";
                global_move = [0, 0];
                }

            for (x=0; x<8; x++)
                for (y=0; y<8; y++)
                    matrix[y][x] = [0, 0, 0, 0];
            }
        }
    loader.click();
}


function Load() {
    let event = {x:0, y:0};
    loader.accept = '.txt';
    loader.onchange =  function (event) {
        const files = event.target.files;
        if (files.length > 0) {
            Clear();
            StartPlaces();
            const file = files[0];
            reader.onload = function(event) {
//                console.log(event.target.result)
                let res = new Uint8Array(event.target.result);
//                console.log(res);
                ln = res.byteLength;

                filename = [];
                let flag = 0;
                let x=0;let y=0;
                for (i=0;i<ln; i++){
                    c = res[i];
                    if (flag == 0)
                        if (c!=10)
                            filename.push(c);
                        else
                            flag = 1;
                    else if (flag == 1)
                        {
                        filename = String.fromCharCode(...filename);
                        dy = c % 16;
                        dx = (c - dy) >> 4;
                        global_move = [dx, dy];
                        flag = 2;
                        nw=8;nh=8;
//                        console.log(global_move);
                        }
                    else
                    {
                        c -= (f1 = (c >= 128)) * 128;
                        c -= (f2 = (c >= 64)) * 64;
                        c -= (f3 = (c >= 32)) * 32;
                        matrix[y][x] = [0, 0, 0, 0];
                        event.x = (x)*sz;
                        event.y = (y)*sz;
                        if (f3){mode="Floor"; click(event)}
                        if (f2 && !f1){mode="Pins";right_click(event)}
                        if (f2 && f1){mode="Pins";click(event)}
                        if (0 < c && c < 33) label(x, y, c);
                        if (++x>7) {
                            x = 0; y++;
                        }
                    }
                }
                if ((res = localStorage.getItem(filename.split('/').pop())) == null){
                    alert("Невозможно открыть данное сохранение. Пожалуйста загрузите файл " + filename + '\nЭто можно сделать открыв его через кнопку Новое или через настройки.')
                    return;
                }
                size = SizeFromPng(res);
                w = size.w; h=size.h;
                mainIm.attr("width", w*k).attr("height", h*k).attr("href", res).attr("x", global_move[0]*sz).attr("y", global_move[1]*sz);
                mode = "Floor";
                modeB.innerText = "Режим: Расстановка полов/значков";

            }
            reader.readAsArrayBuffer(file);
            }
    }
    loader.click();
}


function Save() {
    data = Array.from(filename.split("/").pop()+'\n', (c) => c.charCodeAt(0))
    data.push((global_move[0])*16+(global_move[1]));
    for (line of matrix)
        for (el of line){
            f1 = parseInt(el[0]);
            f2 = parseInt(el[1]);
            f3 = parseInt(el[2]);
            lb = parseInt(el[3]);

            string = (f1*128+f2*64+f3*32+lb)
            data.push(string);
        }
//    console.log(data);
    data = new Uint8Array(data);
//    console.log(data);
    var file = new Blob([data], {type: "application/octet-stream"});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, "save.txt");
    else { // Others
        var url = URL.createObjectURL(file);
        downloader.href = url;
        downloader.download = "save.txt";
        downloader.click();
        setTimeout(function() {
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}


function click_translator(event){
    if (!event.buttons & event.type != 'click') return;
    if (event.buttons == 1) click(event);
    if (event.buttons == 2) right_click(event);
}


function motion_translator(event){
    x = Math.floor(event.x / rsz);
    y = Math.floor(event.y / rsz);
    if (last[0] != x || last[1] != y){; click_translator(event);
    }
    last = [x, y];
}


function key_translator(event) {
//    console.log(event);
    switch (event.code) {
        case "ArrowDown": {move(0, 1);break;}
        case "ArrowUp": {move(0, -1);break;}
        case "ArrowLeft": {move(-1, 0);break;}
        case "ArrowRight": {move(1, 0);break;}
        case "Tab": {change_mode();break;}
        case "KeyS": {if (event.ctrlKey) {event.preventDefault(); Save()}; break;}
        case "KeyL": {if (event.ctrlKey) {event.preventDefault(); Load()}; break;}
        case "KeyO": {if (event.ctrlKey) {event.preventDefault(); New()}; break;}
        default:
            console.log(event);
    }
}


function Resize(event) {
    canvas = document.getElementById("canvas").getBoundingClientRect();
    k0 = Math.min(canvas.width/256, canvas.height/256);
    rsz = 32*k0;
}


function Settings(event) {
    document.getElementById("SettingLayer").hidden = !document.getElementById("SettingLayer").hidden;
}

function LoadTexture(id_el) {
    loader.accept = '.png';
    loader.onchange =  function (event) {
        const files = event.target.files;
        if (files.length > 0) {
            const file = files[0];
            reader.onload = function(event) {
            res = event.target.result;
            d3.select(id_el).attr("href", res);
            localStorage.setItem("floorIm", res);
            }
            reader.readAsDataURL(file);
        }

        }

    loader.click();
}


document.getElementById("new").addEventListener("click", New);
document.getElementById("load").addEventListener("click", Load);
document.getElementById("save").addEventListener("click", Save);

document.getElementById("mode").addEventListener("click", change_mode);

document.getElementById("settings").addEventListener("click", Settings);

document.getElementById("LoadFloor").addEventListener("click", ()=>{LoadTexture("#floor")});
document.getElementById("ClearFloor").addEventListener("click", ()=>{localStorage.setItem("floorIm", data="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAkUlEQVR4nO2UMQ7AIAwDTdXH+kl5LEOXQhGkVYcIGJwxOJKFrUskMxbO2S/MzNtnkuEaADj+mHJ2UZrHwO0YXiRlF62pBsp3ecfdUbgmkcxm1n7NkJOTZ4iGZN6nA6tmMNBm9VaoKE01UB76osApVLQm9a4EIoEIAtHkEYgEIoFIIBKIBKL9SvgFkGgN4EQwey7ZGKxapp/qnQAAAABJRU5ErkJggg==");d3.select("#floor").attr("href", data);});


document.getElementById("up").addEventListener("click", (event) => {move(0, -1)});
document.getElementById("down").addEventListener("click", (event) => {move(0, 1)});
document.getElementById("left").addEventListener("click", (event) => {move(-1, 0)});
document.getElementById("right").addEventListener("click", (event) => {move(1, 0)});

document.body.addEventListener("keydown", key_translator);
update();

window.addEventListener("resize", Resize);
document.getElementById("canvas").addEventListener("mousedown", click_translator);
document.getElementById("canvas").addEventListener("mousemove", motion_translator);
document.getElementById("canvas").addEventListener("contextmenu", (event)=>{event.preventDefault();});