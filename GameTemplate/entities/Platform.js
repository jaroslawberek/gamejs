import { Entity } from "./Entity.js";

export class Platform extends Entity {
    constructor(img, x, y, w, h) {
        super(img, x, y, w, h);
        this.isSolid = true; // w przyszłości można mieć np. platformy "przelotowe"
    }

    update(dt, context) {
        // platformy statyczne nie wymagają aktualizacji,
        // ale metoda jest zostawiona dla kompatybilności (np. ruchome platformy)
        this.recalculate();
    }

    draw(ctx, camera) {
        super.draw(ctx, camera);
    } // <— KLUCZ
}
