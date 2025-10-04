import { loadAssets, assets } from "./GameTemplate/core/asset_loader.js";
/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
let grafity = .5;
console.log(ctx);


/**
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
 */

class Player {
    constructor({ x, y, w, h }) {
        this.position = {
            x,
            y,

        }
        this.width = w;
        this.height = h;
        this.velocity = {   //predkosci w osiach
            x: 0,
            y: 0,
        }
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += grafity;
        }
        else {

            this.velocity.y = 0;
            // this.position.y = canvas.height - this.height;
        }

    }

    draw() {
        ctx.fillStyle = "#721212ff"
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

}




class Platform {
    constructor(x, y, w, h) {
        this.position = {
            x,
            y,

        };
        this.width = w;
        this.height = h;
    }
    update() {

    }
    draw() {
        ctx.drawImage(assets.platform, this.position.x, this.position.y, this.width, this.height);
    }
    ad
}
const player = new Player({ x: 10, y: 550, w: 30, h: 30 });
const platform = new Platform(300, 480, 300, 40);
let platforms = [];
console.log(player);
const Keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    },
    up: {
        pressed: false,
    }
}


addEventListener("mousemove", () => {

});
addEventListener("keydown", ({ code }) => {
    switch (code) {
        case 'KeyA':
            console.log("Lewa");
            Keys.left.pressed = true;
            break;
        case 'KeyD':
            console.log("Prawa");
            Keys.right.pressed = true;
            break;
        case 'KeyW':
            console.log("Skok");
            if (player.velocity.y == 0)
                player.velocity.y = -15;
            break;
        case 'KeyS':
            console.log("Dół");
            break;
    }
});
addEventListener("keyup", ({ code }) => {
    switch (code) {
        case 'KeyA':
            console.log("Lewa");
            Keys.left.pressed = false;
            break;
        case 'KeyD':
            console.log("Prawa");
            Keys.right.pressed = false;
            break;
        case 'KeyW':
            console.log("Skok");
            player.velocity.y = 0;
            break;
        case 'KeyS':
            console.log("Dół");
            break;

    }
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.update();
    platform.draw();
    if (Keys.right.pressed) {
        player.velocity.x = 5;
    } else if (Keys.left.pressed) {
        player.velocity.x = -5;
    }
    else player.velocity.x = 0;

    if (
        player.velocity.y >= 0 && // gracz spada
        player.position.y + player.height <= platform.position.y && // był nad platformą
        player.position.y + player.height + player.velocity.y >= platform.position.y && // w tej klatce przeciął linię platformy
        player.position.x + player.width > platform.position.x && // prawa krawędź gracza > lewa krawędź platformy
        player.position.x < platform.position.x + platform.width  // lewa krawędź gracza < prawa krawędź platformy
    ) {
        player.velocity.y = 0;
        player.position.y = platform.position.y - player.height; // ustaw dokładnie na platformie
    }
    if (
        player.velocity.y < 0 && // gracz leci w górę
        player.position.y >= platform.position.y + platform.height && // był pod platformą
        player.position.y + player.velocity.y <= platform.position.y + platform.height && // przeciął dolną krawędź platformy
        player.position.x + player.width > platform.position.x &&
        player.position.x < platform.position.x + platform.width
    ) {
        player.velocity.y = 0; // zatrzymuje ruch w górę
        player.position.y = platform.position.y + platform.height; // ustaw pod platformą
    }
    requestAnimationFrame(animate);
};

loadAssets(() => {
    console.log("Wszystkie zasoby gotowe ✅");
    console.log(assets);
    const player = new Player({ x: 10, y: 550, w: 30, h: 30 });
    const platform = new Platform(300, 480, 300, 40);
    animate();
});
