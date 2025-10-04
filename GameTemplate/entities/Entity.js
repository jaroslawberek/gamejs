export class Entity {
    constructor(img, x, y, w, h) {
        this.img = img;         // obrazek (asset)
        this.x = x;             // lewa krawędź w świecie
        this.y = y;             // górna krawędź w świecie
        this.width = w;         // szerokość
        this.height = h;        // wysokość

        // automatyczne właściwości pomocnicze
        this.right = this.x + this.width;
        this.bottom = this.y + this.height;
        this.center = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    // aktualizacja granic obiektu
    recalculate() {
        this.right = this.x + this.width;
        this.bottom = this.y + this.height;
        this.center.x = this.x + this.width / 2;
        this.center.y = this.y + this.height / 2;
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
            // fallback – prostokąt (dla debugowania)
            ctx.fillStyle = "magenta";
            ctx.fillRect(drawX, drawY, this.width, this.height);
        }
    }

    /**
     * Pusta metoda do nadpisania w klasach potomnych (gracz, wróg itd.)
     */
    update(dt, context) {
        // domyślnie nic nie robi
    }
}
