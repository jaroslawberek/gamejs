import { Entity } from "./Entity.js";

export class Enemy extends Entity {
    constructor(img, x, y, w, h, range = 200, speed = 100) {
        super(img, x, y, w, h);
        this.startX = x;
        this.range = range;     // jak daleko może się oddalić od punktu startowego
        this.speed = speed;     // px/s
        this.direction = 1;     // 1 → w prawo, -1 → w lewo
        this.gravity = 1500;
        this.velocity = { x: 0, y: 0 };
        this.onGround = false;
    }

    update(dt, context) {
        const { canvas, hudHeight, worldHeight } = context;

        // Grawitacja
        this.velocity.y += this.gravity * dt;
        this.y += this.velocity.y * dt;

        // Prosty ruch patrolowy w poziomie

        this.x += this.speed * dt * this.direction;

        // Zmiana kierunku, gdy osiągnie koniec zakresu
        if (this.x > this.startX + this.range) {
            this.direction = -1;
            this.x = this.startX + this.range;
        }
        if (this.x < this.startX - this.range) {
            this.direction = 1;
            this.x = this.startX - this.range;
        }

        // Ograniczenia pionowe (ziemia)
        if (this.bottom > worldHeight) {
            this.y = worldHeight - this.height;
            this.velocity.y = 0;
            this.onGround = true;
        }

        this.recalculate();
    }

    resolveCollision(other) {
        // Zatrzymanie po zderzeniu z platformą
        const overlapX = Math.min(this.right - other.x, other.right - this.x);
        const overlapY = Math.min(this.bottom - other.y, other.bottom - this.y);

        if (overlapX < overlapY) {
            if (this.center.x < other.center.x) this.x = other.x - this.width;
            else this.x = other.right;
            this.direction *= -1; // odbicie od ściany
        } else {
            if (this.center.y < other.center.y) {
                this.y = other.y - this.height;
                this.onGround = true;
            } else {
                this.y = other.bottom;
            }
            this.velocity.y = 0;
        }
        this.recalculate();
    }

    draw(ctx, camera) {
        const drawX = this.x - camera.x;
        const drawY = this.y - camera.y;
        ctx.fillStyle = "red";
        ctx.fillRect(drawX, drawY, this.width, this.height);
    }
}
