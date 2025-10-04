import { Entity } from "./Entity.js";
export class PlayerPlatformer extends Entity {
    constructor(img, x, y, w, h) {
        super(img, x, y, w, h);
        // this.speed = 200; // px na sekundę
        this.speed = 250; // px/s
        this.gravity = 1500; // px/s²
        this.jumpStrength = 600; // px/s
        this.onGround = false;


        this.velocity = { x: 0, y: 0 } //prędkość w poziomie i pionie
    }


    update(deltaTime, keys, canvas) {
        const dt = deltaTime / 1000; // sekundy

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

        // --- Clamp poziomy (żeby nie uciekł z ekranu) ---
        if (this.x < 0) this.x = 0;
        if (this.right > canvas.width) this.x = canvas.width - this.width;

        // --- Clamp pionowy (sufit) ---
        if (this.y < 0) {
            this.y = 0;
            this.velocity.y = 0; // uderzenie w sufit zatrzymuje ruch w górę
        }
        if (this.bottom > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity.y = 0;
            this.onGround = true;
        }
        // ❌ brak clampu dolnego — Player spada w nieskończoność,
        //    dopóki kolizja z podłogą/platformą go nie zatrzyma

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

