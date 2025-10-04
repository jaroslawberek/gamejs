import { Entity } from "./Entity.js";

export class Enemy extends Entity {
    constructor(img, x, y, w, h) {
        super(img, x, y, w, h);
        this.speed = 100;
    }

    update(deltaTime) {
        // proste poruszanie w dół
        //this.y += this.speed * (deltaTime / 1000);
        this.recalculate();
    }
    colission(obj) {
        if (obj instanceof Player) {
            console.log("Enemy został trafiony graczem!");
            // np. this.alive = false;
        }
        else if (obj instanceof Enemy) {
            console.log(" Inny Enemy na mnie trafił");
        }
    }
}
