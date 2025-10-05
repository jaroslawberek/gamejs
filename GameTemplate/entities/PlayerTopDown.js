import { Entity } from "./Entity.js";

export class PlayerTopDown extends Entity {
    constructor(img, x, y, w, h) {
        super(img, x, y, w, h);
        this.speed = 250; // px/s
        this.velocity = { x: 0, y: 0 };
    }

    update(dt, context) {
        const { keys, game } = context;
        const { worldWidth, worldHeight, hudHeight } = game;

        // --- Ruch ---
        this.velocity.x = 0;
        this.velocity.y = 0;
        if (keys["ArrowRight"]) this.velocity.x = this.speed;
        if (keys["ArrowLeft"]) this.velocity.x = -this.speed;
        if (keys["ArrowUp"]) this.velocity.y = -this.speed;
        if (keys["ArrowDown"]) this.velocity.y = this.speed;

        // --- Aktualizacja pozycji ---
        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;

        // --- Ograniczenia do świata (nie canvasu) ---
        if (this.x < 0) this.x = 0;
        if (this.y < hudHeight) this.y = hudHeight; // pod HUD
        if (this.right > worldWidth) this.x = worldWidth - this.width;
        if (this.bottom > worldHeight) this.y = worldHeight - this.height;

        this.recalculate();
    }

    colission(obj) {
        console.log(`Zderzyłem się z obiektem typu: ${obj.constructor.name}`);
    }

    resolveCollision(other) {
        const overlapX = Math.min(this.right - other.x, other.right - this.x);
        const overlapY = Math.min(this.bottom - other.y, other.bottom - this.y);

        if (overlapX < overlapY) {
            if (this.center.x < other.center.x) {
                this.x = other.x - this.width;
            } else {
                this.x = other.right;
            }
            this.velocity.x = 0;
        } else {
            if (this.center.y < other.center.y) {
                this.y = other.y - this.height;
            } else {
                this.y = other.bottom;
            }
            this.velocity.y = 0;
        }

        this.recalculate();
    }
}
