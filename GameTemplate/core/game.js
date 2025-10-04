import { loadAssets, assets } from "./asset_loader.js";
import { Enemy } from "../entities/Enemy.js";
import { Physics } from "./Physics.js";
import { PlayerFactory } from "../entities/PlayerFactory.js";

export class Game {
    constructor(mode = "topdown") {
        this.mode = mode;
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        // rozmiar canvasa
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        // granice
        this.right = this.width;
        this.bottom = this.height;
        this.lastTime = 0;
        this.objects = [];
        this.keys = {};
        this.rect = this.canvas.getBoundingClientRect();

        // obsługa klawiszy
        window.addEventListener("keydown", e => this.keys[e.key] = true);
        window.addEventListener("keyup", e => this.keys[e.key] = false);
        // Ładujemy zasoby przed startem gry
        loadAssets(() => {
            this.player = PlayerFactory.create(
                this.mode,
                assets.platform,
                10,
                100,
                100,
                50
            );

            this.objects.push(new Enemy(null, 200, 0, 50, 50));
            this.objects.push(new Enemy(null, 500, 700, 50, 50));
            requestAnimationFrame(this.gameLoop.bind(this));
        });
    }
    checkCollisions() {
        this.objects.forEach(obj => {
            if (Physics.rectRect(this.player, obj)) {
                /*this.player.colission(obj);
                obj.colission(this.player);*/
                if (obj.constructor.name === "Enemy") //sciana!
                    this.player.resolveCollision(obj)
                else {
                    // np this.player.hp -= 10; jak wpadl na przeciwnika ktory go krzywdzi
                    // console.log("Gracz oberwał! HP:", this.player.hp)
                } //cos innego
            }
        });
    }




    // === Game loop ===
    gameLoop(timeStamp) {
        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // aktualizuj i rysuj wszystkie obiekty
        this.player.update(deltaTime, this.keys, this.canvas);
        this.objects.forEach((obj) => {
            obj.update(deltaTime, this.keys, this.canvas);
        });
        this.checkCollisions();
        this.player.draw(this.ctx)
        this.objects.forEach(obj => obj.draw(this.ctx));
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}


