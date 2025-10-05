// core/Animator.js

export class Animator {
    /**
     * @param {HTMLImageElement|null} spriteSheet
     * @param {number} frameWidth
     * @param {number} frameHeight
     * @param {Object} animations opcjonalnie: { idle:{row,frames,speed}, ... }
     */
    constructor(spriteSheet, frameWidth, frameHeight, animations = {}) {
        this.spriteSheet = spriteSheet || null;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.animations = { ...animations };

        this.current = null;    // nazwa aktualnej animacji
        this.frameIndex = 0;    // indeks klatki
        this.timer = 0;         // licznik czasu w sekundach
        this.flipX = false;     // odbicie poziome
    }

    /** Pozwala ustawić/zmienić sprite sheet po konstruktorze */
    setSpriteSheet(img) {
        this.spriteSheet = img || null;
    }

    /** Czy mamy gotowy sprite sheet do rysowania */
    hasSheet() {
        return !!this.spriteSheet;
    }

    /**
     * Dodaje definicję animacji.
     * @param {string} name  np. "run"
     * @param {number} row   wiersz w sprite sheecie (0-index)
     * @param {number} frames ile klatek
     * @param {number} speed  ile klatek na sekundę
     */
    add(name, row, frames, speed) {
        this.animations[name] = { row, frames, speed };
        if (!this.current) {
            // pierwsza dodana animacja staje się domyślną
            this.current = name;
        }
    }

    /** Wybór animacji (reset klatek, jeśli zmiana) */
    play(name) {
        if (this.current !== name && this.animations[name]) {
            this.current = name;
            this.frameIndex = 0;
            this.timer = 0;
        }
    }

    /** Aktualizacja indeksu klatki w czasie */
    update(dt) {
        const anim = this.animations[this.current];
        if (!anim) return;

        const frameDuration = 1 / Math.max(1, anim.speed); // sek/klatkę
        this.timer += dt;

        while (this.timer >= frameDuration) {
            this.timer -= frameDuration;
            this.frameIndex = (this.frameIndex + 1) % anim.frames;
        }
    }

    /**
     * Rysowanie aktualnej klatki
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x pozycja na ekranie (już po kamerze)
     * @param {number} y pozycja na ekranie (już po kamerze)
     * @param {boolean} flipX odbicie poziome
     */
    draw(ctx, x, y, flipX = false) {
        const anim = this.animations[this.current];
        if (!anim || !this.spriteSheet) return false;

        const sx = this.frameIndex * this.frameWidth;
        const sy = anim.row * this.frameHeight;

        ctx.save();
        if (flipX) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.spriteSheet,
                sx, sy, this.frameWidth, this.frameHeight,
                -x - this.frameWidth, y, this.frameWidth, this.frameHeight
            );
        } else {
            ctx.drawImage(
                this.spriteSheet,
                sx, sy, this.frameWidth, this.frameHeight,
                x, y, this.frameWidth, this.frameHeight
            );
        }
        ctx.restore();
        return true;
    }
}
