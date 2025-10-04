import { loadAssets, assets } from "./asset_loader.js";
import { Enemy } from "../entities/Enemy.js";
import { Physics } from "./Physics.js";
import { PlayerFactory } from "../entities/PlayerFactory.js";
import { Platform } from "../entities/Platform.js";

export class Game {
    constructor(mode = "topdown") {
        this.mode = mode;
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.hudHeight = 50;


        // Świat gry — większy niż ekran
        this.worldWidth = 3000;
        this.worldHeight = 800;

        // Ustal proporcje canvas
        const aspectRatio = 16 / 9;
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.9;

        if (maxWidth / maxHeight > aspectRatio) {
            this.canvas.height = maxHeight;
            this.canvas.width = maxHeight * aspectRatio;
        } else {
            this.canvas.width = maxWidth;
            this.canvas.height = maxWidth / aspectRatio;
        }

        this.ctx.imageSmoothingEnabled = false;
        this.camera = {
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height,
            margin: 300,
            verticalOffset: 2,
            center: {
                x: this.canvas.width / 2,
                y: this.canvas.height / 2
            }
        };
        // granice
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.right = this.width;
        this.bottom = this.height;
        this.center = {
            x: this.width / 2,
            y: this.height / 2
        };
        this.lastTime = 0;
        this.keys = {};
        this.objects = [];
        this.rect = this.canvas.getBoundingClientRect();

        // context — przekazywany do gracza, wrogów, itp.
        this.context = {
            canvas: this.canvas,
            ctx: this.ctx,
            keys: this.keys,
            hudHeight: this.hudHeight,
            width: this.width,
            height: this.height,
            camera: this.camera,
            rect: this.rect,
            worldWidth: this.worldWidth,
            worldHeight: this.worldHeight,
            game: this
        };

        // obsługa klawiszy
        window.addEventListener("keydown", e => this.keys[e.key] = true);
        window.addEventListener("keyup", e => this.keys[e.key] = false);

        // reakcja na resize
        window.addEventListener("resize", () => this.resizeCanvas());

        // ładowanie zasobów
        loadAssets(() => {
            this.reset();
            requestAnimationFrame(this.gameLoop.bind(this));
        });
    }

    resizeCanvas() {
        const aspectRatio = 16 / 9;
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.9;

        if (maxWidth / maxHeight > aspectRatio) {
            this.canvas.height = maxHeight;
            this.canvas.width = maxHeight * aspectRatio;
        } else {
            this.canvas.width = maxWidth;
            this.canvas.height = maxWidth / aspectRatio;
        }

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.right = this.width;
        this.bottom = this.height;
    }

    reset() {
        this.lives = 3;
        this.gameState = "playing";
        this.objects = []; // WAŻNE — reset listy!

        // gracz
        this.player = PlayerFactory.create(this.mode, null, 50, 500, 50, 50);

        // platformy
        this.objects.push(new Platform(assets.platform, 0, 800 - 40, this.worldWidth, 40));     // ziemia
        this.objects.push(new Platform(assets.platform, 600, 650, 300, 40));
        this.objects.push(new Platform(assets.platform, 1100, 600, 300, 40));
        this.objects.push(new Platform(assets.platform, 1500, 500, 300, 40));
        this.objects.push(new Platform(assets.platform, 1700, 550, 400, 40));
        this.objects.push(new Platform(assets.platform, 1700, 400, 400, 40));
        this.objects.push(new Platform(assets.platform, 1600, 550, 400, 40));
        this.objects.push(new Platform(assets.platform, 1800, 550, 400, 40));
        this.objects.push(new Platform(assets.platform, 2400, 500, 400, 40));
        this.objects.push(new Platform(assets.platform, 2000, 300, 400, 40));
    }

    updateCamera() {
        const halfWidth = this.canvas.width / 2;
        const halfHeight = this.canvas.height / 2;
        // śledzenie gracza (z lekkim offsetem pionowym)

        this.camera.x = this.player.center.x - this.center.x;
        this.camera.y = this.player.center.y - this.center.y / 2; // offset  pionie

        // ograniczenia
        if (this.camera.x < 0) this.camera.x = 0;
        if (this.camera.y < 0) this.camera.y = 0;
        if (this.camera.x > this.worldWidth - this.canvas.width)
            this.camera.x = this.worldWidth - this.canvas.width;
        if (this.camera.y > this.worldHeight - this.canvas.height)
            this.camera.y = this.worldHeight - this.canvas.height;
    }

    checkCollisions() {
        this.player.onGround = false; // <— KLUCZ: zakładamy, że wisi
        this.objects.forEach(obj => {
            if (Physics.rectRect(this.player, obj)) {
                if (obj.constructor.name === "Platform") {
                    this.player.resolveCollision(obj);
                }
            }
        });
    }

    drawHUD() {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, this.canvas.width, this.hudHeight);

        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`Życia: ${this.lives}`, 20, 30);
        ctx.textAlign = "right";
        ctx.fillText(`camera.x: ${this.camera.x}`, 280, 30);
        ctx.fillText(`player.x: ${this.player.x}`, 680, 30);
        ctx.fillText(`Pozycja X: ${Math.floor(this.player.x)}`, this.canvas.width - 30, 30);
        ctx.restore();
    }

    gameLoop(timeStamp) {
        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;
        const MAX_DT = 50;
        const dt = Math.min(deltaTime, MAX_DT) / 1000;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.gameState === "playing") {
            this.player.update(dt, this.context);
            this.objects.forEach(o => o.update(dt, this.context));
            this.checkCollisions();
            this.updateCamera();

            // rysowanie z przesunięciem kamery
            this.objects.forEach(o => o.draw(this.ctx, this.camera));
            this.player.draw(this.ctx, this.camera);

            // HUD
            this.drawHUD();

            // warunek przegranej
            if (this.player.y > this.worldHeight) {
                this.lives--;
                if (this.lives <= 0) {
                    this.gameState = "gameover";
                } else {
                    this.player.x = 50;
                    this.player.y = 500;
                    this.player.velocity.y = 0;
                }
            }

            // warunek wygranej (do testu)
            if (this.player.x > 2900) {
                this.gameState = "win";
            }
        } else {
            // ekrany końcowe
            this.ctx.fillStyle = "black";
            this.ctx.font = "30px Arial";
            this.ctx.textAlign = "center";

            if (this.gameState === "gameover") {
                this.ctx.fillText("GAME OVER - Naciśnij R aby zrestartować", this.canvas.width / 2, this.canvas.height / 2);
            } else if (this.gameState === "win") {
                this.ctx.fillText("YOU WIN! - Naciśnij R aby zagrać ponownie", this.canvas.width / 2, this.canvas.height / 2);
            }

            if (this.keys["r"] || this.keys["R"]) {
                this.reset();
                this.gameState = "playing";
            }
        }

        requestAnimationFrame(this.gameLoop.bind(this));
    }
}
