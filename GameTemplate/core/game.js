import { loadAssets, assets } from "./asset_loader.js";
import { Enemy } from "../entities/Enemy.js";
import { Physics } from "./Physics.js";
import { PlayerFactory } from "../entities/PlayerFactory.js";
import { Platform } from "../entities/Platform.js";

export class Game {
    /**
     * Construktor gry (Game)
     * @param {*} mode 
     * @param {*} worldWidth 
     * @param {*} worldHeight 
     */
    constructor(mode = "topdown", worldWidth = 10000, worldHeight = 3000) {
        this.showDebug = true;
        this.mode = mode;
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.aspectRatio = 16 / 9;
        // Świat gry — większy niż ekran
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        // granice
        this.Recalculate();
        //Ustawienie odpowiednich proporcji ekranu
        this.SetCanavasProportion(this.aspectRatio);
        //wysokosc gornego okna informacyjnego TODO: Utworzyć obiekt
        this.hudHeight = 50;
        this.ctx.imageSmoothingEnabled = false; //?
        //Obiekty, klawisze, myszka, tła, czas
        this.lastTime = 0;
        this.keys = {};
        this.mouse = {};
        this.objects = [];
        this.backgroundLayers = [];

        //TODO: Utworzyć obiekt Camera
        this.camera = {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height,
            margin: 300,
            center: {
                x: this.width / 2,
                y: this.height / 2
            }
        };

        // context — przekazywany do gracza, wrogów, itp.
        this.context = {
            canvas: this.canvas,
            ctx: this.ctx,
            keys: this.keys,
            mouse: this.mouse,
            hudHeight: this.hudHeight,
            width: this.width,
            height: this.height,
            camera: this.camera,
            worldWidth: this.worldWidth,
            worldHeight: this.worldHeight,
            game: this
        };

        this.connectEvents();           // Podlączenie zdarzeń w grze    
        this.LoadResources();           // Ładowanie zasobów
    }

    /**
    * Ładuje zasoby do gry takie jak obrazy, animacje i dzwieki
    * oraz rozpoczyna głóną pętle gry
    */
    LoadResources() {
        loadAssets(() => {
            //TODO: Utworzyć obiekt backround
            this.loadBackground();
            this.reset();
            //startuje główna pętla gry
            requestAnimationFrame(this.gameLoop.bind(this));
        });
    }

    /**
    * Podłączenie zdarzeń
    * 
    */
    connectEvents() {
        window.addEventListener("keydown", e => this.keys[e.key] = true);
        window.addEventListener("keyup", e => this.keys[e.key] = false);
        // reakcja na resize
        window.addEventListener("resize", () => this.resizeCanvas());
    }

    /**
     * Przelicza wielkosci swiata gry
     * 
     */
    Recalculate() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.right = this.width;
        this.bottom = this.height;
        this.center = {
            x: this.width / 2,
            y: this.height / 2
        };
    }

    /**
     * Ustal proporcje canvas
     * @param {*} aspectRatio 
     */
    SetCanavasProportion(aspectRatio) {
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.9;

        if (maxWidth / maxHeight > aspectRatio) {
            this.canvas.height = maxHeight;
            this.canvas.width = maxHeight * aspectRatio;
        } else {
            this.canvas.width = maxWidth;
            this.canvas.height = maxWidth / aspectRatio;
        }
        this.Recalculate();
    }

    /**
    * Ładuje obrazu backgraundu
    *  
    */
    loadBackground() {
        this.backgroundLayers = [
            { img: assets.bg_far, speed: 0.2 },   // daleka warstwa – powolna
            { img: assets.bg_mid, speed: 0.9 }    // bliższa – szybsza
        ];
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

        this.Recalculate();
    }

    /**
    * Ustawia stan poczatkowy obiektow gry na start. 
    * Wywoływane na początku oraz przy resecie gry
    *  
    */
    reset() {
        const game = this;
        game.objects = []; // wyczyść poprzednie obiekty
        game.lives = 3;
        game.gameState = "playing";

        // === Platformer mode ===
        if (game.mode === "platformer") {
            game.worldWidth = 10000;
            game.worldHeight = 1200;

            game.player = PlayerFactory.create(game.mode, assets.player, 0, game.worldHeight - 80, 64, 64, 1.5);

            // === PLATFORMY ===
            game.objects.push(
                // ziemia — ciągnie się przez cały świat
                new Platform(assets.platform, 0, game.worldHeight - 50, game.worldWidth, 50),
                // kilka wyżej położonych
                new Platform(assets.platform, 300, game.worldHeight - 250, 200, 40),
                new Platform(assets.platform, 700, game.worldHeight - 400, 250, 40),
                new Platform(assets.platform, 1000, game.worldHeight - 600, 200, 40),
                new Platform(assets.platform, 1100, game.worldHeight - 800, 200, 40),
                new Platform(assets.platform, 1200, game.worldHeight - 900, 200, 40),
                new Platform(assets.platform, 2000, game.worldHeight - 300, 300, 40)
            );

            // Przeciwnicy
            game.objects.push(new Enemy(null, 900, game.worldHeight - 100, 50, 50, 900, 200));
            game.objects.push(new Enemy(null, 400, game.worldHeight - 400, 50, 50, 900, 200));
            game.objects.push(new Enemy(null, 400, game.worldHeight - 370, 50, 50, 900, 300));
            game.objects.push(new Enemy(null, 800, 350, 50, 50, 450, 500));

            //Ustaw kamerę na dole świata (widok na ziemię)
            game.camera.y = game.worldHeight - game.canvas.height;
        }
    }

    /**
    * Ustawiamy kamere na odpowiedni wycinek swiata
    *  
    */
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

    /**
    * Sprawdzamy kolizje miedzy obeiktami
    *  
    */
    checkCollisions() {
        this.objects.forEach(obj => {
            // 🔹 kolizje Playera
            if (Physics.rectRect(this.player, obj)) {
                if (obj.constructor.name === "Platform") {
                    this.player.resolveCollision(obj);
                } else if (obj.constructor.name === "Enemy") {
                    //  this.player.resolveCollision(obj);
                    //this.gameState = "gameover";
                    this.player.die();
                    this.context.status = "die";

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

    /**
    * Rysowanie okna gornego  HUD. TODO: Przerobić na obiekt
    *  
    */
    drawHUD() {
        const ctx = this.ctx;
        const grad = ctx.createLinearGradient(0, 0, 0, this.hudHeight);
        grad.addColorStop(0, "rgba(0, 0, 0, 1)");
        grad.addColorStop(1, "rgba(0, 0, 0, 1)");
        ctx.save();
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.hudHeight);
        // 🔹 cień pod HUD
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 10;
        ctx.fillRect(0, this.hudHeight - 3, this.width, 5);
        // 🔹 tekst
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`Życia: ${this.lives}`, 20, 30);
        ctx.fillText(`Czas: ${Math.floor(performance.now() / 1000)} s`, 150, 30);
        ctx.textAlign = "right";
        ctx.fillText(`Gra: Super Demo`, this.width - 180, 30);
        ctx.fillText(`Canvas: ${this.width}×${this.height}`, this.width - 20, 30);
        ctx.restore();
    }

    /**
    * Rysowanie Debugera  TODO: Przerobić na obiekt
    *  
    */
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
        ctx.fillText(`Visible: ${this.width}×${this.height}`, 20, y);
        // 🔹 Obrys kamery
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 1;
        ctx.strokeRect(0, this.hudHeight, this.width, this.height - this.hudHeight);

        ctx.restore();
    }

    /**
   * Rysowanie Beckgaunda TODO: Przerobić na obiekt
   *  
   */
    drawBackground() {
        const { camera } = this;
        const ctx = this.ctx;

        ctx.save();
        for (let i = 0; i < this.backgroundLayers.length; i++) {
            const layer = this.backgroundLayers[i];
            const img = layer.img;
            const speed = layer.speed;
            if (!img) continue;
            const x = -camera.x * speed;
            const repeatCount = Math.ceil(this.width / img.width) + 2;
            const startX = (x % img.width) - img.width;
            const height = this.height;
            // 🔹 Ustal przesunięcie pionowe — tło nieba lekko wyżej
            let offsetY = 0;
            if (i === 0) offsetY = -this.height * 0.20; // plan dalszy uniesiony o 15%
            if (i === 1) offsetY = 0; // plan bliższy bez zmian
            ctx.globalAlpha = i === 0 ? 0.3 : 1.0;
            // ctx.globalAlpha = 0.8;
            for (let j = 0; j < repeatCount; j++) {
                ctx.drawImage(img, startX + j * img.width, offsetY, img.width, height);
            }
        }
        ctx.globalAlpha = 1.0;
        ctx.restore();
    }

    /**
    * Rysowanie Beckgaunda TODO: Przerobić na obiekt
    *  
    */
    gameLoop(timeStamp) {
        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;
        const MAX_DT = 50;
        const dt = Math.min(deltaTime, MAX_DT) / 1000;

        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.gameState === "playing") {
            this.gameUpdate(dt);
            // rysowanie z przesunięciem kamery
            this.gameDraw(dt);
            // sprawdzenie wygranej lub przegranej: ewentualne ustawienie stanu
            this.updateGameState();
        } else if (this.gameState === "win") {
            // ekrany końcowe
            this.ctx.fillStyle = "black";
            this.ctx.font = "30px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText("YOU WIN! - Naciśnij R aby zagrać ponownie", this.width / 2, this.height / 2);
        }
        else if (this.gameState === "gameover") {
            this.ctx.fillStyle = "black";
            this.ctx.font = "30px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText("GAME OVER - Naciśnij R aby zrestartować", this.width / 2, this.height / 2);
        }
        /* else {

        }*/
        if (this.keys["r"] || this.keys["R"]) {
            this.reset();
            this.gameState = "playing";
        }
        if (this.keys["d"] || this.keys["D"])
            this.showDebug = !this.showDebug;
        if (this.keys["f"] || this.keys["F"])
            this.player.debug = !this.player.debug;

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
    * Aktualizacja stanow obiektó gry 
    *  
    */
    gameUpdate(dt) {
        this.player.update(dt, this.context);
        this.objects.forEach(o => o.update(dt, this.context));
        this.checkCollisions();
        this.updateCamera();
    }

    /**
    * Odrysowywanie obiektów gry
    *  
    */
    gameDraw(dt) {
        this.drawBackground();
        this.objects.forEach(o => o.draw(this.ctx, this.camera));
        this.player.draw(this.ctx, this.camera);
        // HUD
        this.drawHUD();
        if (this.showDebug) this.drawDebug(dt);
    }


    /**
     * Sprawdzenie czy koniec gry czy wygrana + Uaktualnienie stanu gry
     *  
     */
    updateGameState() {
        if (this.lives <= 0) {
            this.gameState = "gameover";
            this.player.velocity.y = 0;
        } else
            if (this.player.x > 3000) {
                this.gameState = "win";
            }
    }
}
/*
Dodatkowy bonus

Jak będziemy mieli hitbox per animacja, to dodamy możliwość:

this.animator.add("walk", 1, 6, 10, 0, 5, 11, 14, { hitbox: { x: 8, y: 10, w: 30, h: 45 } });


czyli każda animacja będzie mieć nie tylko offset, ale też własny zakres kolizji.
*/


/*else if (g.mode === "topdown") {
           game.worldWidth = 2000;
           game.worldHeight = 2000;

           const offsetY = game.hudHeight; // przesunięcie świata pod HUD

           // Gracz na środku świata (z uwzględnieniem HUD)
           game.player = PlayerFactory.create(
               game.mode,
               assets.player,
               game.worldWidth / 2 - 25,
               game.worldHeight / 2 - 25 + offsetY,
               50,
               50
           );

           const wallThickness = 40;

           game.objects.push(
               // górna ściana tuż pod HUD-em
               new Platform(assets.platform, 0, offsetY, game.worldWidth, wallThickness),

               // dolna ściana
               new Platform(
                   assets.platform,
                   0,
                   game.worldHeight - wallThickness,
                   game.worldWidth,
                   wallThickness
               ),

               // lewa ściana
               new Platform(assets.platform, 0, offsetY + wallThickness, wallThickness, game.worldHeight - wallThickness),

               // prawa ściana
               new Platform(
                   assets.platform,
                   game.worldWidth - wallThickness,
                   offsetY + wallThickness,
                   wallThickness,
                   game.worldHeight - offsetY - wallThickness
               )
           );

           // Kamera patrzy na środek świata
           game.camera.x = game.worldWidth / 2 - game.canvas.width / 2;
           game.camera.y = offsetY; // zaczynamy widok tuż pod HUD-em
       }*/