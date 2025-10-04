export class Entity {
    constructor(img, x, y, w, h) {
        this.img = img;         // obrazek (asset)
        this.x = x;             // lewa krawędź
        this.y = y;             // górna krawędź
        this.width = w;         //szerokosć
        this.height = h;        //wysokość

        // skrajne pozycje + środek
        this.right = this.x + this.width;
        this.bottom = this.y + this.height;
        this.center = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    }

    // przeliczanie granic obiektu
    recalculate() {
        this.right = this.x + this.width;
        this.bottom = this.y + this.height;
        this.center.x = this.x + this.width / 2;
        this.center.y = this.y + this.height / 2;
    }

    // rysowanie – domyślne (jeśli jest obrazek)
    draw(ctx) {
        if (this.img) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        } else {
            // fallback – prostokąt
            ctx.fillStyle = "magenta";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    // update – pusta metoda, żeby nadpisywać w klasach potomnych
    update(deltaTime) {
        // domyślnie nic
    }
}
