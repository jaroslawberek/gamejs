import { loadAssets, assets } from "./asset_loader.js";
import { Enemy } from "../entities/Enemy.js";
import { Physics } from "./Physics.js";
import { PlayerFactory } from "../entities/PlayerFactory.js";
import { Platform } from "../entities/Platform.js";

export class Game {
    constructor(mode = "topdown", worldWidth = 3000, worldHeight = 3000) {
        this.mode = mode;
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.hudHeight = 50;


        // Świat gry — większy niż ekran
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;

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
        const g = this;
        g.objects = []; // wyczyść poprzednie obiekty

        g.lives = 3;
        g.gameState = "playing";

        // === Platformer mode ===
        if (g.mode === "platformer") {
            g.worldWidth = 3000;
            g.worldHeight = 1200;

            // Gracz startuje trochę nad ziemią
            g.player = PlayerFactory.create(g.mode, assets.player, 100, g.worldHeight - 150, 64, 64);

            // === PLATFORMY ===
            g.objects.push(
                // ziemia — ciągnie się przez cały świat
                new Platform(assets.platform, 0, g.worldHeight - 50, g.worldWidth, 50),

                // kilka wyżej położonych
                new Platform(assets.platform, 300, g.worldHeight - 250, 200, 40),
                new Platform(assets.platform, 700, g.worldHeight - 400, 250, 40),
                new Platform(assets.platform, 1000, g.worldHeight - 600, 200, 40),
                new Platform(assets.platform, 1100, g.worldHeight - 800, 200, 40),
                new Platform(assets.platform, 1200, g.worldHeight - 900, 200, 40),
                new Platform(assets.platform, 2000, g.worldHeight - 300, 300, 40)
            );


            // Przeciwnicy (opcjonalnie)rr
            g.objects.push(new Enemy(null, 900, g.worldHeight - 100, 50, 50, 900, 200));
            g.objects.push(new Enemy(null, 400, g.worldHeight - 400, 50, 50, 900, 200));
            g.objects.push(new Enemy(null, 400, g.worldHeight - 370, 50, 50, 900, 300));
            g.objects.push(new Enemy(null, 800, 350, 50, 50, 450, 500));
            // Ustaw kamerę na dole świata (widok na ziemię)
            g.camera.y = g.worldHeight - g.canvas.height;

        }
        // === Top-down mode ===
        else if (g.mode === "topdown") {
            g.worldWidth = 2000;
            g.worldHeight = 2000;

            const offsetY = g.hudHeight; // przesunięcie świata pod HUD

            // Gracz na środku świata (z uwzględnieniem HUD)
            g.player = PlayerFactory.create(
                g.mode,
                null,
                g.worldWidth / 2 - 25,
                g.worldHeight / 2 - 25 + offsetY,
                50,
                50
            );

            const wallThickness = 40;

            g.objects.push(
                // górna ściana tuż pod HUD-em
                new Platform(assets.platform, 0, offsetY, g.worldWidth, wallThickness),

                // dolna ściana
                new Platform(
                    assets.platform,
                    0,
                    g.worldHeight - wallThickness,
                    g.worldWidth,
                    wallThickness
                ),

                // lewa ściana
                new Platform(assets.platform, 0, offsetY + wallThickness, wallThickness, g.worldHeight - wallThickness),

                // prawa ściana
                new Platform(
                    assets.platform,
                    g.worldWidth - wallThickness,
                    offsetY + wallThickness,
                    wallThickness,
                    g.worldHeight - offsetY - wallThickness
                )
            );

            // Kamera patrzy na środek świata
            g.camera.x = g.worldWidth / 2 - g.canvas.width / 2;
            g.camera.y = offsetY; // zaczynamy widok tuż pod HUD-em
        }

    }


    updateCamera() {
        const { player, camera, canvas, worldWidth, worldHeight, mode } = this;

        // 🟦 Tryb PLATFORMOWY — kamera trzyma gracza na środku X, ale z lekkim offsetem Y (żeby było widać „przód”)
        if (mode === "platformer") {
            this.camera.x = this.player.center.x - this.center.x;
            this.camera.y = this.player.center.y - this.center.y / 2; // offset  pionie

            // ograniczenia w poziomie
            if (camera.x < 0) camera.x = 0;
            if (camera.x > worldWidth - canvas.width)
                camera.x = worldWidth - canvas.width;

            // ograniczenia w pionie
            if (camera.y < 0) camera.y = 0;
            if (camera.y > worldHeight - canvas.height)
                camera.y = worldHeight - canvas.height;
        }

        // 🟥 Tryb TOP-DOWN — kamera zawsze trzyma gracza na środku (pełne śledzenie)
        else if (mode === "topdown") {
            camera.x = player.center.x - this.center.x;
            camera.y = player.center.y - this.center.y;

            if (camera.x < 0) camera.x = 0;
            if (camera.y < 0) camera.y = 0;
            if (camera.x > worldWidth - canvas.width)
                camera.x = worldWidth - canvas.width;
            if (camera.y > worldHeight - canvas.height)
                camera.y = worldHeight - canvas.height;
        }
    }


    checkCollisions() {
        this.objects.forEach(obj => {
            // 🔹 kolizje Playera
            if (Physics.rectRect(this.player, obj)) {
                if (obj.constructor.name === "Platform") {
                    this.player.resolveCollision(obj);
                } else if (obj.constructor.name === "Enemy") {
                    this.player.resolveCollision(obj);
                    this.gameState = "gameover";
                }
            }

            // 🔹 kolizje Enemy z platformami
            if (obj.constructor.name === "Enemy") {
                this.objects.forEach(other => {
                    if (obj === other) return; // pomiń samego siebie

                    // 🔸 Enemy vs Platform
                    if (other.constructor.name === "Platform") {
                        if (Physics.rectRect(obj, other)) {
                            obj.resolveCollision(other);
                        }
                    }

                    // 🔸 Enemy vs Enemy
                    else if (other.constructor.name === "Enemy") {
                        if (Physics.rectRect(obj, other)) {
                            // tylko jeśli naprawdę się dotknęli
                            obj.direction *= -1;
                            other.direction *= -1;
                            other.velocity.y = -900;
                            obj.velocity.y = -900;

                            // cofnięcie minimalne, żeby się „odsunęli” po kolizji
                            const overlapX = Math.min(obj.right - other.x, other.right - obj.x);
                            if (obj.center.x < other.center.x) {
                                obj.x -= overlapX / 2;
                                other.x += overlapX / 2;
                            } else {
                                obj.x += overlapX / 2;
                                other.x -= overlapX / 2;
                            }
                            obj.recalculate();
                            other.recalculate();
                        }
                    }
                });
            }
        });
    }


    drawHUD() {
        const ctx = this.ctx;
        const grad = ctx.createLinearGradient(0, 0, 0, this.hudHeight);
        grad.addColorStop(0, "rgba(0, 0, 0, 1)");
        grad.addColorStop(1, "rgba(0, 0, 0, 1)");

        ctx.save();
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.canvas.width, this.hudHeight);

        // 🔹 cień pod HUD
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 10;
        ctx.fillRect(0, this.hudHeight - 3, this.canvas.width, 5);

        // 🔹 tekst
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`Życia: ${this.lives}`, 20, 30);
        ctx.fillText(`Czas: ${Math.floor(performance.now() / 1000)} s`, 150, 30);
        ctx.textAlign = "right";
        ctx.fillText(`Gra: Super Demo`, this.canvas.width - 180, 30);
        ctx.fillText(`Canvas: ${this.canvas.width}×${this.canvas.height}`, this.canvas.width - 20, 30);

        ctx.restore();
    }

    drawDebug(dt) {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = "14px monospace";
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.textAlign = "left";

        const fps = (1 / dt).toFixed(1);
        const baseY = this.hudHeight + 20;
        let y = baseY;

        // 🔹 FPS i czas klatki
        ctx.fillText(`FPS: ${fps}`, 20, y); y += 18;
        ctx.fillText(`Delta: ${(dt * 1000).toFixed(2)} ms`, 20, y); y += 18;

        // 🔹 Player
        ctx.fillText(`Player.x: ${this.player.x.toFixed(1)} | y: ${this.player.y.toFixed(1)}`, 20, y); y += 18;
        ctx.fillText(`Vel.x: ${this.player.velocity?.x?.toFixed(1) || 0} | Vel.y: ${this.player.velocity?.y?.toFixed(1) || 0}`, 20, y); y += 18;
        ctx.fillText(`Center: ${this.player.center.x.toFixed(1)}, ${this.player.center.y.toFixed(1)}`, 20, y); y += 18;
        ctx.fillText(`OnGround: ${this.player.onGround ? "✅" : "❌"}`, 20, y); y += 22;

        // 🔹 Kamera
        ctx.fillText(`Camera.x: ${this.camera.x.toFixed(1)} | y: ${this.camera.y.toFixed(1)}`, 20, y); y += 18;
        ctx.fillText(`Cam.center: ${this.camera.center?.x?.toFixed(1) || 0}, ${this.camera.center?.y?.toFixed(1) || 0}`, 20, y); y += 18;
        ctx.fillText(`Cam.margin: ${this.camera.margin || 0}`, 20, y); y += 22;

        // 🔹 Wymiary świata
        ctx.fillText(`World: ${this.worldWidth}×${this.worldHeight}`, 20, y); y += 18;
        ctx.fillText(`Visible: ${this.canvas.width}×${this.canvas.height}`, 20, y);

        // 🔹 Obrys kamery
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 1;
        ctx.strokeRect(0, this.hudHeight, this.canvas.width, this.canvas.height - this.hudHeight);

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
            this.drawDebug(dt);
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
