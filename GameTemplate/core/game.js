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
    constructor(mode = "topdown", worldWidth = 4000, worldHeight = 3000) {
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
        this.setCanavasProportion(this.aspectRatio);
        //wysokosc gornego okna informacyjnego TODO: Utworzyć obiekt
        this.hudHeight = 50;
        this.ctx.imageSmoothingEnabled = false; //?
        //Obiekty, klawisze, myszka, tła, czas
        this.lastTime = 0;
        this.keys = {};
        this.mouse = {};
        this.objects = [];
        this.backgroundLayers = [];
        this.lives = 3;

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
        const game = this;
        window.addEventListener("keydown", e => game.keys[e.key] = true);
        window.addEventListener("keyup", e => game.keys[e.key] = false);
        // reakcja na resize
        window.addEventListener("resize", () => game.resizeCanvas());
    }

    /**
     * Przelicza wielkosci swiata gry
     * 
     */
    Recalculate() {
        const game = this;
        game.width = game.canvas.width;
        game.height = game.canvas.height;
        game.right = game.width;
        game.bottom = game.height;
        game.center = {
            x: game.width / 2,
            y: game.height / 2
        };
    }

    /**
     * Ustal proporcje canvas
     * @param {*} aspectRatio 
     */
    setCanavasProportion(aspectRatio) {
        const game = this;
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.9;

        if (maxWidth / maxHeight > aspectRatio) {
            game.canvas.height = maxHeight;
            game.canvas.width = maxHeight * aspectRatio;
        } else {
            game.canvas.width = maxWidth;
            game.canvas.height = maxWidth / aspectRatio;
        }
        game.Recalculate();
    }

    /**
    * Ładuje obrazu backgraundu
    *  
    */
    loadBackground() {
        const game = this;
        game.backgroundLayers = [
            { img: assets.bg_far, speed: 0.2 },   // daleka warstwa – powolna
            { img: assets.bg_mid, speed: 0.9 }    // bliższa – szybsza
        ];
    }

    resizeCanvas() {
        const game = this;
        const aspectRatio = 16 / 9;
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.9;

        if (maxWidth / maxHeight > aspectRatio) {
            game.canvas.height = maxHeight;
            game.canvas.width = maxHeight * aspectRatio;
        } else {
            game.canvas.width = maxWidth;
            game.canvas.height = maxWidth / aspectRatio;
        }

        game.Recalculate();
    }

    /**
    * Ustawia stan poczatkowy obiektow gry na start. 
    * Wywoływane na początku oraz przy resecie gry
    *  
    */
    reset() {
        const game = this;
        this.winPos = 2500; //jak dojdzie do pozycji x=1300 wygrana
        game.objects = []; // wyczyść poprzednie obiekty
        if (game.lives === 0)
            game.lives = 3;
        game.gameState = "playing";

        // === Platformer mode ===
        if (game.mode === "platformer") {
            // game.worldWidth = 3000;
            // game.worldHeight = 1200;

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
        const game = this;

        // 🟦 Tryb PLATFORMOWY — kamera trzyma gracza na środku X, ale z lekkim offsetem Y (żeby było widać „przód”)
        if (mode === "platformer") {
            game.camera.x = game.player.x - camera.margin;
            game.camera.y = game.player.center.y - game.center.y / 2; // offset  pionie
            // console.log();
            // ograniczenia w poziomie
            if (camera.x < 0) camera.x = 0;
            if (camera.x > game.winPos - camera.margin * 2)
                camera.x = game.winPos - camera.margin * 2;

            // ograniczenia w pionie
            if (camera.y < 0) camera.y = 0;
            if (camera.y > worldHeight - canvas.height)
                camera.y = worldHeight - canvas.height;
        }

        // 🟥 Tryb TOP-DOWN — kamera zawsze trzyma gracza na środku (pełne śledzenie)
        else if (mode === "topdown") {
            camera.x = player.center.x - game.center.x;
            camera.y = player.center.y - game.center.y;

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
        const game = this;
        game.objects.forEach(obj => {
            // 🔹 kolizje Playera
            if (Physics.rectRect(game.player, obj)) {
                if (obj.constructor.name === "Platform") {
                    game.player.resolveCollision(obj);
                } else if (!game.player.isDead && obj.constructor.name === "Enemy") {
                    //  game.player.resolveCollision(obj);
                    game.player.die();
                    game.context.status = "die";

                }
            }

            // 🔹 kolizje Enemy z platformami
            if (obj.constructor.name === "Enemy") {
                game.objects.forEach(other => {
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
        const game = this;
        const ctx = game.ctx;
        const grad = ctx.createLinearGradient(0, 0, 0, game.hudHeight);
        grad.addColorStop(0, "rgba(0, 0, 0, 1)");
        grad.addColorStop(1, "rgba(0, 0, 0, 1)");
        ctx.save();
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, game.width, game.hudHeight);
        // 🔹 cień pod HUD
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 10;
        ctx.fillRect(0, game.hudHeight - 3, game.width, 5);
        // 🔹 tekst
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`Życia: ${game.lives}`, 20, 30);
        ctx.fillText(`Czas: ${Math.floor(performance.now() / 1000)} s`, 150, 30);
        ctx.textAlign = "right";
        ctx.fillText(`Gra: Super Demo`, game.width - 180, 30);
        ctx.restore();
    }

    /**
    * Rysowanie Debugera  TODO: Przerobić na obiekt
    *  
    */
    drawDebug(dt) {
        const game = this;
        const ctx = game.ctx;
        ctx.save();
        ctx.font = "14px monospace";
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.textAlign = "left";

        const fps = (1 / dt).toFixed(1);
        const baseY = game.hudHeight + 20;
        let y = baseY;

        // 🔹 FPS i czas klatki
        ctx.fillText(`FPS: ${fps}`, 20, y); y += 18;
        ctx.fillText(`Delta: ${(dt * 1000).toFixed(2)} ms`, 20, y); y += 18;
        // 🔹 Player
        ctx.fillText(`Player.x: ${game.player.x.toFixed(1)} | y: ${game.player.y.toFixed(1)} | center x:${game.player.center.x}  y: ${game.player.center.y}`, 20, y); y += 18;
        ctx.fillText(`Vel.x: ${game.player.velocity?.x?.toFixed(1) || 0} | Vel.y: ${game.player.velocity?.y?.toFixed(1) || 0}`, 20, y); y += 18;
        ctx.fillText(`Center: ${game.player.center.x.toFixed(1)}, ${game.player.center.y.toFixed(1)}`, 20, y); y += 18;
        ctx.fillText(`OnGround: ${game.player.onGround ? "✅" : "❌"}`, 20, y); y += 22;
        // 🔹 Kamera
        ctx.fillText(`Camera.x: ${game.camera.x.toFixed(1)} | y: ${game.camera.y.toFixed(1)}`, 20, y); y += 18;
        ctx.fillText(`Cam.center: ${game.camera.center?.x?.toFixed(1) || 0}, ${game.camera.center?.y?.toFixed(1) || 0}`, 20, y); y += 18;
        ctx.fillText(`Cam.margin: ${game.camera.margin || 0}`, 20, y); y += 22;
        // 🔹 Wymiary świata
        ctx.fillText(`World: ${game.worldWidth}×${game.worldHeight}`, 20, y); y += 18;
        ctx.fillText(`Visible: ${game.width}×${game.height}`, 20, y); y += 20;
        ctx.fillText(`róznica: ${game.player.center.x - game.center.x}×${game.player.center.y - game.center.y / 2}`, 20, y); y += 20;
        // 🔹 Obrys kamery
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 1;
        ctx.strokeRect(0, game.hudHeight, game.width, game.height - game.hudHeight);

        ctx.restore();
    }

    /**
   * Rysowanie Beckgaunda TODO: Przerobić na obiekt
   *  
   */
    drawBackground() {
        const { camera } = this;
        const game = this;
        const ctx = game.ctx;

        ctx.save();
        for (let i = 0; i < game.backgroundLayers.length; i++) {
            const layer = game.backgroundLayers[i];
            const img = layer.img;
            const speed = layer.speed;
            if (!img) continue;
            const x = -camera.x * speed;
            const repeatCount = Math.ceil(game.width / img.width) + 2;
            const startX = (x % img.width) - img.width;
            const height = game.height;
            // 🔹 Ustal przesunięcie pionowe — tło nieba lekko wyżej
            let offsetY = 0;
            if (i === 0) offsetY = -game.height * 0.20; // plan dalszy uniesiony o 15%
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
        const game = this;
        const deltaTime = timeStamp - game.lastTime;
        game.lastTime = timeStamp;
        const MAX_DT = 50;
        const dt = Math.min(deltaTime, MAX_DT) / 1000;

        game.ctx.clearRect(0, 0, game.width, game.height);

        if (game.gameState === "playing") {
            game.gameUpdate(dt);
            // rysowanie z przesunięciem kamery
            game.gameDraw(dt);
            // sprawdzenie wygranej lub przegranej: ewentualne ustawienie stanu
            game.updateGameState();
        } else if (game.gameState === "win") {
            // ekrany końcowe
            game.ctx.fillStyle = "black";
            game.ctx.font = "30px Arial";
            game.ctx.textAlign = "center";
            game.ctx.fillText("YOU WIN! - Naciśnij R aby zagrać ponownie", game.width / 2, game.height / 2);
        }
        else if (game.gameState === "gameover") {
            game.ctx.fillStyle = "black";
            game.ctx.font = "30px Arial";
            game.ctx.textAlign = "center";
            game.ctx.fillText("GAME OVER - Naciśnij R aby zrestartować", game.width / 2, game.height / 2);
        }
        /* else {

        }*/
        if (game.keys["r"] || game.keys["R"]) {
            game.reset();
            game.gameState = "playing";
        }
        if (game.keys["d"] || game.keys["D"])
            game.showDebug = !game.showDebug;
        if (game.keys["f"] || game.keys["F"])
            game.player.debug = !game.player.debug;

        requestAnimationFrame(game.gameLoop.bind(this));
    }

    /**
    * Aktualizacja stanow obiektó gry 
    *  
    */
    gameUpdate(dt) {
        const game = this;
        game.player.update(dt, game.context);
        game.objects.forEach(o => o.update(dt, game.context));
        game.checkCollisions();
        game.updateCamera();
    }

    /**
    * Odrysowywanie obiektów gry
    *  
    */
    gameDraw(dt) {
        const game = this;
        game.drawBackground();
        game.objects.forEach(o => o.draw(game.ctx, game.camera));
        game.player.draw(game.ctx, game.camera);
        // HUD
        game.drawHUD();
        if (game.showDebug) game.drawDebug(dt);
    }


    /**
     * Sprawdzenie czy koniec gry czy wygrana + Uaktualnienie stanu gry
     *  
     */
    updateGameState() {
        const game = this;
        if (game.lives <= 0) {
            game.gameState = "gameover";
            game.player.velocity.y = 0;
        } else
            if (game.player.x > game.winPos) {
                game.gameState = "win";
            }
    }
}
/*
Dodatkowy bonus

Jak będziemy mieli hitbox per animacja, to dodamy możliwość:

game.animator.add("walk", 1, 6, 10, 0, 5, 11, 14, { hitbox: { x: 8, y: 10, w: 30, h: 45 } });


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