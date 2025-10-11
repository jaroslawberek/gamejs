export class Entity {
    constructor(img, x, y, w, h) {
        this.img = img;         // obrazek (asset)
        this.x = x;             // lewa krawędź w świecie
        this.y = y;             // górna krawędź w świecie
        this.width = w;         // szerokość
        this.height = h;        // wysokość

        // automatyczne właściwości pomocnicze
        this.recalculate();
        //Hitbox - potrzebny do ustalenia obszaru wrazliwego na kolizje
        this.hitbox = {
            offsetX: 0,
            offsetY: 0,
            widthFactor: 1,  // 1 = 100% szerokości
            heightFactor: 1  // 1 = 100% wysokości
        };
    }

    /**
     * Aktualizacja granic obiektu.
     * 
     */
    recalculate() {
        this.left = this.x;
        this.right = this.x + this.width;
        this.bottom = this.y + this.height;
        this.top = this.y;
        this.center = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    /**
     * Pobranie Fitbox - zakresu kolizji
     *
     */
    getHitbox() {
        const hb = this.hitbox;

        const w = this.width * hb.widthFactor;
        const h = this.height * hb.heightFactor;

        // 🔹 Wyśrodkuj hitbox względem sprite’a — offset działa teraz od środka
        const x = this.x + (this.width - w) / 2;
        const y = this.y + (this.height - h) / 2;

        return { x, y, right: x + w, bottom: y + h, width: w, height: h };
    }

    /**
     * Rysowanie obiektu na canvasie.
     * @param {CanvasRenderingContext2D} ctx - kontekst rysowania
     * @param {object} camera - {x, y} pozycja kamery (może być pominięta)
     */
    draw(ctx, camera = { x: 0, y: 0 }) {
        const drawX = Math.round(this.x - (camera.x || 0));
        const drawY = Math.round(this.y - (camera.y || 0));
        if (this.img) {
            // rysuj sprite’a / grafikę
            ctx.drawImage(this.img, drawX, drawY, this.width, this.height);
        } else {
            ctx.fillStyle = "magenta";
            ctx.fillRect(drawX, drawY, this.width, this.height);
        }
        if (this.debugHitbox) {
            const hb = this.getHitbox();
            ctx.save();
            ctx.strokeStyle = "rgba(255, 0, 34, 0.8)";
            ctx.lineWidth = 3;
            ctx.strokeRect(hb.x - camera.x, hb.y - camera.y, hb.width, hb.height);
            ctx.restore();
        }
    }

    /**
     * Pusta metoda do nadpisania w klasach potomnych (gracz, wróg itd.)
     */
    update(dt, context) {
        // domyślnie nic nie robi
    }
}
