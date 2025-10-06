import { PlayerTopDown } from "../entities/PlayerTopDown.js";
import { PlayerPlatformer } from "../entities/PlayerPlatformer.js";

export class PlayerFactory {
    /**
     * Tworzy odpowiedniego gracza zależnie od trybu gry
     * @param {string} mode - "topdown" | "platformer"
     * @param {HTMLImageElement|null} img - asset gracza
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @returns {PlayerTopDown|PlayerPlatformer}
     */
    static create(mode, img, x, y, w, h, scale = 1) {
        switch (mode) {
            case "topdown":
                return new PlayerTopDown(img, x, y, w, h, scale);
            case "platformer":
                return new PlayerPlatformer(img, x, y, w, h, scale);
            default:
                throw new Error(`Nieznany tryb gry: ${mode}`);
        }
    }
}
