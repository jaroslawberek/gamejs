// core/Animator.js

export class Animator {
    /**
     * @param {HTMLImageElement|null} spriteSheet
     * @param {number} frameWidth
     * @param {number} frameHeight
     * @param {Object} animations opcjonalnie: { idle:{row,frames,speed}, ... }
     */
    constructor(spriteSheet, frameWidth, frameHeight, scale = 1, animations = {}) {
        this.spriteSheet = spriteSheet || null;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.animations = { ...animations };
        //this.offsetX = offsetX; // 🔹 nowość — przesunięcie poziome przy rysowaniu
        // this.offsetY = offsetY; // 🔹 nowość — przesunięcie pionowe przy rysowaniu
        this.scale = scale;
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
     * @param {number} startIndex  od ktorego numeru klatki ma zacząć animować
     * @param {number} startIndrawOffsetX   przesuniecie sprita jesli nie wyglada dobrze juz narysowany
     * @param {number} drawOffsetY  od ktorego numeru klatki ma zacząć animować
     */
    add(name, row, frames, speed, startIndex = 0, drawOffsetX = 0, drawOffsetY = 0, flipOffsetX = null, loop = true, hold = false) {
        this.animations[name] = { row, frames, speed, startIndex, drawOffsetX, drawOffsetY, flipOffsetX, loop, hold };
        if (!this.current) this.current = name;
    }


    /** Wybór animacji (reset klatek, jeśli zmiana) */
    play(name) {
        const anim = this.animations[name];
        if (this.current !== name && anim) {
            this.current = name;
            this.frameIndex = anim.startIndex || 0;
            this.timer = 0;
        }
    }

    /** Aktualizacja indeksu klatki w czasie */
    update(dt, ctx = null) {
        const anim = this.animations[this.current];
        if (!anim) return;

        const frameDuration = 1 / Math.max(1, anim.speed); // sek/klatkę
        this.timer += dt;

        while (this.timer >= frameDuration) {
            this.timer -= frameDuration;
            const nextIndex = this.frameIndex + 1;

            if (nextIndex >= (anim.startIndex || 0) + anim.frames) {
                if (anim.loop) {
                    this.frameIndex = anim.startIndex || 0;
                } else if (anim.hold) {
                    // pozostań na ostatniej klatce
                    this.frameIndex = (anim.startIndex || 0) + anim.frames - 1;
                } else {
                    // wróć do pierwszej
                    this.frameIndex = anim.startIndex || 0;
                }
            } else {
                this.frameIndex = nextIndex;
            }
        }
    }

    /**
     * Rysowanie aktualnej klatki
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x pozycja na ekranie (już po kamerze)
     * @param {number} y pozycja na ekranie (już po kamerze)
     * @param {boolean} flipX odbicie poziome
     */
    // w Animator.draw():
    draw(ctx, x, y, flipX = false) {
        const anim = this.animations[this.current];
        if (!anim || !this.spriteSheet) return false;

        const sx = this.frameIndex * this.frameWidth;
        const sy = anim.row * this.frameHeight;

        // 🟩 użyj per-animacja offsetów


        const dx = flipX ? -(anim.flipOffsetX ?? anim.drawOffsetX) : anim.drawOffsetX;
        const dy = anim.drawOffsetY ?? this.offsetY;

        ctx.save();
        if (flipX) {

            ctx.scale(-1, 1);
            ctx.drawImage(
                this.spriteSheet,
                sx, sy, this.frameWidth, this.frameHeight,
                -x - this.frameWidth - dx, y + dy,
                this.frameWidth * this.scale, this.frameHeight * this.scale
            );
        } else {
            ctx.drawImage(
                this.spriteSheet,
                sx, sy, this.frameWidth, this.frameHeight,
                x + dx, y + dy,
                this.frameWidth * this.scale, this.frameHeight * this.scale
            );
        }
        ctx.restore();
        return true;
    }



}
