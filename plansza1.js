class Platform {
    constructor(name, x, y, width, height) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.xr = this.x + this.width;
    }
}

function searchPlatforms(minX, maxX) {
    const t = platforms_sort.filter(function (platforms) {
        // console.log(platform);
        return (platforms.x >= minX && platforms.x <= maxX) || ((platforms.xr > minX) && (platforms.x < maxX));
    });
    return t;
}

function show() {
    cont.innerHTML = `<p>step : ${step} \t    screenX: ${screenX}  \t  screenWidth: ${screenWidth}<\p>`;
    const sp = searchPlatforms(screenX, screenWidth);
    for (const element of sp) {
        cont.innerHTML += "<p>" + element.name + "  x: " + element.x + " xr: " + element.xr + "<\p>";
    }
}
const platforms = [];
let step = 10;
let screenX = 0;
let screenY = 0;
let screenWidth = 500;
let screenHeight = 300;

platforms.push(new Platform("JAkis", 0, 30, 80, 50));
platforms.push(new Platform("pierwszy", 197, 70, 80, 50));
platforms.push(new Platform("drugi", 483, 150, 50, 50));
platforms.push(new Platform("trzeci", 577, 190, 40, 50));
platforms.push(new Platform("czwarty", 626, 240, 56, 50));
//console.log(platforms);

const platforms_sort = platforms.toSorted(function (p1, p2) {

    return p1.x - p2.x;
})

//console.log("Po sorcie: ");
console.log(platforms_sort);

const sp = searchPlatforms(screenX, screenWidth);
console.log(sp);
const cont = document.querySelector(".container");
const p = document.querySelector("#prev");
const n = document.querySelector("#next");

n.addEventListener("click", function (e) {
    // console.log("next");
    screenX += step;
    screenWidth += step;
    show();
});

p.addEventListener("click", function (e) {
    // console.log("prev");
    if (screenX > 0) {
        screenX -= step;
        screenWidth -= step;
        show();
    }
});
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 300;

window.addEventListener("resize", function () {
    canvas.width = 500;
    canvas.height = 300;
    ctx.fillStyle = "blue";
    ctx.strokeStyle = "red";
    ctx.lineWidth = 5; //grubsc lini
    ctx.beginPath() //poczatek rysowania
    ctx.arc(100, 100, 50, 0, Math.PI * 2); //koło o promieniu 50
    ctx.stroke(); //obrys
    ctx.fill(); //wypelnienie

})

const mouse = {
    x: undefined,
    y: undefined
}

canvas.addEventListener("click", function (event) { //ustawiamy globalnie pozycje myszy

    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
});
// setInterval(() => {
//     screenX += step;
//     screenWidth += step;
// }, 20);
canvas, addEventListener("mousemove", function (event) {

    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
})
function draw() {
    ctx.fillStyle = "blue";

    // ctx.lineWidth = 15; //grubsc lini
    ctx.beginPath() //poczatek rysowania

    for (const pl of platforms_sort) {
        ctx.fillStyle = "blue";
        ctx.fillRect(pl.x - screenX, pl.y, pl.width, pl.height);
        ctx.strokeStyle = "red";
        ctx.strokeText(pl.name, pl.x - screenX, pl.y);   // wypełniony tekst
    }
    ctx.fillStyle = "Yellow";
    ctx.strokeText(`x:${mouse.x}, y: ${mouse.y}`, mouse.x, mouse.y - 50);
    ctx.stroke(); //obrys
    ctx.fill(); //wypelnienie
    //console.log(mouse.y);
}

+function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
    requestAnimationFrame(animate);
}()


