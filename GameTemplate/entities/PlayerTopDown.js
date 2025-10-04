import { Entity } from "./Entity.js";
export class PlayerTopDown extends Entity {
    constructor(img, x, y, w, h) {
        super(img, x, y, w, h);
        this.speed = 200; // px na sekundę



        this.velocity = { x: 0, y: 0 } //prędkość w poziomie i pionie
    }
    update(deltaTime, keys, canvas) {
        const dt = deltaTime / 1000; // sekundy
        this.velocity.x = this.velocity.y = 0; //serujemy  predkosc
        if (keys["ArrowRight"]) this.velocity.x = this.speed;  // px/s
        if (keys["ArrowLeft"]) this.velocity.x = -this.speed;
        if (keys["ArrowUp"]) this.velocity.y = -this.speed;
        if (keys["ArrowDown"]) this.velocity.y = this.speed;


        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;

        // ograniczenie do ekranu (clamp) - jak wystaje poza ekran to ustawiamy na rowni
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.right > canvas.width) this.x = canvas.width - this.width; // 
        if (this.bottom > canvas.height) this.y = canvas.height - this.height;
        this.recalculate();
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
            } else {
                // Player uderzył w dolną krawędź obiektu
                this.y = other.bottom;
            }
            this.velocity.y = 0;
        }

        this.recalculate();
    }

}

