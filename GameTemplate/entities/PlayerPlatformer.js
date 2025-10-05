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


        this.velocity = { x: 0, y: 0 } //prędkość w poziomie i pionie
        this.animator = new Animator(img, w, h);

        // Dodaj animacje (przykładowe)
        const animConfig = {
            idle: { row: 0, frames: 1, speed: 8 },
            walk: { row: 1, frames: 4, speed: 10 },
            jump: { row: 1, frames: 1, speed: 4 },
        };
        for (const [name, cfg] of Object.entries(animConfig)) {
            this.animator.add(name, cfg.row, cfg.frames, cfg.speed);
        }
        this.animator.add("idle", 0, 1, 8);   // nazwa, wiersz, klatki, fps
        this.animator.add("walk", 1, 4, 10);
        this.animator.add("jump", 1, 1, 6);
    }


    update(dt, context) {
        const { canvas, keys, hudHeight, worldWidth, worldHeight } = context;
        // --- Sterowanie poziome ---
        this.velocity.x = 0; // reset prędkości w osi X, będzie nadana przez klawisze
        if (keys["ArrowRight"]) this.velocity.x = this.speed;   // px/s
        if (keys["ArrowLeft"]) this.velocity.x = -this.speed;  // px/s

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
        } else if (this.velocity.x !== 0) {
            this.currentAnimation = "walk";
        } else {
            this.currentAnimation = "idle";
        }

        if (this.animator.current !== this.currentAnimation) {
            this.animator.play(this.currentAnimation);
        }
        this.animator.update(dt);
        this.animator.update(dt);
    }

    draw(ctx, camera) {
        if (this.animator && this.animator.hasSheet()) {
            // opcjonalnie: kierunek bazujący na prędkości
            const flip = this.velocity.x < 0;
            this.animator.draw(ctx, this.x - camera.x, this.y - camera.y, flip);
        } else {
            super.draw(ctx, camera); // fallback – magenta rect
        }
    }

    colission(obj) {
        console.log(`zderzylem sie z obiektem typu: ${obj.constructor.name}`);
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

