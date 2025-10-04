// core/utils.js
export class Utils {
    /**
     * Oblicza parametry skoku na podstawie prędkości początkowej i grawitacji.
     * @param {number} jumpStrength - prędkość początkowa w px/s
     * @param {number} gravity - przyspieszenie grawitacyjne w px/s²
     * @returns {object} { height, timeUp, timeTotal }
     */
    static calculateJump(jumpStrength, gravity) {
        const height = (jumpStrength ** 2) / (2 * gravity);
        const timeUp = jumpStrength / gravity;
        const timeTotal = timeUp * 2;
        return { height, timeUp, timeTotal };
    }

    /**
     * Losuje liczbę całkowitą z zakresu [min, max].
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Losuje liczbę zmiennoprzecinkową z zakresu [min, max].
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Sprawdza, czy dwie wartości są "blisko siebie" (przydatne do fizyki).
     * @param {number} a
     * @param {number} b
     * @param {number} tolerance - domyślnie 0.001
     * @returns {boolean}
     */
    static nearlyEqual(a, b, tolerance = 0.001) {
        return Math.abs(a - b) < tolerance;
    }
}
