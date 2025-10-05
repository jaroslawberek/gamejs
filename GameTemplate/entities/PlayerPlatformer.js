import { Entity } from "./Entity.js";
import { Animator } from "../core/Animator.js";

export class PlayerPlatformer extends Entity {
    constructor(img, x, y, w, h) {
        super(img, x, y, w, h);
        // this.speed = 200; // px na sekundę
        this.speed = 250; // px/s
        this.gravity = 1500; // px/s²
        this.jumpStrength = 900; // px/s
        this.onGround = false;
        this.facingLeft = false; // w ktora strone ryj miał ostatnio :)



        this.velocity = { x: 0, y: 0 } //prędkość w poziomie i pionie
        this.animator = new Animator(img, w, h);
        // 🔹 Dopasuj hitbox do realnej postaci (goblin nie zajmuje pełnego 64×64)
        //this.hitbox.offsetX = 5;     // przesunięcie w prawo
        // this.hitbox.offsetY = 11;      // przesunięcie w dół
        this.hitbox.widthFactor = 0.4;  // hitbox to ~65% szerokości
        this.hitbox.heightFactor = 1;  // hitbox to ~80% wysokości

        // Dodaj animacje (przykładowe)
        const animConfig = {
            idle: { row: 1, frames: 1, speed: 8, startIndex: 0, drawOffsetX: 6, drawOffsetY: 11 },
            walk: { row: 1, frames: 6, speed: 10, startIndex: 0, drawOffsetX: 6, drawOffsetY: 11 },
            jump: { row: 1, frames: 3, speed: 4, startIndex: 2 },
            die: { row: 4, frames: 4, speed: 3, startIndex: 0, drawOffsetX: 0, drawOffsetY: 5, flipOffsetX: null, loop: false, hold: true },
        };
        for (const [name, cfg] of Object.entries(animConfig)) {
            this.animator.add(name, cfg.row, cfg.frames, cfg.speed, cfg.startIndex, cfg.drawOffsetX, cfg.drawOffsetY, cfg.flipOffsetX, cfg.loop, cfg.hold);
        } this.resolveCollision
        this.debug = false;  // <—— możesz zmieniać na false
        console.log(this.animator.animations);
    }


    update(dt, context) {
        const { canvas, keys, hudHeight, worldWidth, worldHeight } = context;
        if (this.isDead) {
            // spadanie po śmierci
            this.velocity.y += this.gravity * dt;
            this.y += this.velocity.y * dt;
            // po dotknięciu ziemi — zatrzymaj
            if (this.onGround) {
                this.velocity.y = 0;
            }
            this.recalculate();
            this.deathTimer -= dt;
            if (this.deathTimer <= 0) {
                context.game.lives--;
                if (context.game.lives <= 0) {
                    context.game.gameState = "gameover";
                } else {
                    context.game.reset(); // respawn
                }
            }
            this.animator.update(dt);
            return; // ⛔ nie sterujemy graczem, tylko czekamy na koniec animacji
        }
        // --- Sterowanie poziome ---
        this.velocity.x = 0; // reset prędkości w osi X, będzie nadana przez klawisze
        if (keys["ArrowRight"]) {
            this.velocity.x = this.speed;   // px/s
            this.facingLeft = false;
        }
        if (keys["ArrowLeft"]) {
            this.velocity.x = -this.speed;  // px/s
            this.facingLeft = true;

        }

        // --- Skok ---
        if (keys["ArrowUp"] && this.onGround) {
            this.velocity.y = -this.jumpStrength; // px/s w górę
            this.onGround = false;
        }

        // --- Grawitacja ---
        this.velocity.y += this.gravity * dt; // px/s² * czas = px/s

        // --- Ruch faktyczny (pozycja) ---
        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;

        // Clamp poziomy względem ŚWIATA
        if (this.x < 0) this.x = 0;
        if (this.right > worldWidth) this.x = worldWidth - this.width;

        // Sufit = HUD
        if (this.y < hudHeight) {
            this.y = hudHeight;
            this.velocity.y = 0;
        }

        // ❌ Nie rób już clampu do dołu canvasa tutaj
        // Dół obsłużą platformy/ziemia + warunek przegranej w Game (worldHeight)

        this.recalculate();
        if (!this.onGround) {
            this.currentAnimation = "jump";
        }
        else if (this.velocity.x !== 0) {
            this.currentAnimation = "walk";

        }
        else if (keys["ArrowDown"]) {
            this.currentAnimation = "die";
            this.velocity.x = 0;
            console.log(this.animator.animations[this.current]);
        }
        else {
            this.currentAnimation = "idle";
        }

        if (this.animator.current !== this.currentAnimation) {
            this.animator.play(this.currentAnimation);
        }
        console.log(this.currentAnimation);
        this.animator.update(dt);
    }

    draw(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        if (this.animator && this.animator.hasSheet()) {
            const flip = this.facingLeft;
            this.animator.draw(ctx, screenX, screenY, flip);
        } else {
            super.draw(ctx, camera);
        }

        // 🔹 Tryb debugowy — cienka ramka wokół sprite’a i hitboxa
        if (this.debug) {
            ctx.save();
            // ramka sprite’a (pełna klatka)
            ctx.strokeStyle = "rgba(0,255,255,0.8)";
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX, screenY, this.width, this.height);

            // ramka hitboxa faktycznego (Entity)
            const hb = this.getHitbox();
            ctx.save();
            ctx.strokeStyle = "rgba(255, 0, 34, 0.8)";
            ctx.lineWidth = 1;
            ctx.strokeRect(hb.x - camera.x, hb.y - camera.y, hb.width, hb.height);
            ctx.restore();
        }
    }


    die(obj) {
        this.isDead = true;
        this.deathTimer = 1.5;
        this.velocity.x = 0;
        //this.velocity.y = 0;
        this.onGround = false;
        this.currentAnimation = "die";
        this.animator.play("die");
        console.log("kolizja z przeciwnikiem");
    }
    resolveCollision(other) {
        // ile Player wszedł w obiekt
        const overlapX = Math.min(this.right - other.x, other.right - this.x);
        const overlapY = Math.min(this.bottom - other.y, other.bottom - this.y);

        if (overlapX < overlapY) {
            // kolizja pozioma
            if (this.center.x < other.center.x) {
                // Player z lewej strony
                this.x = other.x - this.width;
            } else {
                // Player z prawej strony
                this.x = other.right;
            }
            this.velocity.x = 0;
        } else {
            // kolizja pionowa
            if (this.center.y < other.center.y) {
                // Player uderzył w górną krawędź obiektu
                this.y = other.y - this.height;
                this.onGround = true;
            } else {
                // Player uderzył w dolną krawędź obiektu
                this.y = other.bottom;
            }
            this.velocity.y = 0;
        }

        this.recalculate();
    }

}

