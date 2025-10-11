import { Entity } from "./Entity.js";
import { Animator } from "../core/Animator.js";

export class PlayerPlatformer extends Entity {
    constructor(img, x, y, w, h, scale) {
        console.log("player constr x:", x);
        super(img, x, y, w * scale, h * scale);
        // this.speed = 200; // px na sekundę
        this.speed = 250; // px/s
        this.gravity = 1500; // px/s²
        this.jumpStrength = 900; // px/s
        this.onGround = false;
        this.facingLeft = false; // w ktora strone ryj miał ostatnio :)
        this.scale = scale;
        this.debug = false;  // <—— możesz zmieniać na false


        this.velocity = { x: 0, y: 0 } //prędkość w poziomie i pionie
        this.animator = new Animator(img, w, h, this.scale);
        // 🔹 Dopasuj hitbox do realnej postaci (goblin nie zajmuje pełnego 64×64)
        //this.hitbox.offsetX = 5;     // przesunięcie w prawo
        // this.hitbox.offsetY = 11;      // przesunięcie w dół
        this.hitbox.widthFactor = 0.4;  // hitbox to ~65% szerokości
        this.hitbox.heightFactor = 1;  // hitbox to ~80% wysokości

        // Dodaj animacje 
        const animConfig = {
            idle: { row: 1, frames: 1, speed: 8, startIndex: 0, drawOffsetX: 6, drawOffsetY: 11, flipOffsetX: -20 },
            walk: { row: 1, frames: 6, speed: 10, startIndex: 0, drawOffsetX: 6, drawOffsetY: 11, flipOffsetX: -20 },
            jump: { row: 1, frames: 3, speed: 4, startIndex: 2 },
            die: { row: 4, frames: 4, speed: 3, startIndex: 0, drawOffsetX: -5, drawOffsetY: 5, flipOffsetX: null, loop: false, hold: true },
        };
        for (const [name, cfg] of Object.entries(animConfig)) {
            this.animator.add(name, cfg.row, cfg.frames, cfg.speed, cfg.startIndex, cfg.drawOffsetX, cfg.drawOffsetY, cfg.flipOffsetX, cfg.loop, cfg.hold);
        }

    }


    update(dt, context) {
        const { canvas, keys, hudHeight, worldWidth, worldHeight } = context;
        const player = this;
        if (player.isDead) {
            // spadanie po śmierci
            player.velocity.y += player.gravity * dt;
            player.y += player.velocity.y * dt;
            // po dotknięciu ziemi — zatrzymaj
            if (player.onGround) {
                player.velocity.y = 0;
            }
            player.recalculate();
            player.deathTimer -= dt;
            if (player.deathTimer <= 0) {
                context.game.lives--;
                console.log(context.game.lives);
                if (context.game.lives === 0) {
                    context.game.gameState = "gameover";
                } else {
                    context.game.reset(); // respawn
                }
            }
            player.animator.update(dt);
            return; // ⛔ nie sterujemy graczem, tylko czekamy na koniec animacji
        }
        // --- Sterowanie poziome ---
        player.velocity.x = 0; // reset prędkości w osi X, będzie nadana przez klawisze
        if (keys["ArrowRight"]) {
            player.velocity.x = player.speed;   // px/s idzie w prawo - ustawienie predkosc  dodatniej dla x 
            player.facingLeft = false;
        }
        if (keys["ArrowLeft"]) {
            player.velocity.x = -player.speed;  // px/s - idzie nw lewo - predkosx x ujemna
            player.facingLeft = true;

        }
        // --- Skok ---
        if (keys["ArrowUp"] && player.onGround) {         // jezeli zdarzenie klawisz gora i player na czyms stoi
            player.velocity.y = -player.jumpStrength;       // px/s w górę - ujemnie bo do gory skaczea  do gory y maleja
            player.onGround = false;                      // no i juz nie stoi na niczym
        }

        // --- Grawitacja ---
        player.velocity.y += player.gravity * dt; // px/s² * czas = px/s
        // --- Ruch faktyczny (pozycja) --- ostatecznie nowa pozycja w swiecie gry po ustaleniach predkosci x i y (grawitacja z lub bez skoku)
        player.x += player.velocity.x * dt; //do aktualnej pozycji dodajemy  pikseli : predkosc * dt
        player.y += player.velocity.y * dt;

        // Clamp poziomy względem ŚWIATA - ale teraz trzeba sprawdzic czy nei wylazl po za swiat gry
        if (player.x < 0) player.x = 0;                                     //jak wyszedl z lewej strony to ustawiamy go na x: 0
        if (player.right > worldWidth) player.x = worldWidth - player.width; // jak wyszedl z prawej to na skaraj swiata

        // Sufit = HUD - sprawdzamy czy gora nie wlazi na gorne okno
        if (player.y < hudHeight) {
            player.y = hudHeight;         // jesli wylazi to ustawiamyplayera tuz ponizej. 
            player.velocity.y = 0;        // zatrzymujemy predkosc pionową
        }

        // ❌ Nie rób już clampu do dołu canvasa tutaj
        // Dół obsłużą platformy/ziemia + warunek przegranej w Game (worldHeight)

        player.recalculate();             // po przestawieniu na wszelki wypadek przeliczamy  krańce

        //ustawiamy odpowiednio animacje
        if (player.animator && player.animator.hasSheet())
            player.setAnimator(keys, dt);
    }

    setAnimator(keys, dt) {
        const player = this;
        if (!player.onGround) {
            player.currentAnimation = "jump";
        }
        else if (player.velocity.x !== 0) {
            player.currentAnimation = "walk";
        }
        else if (keys["ArrowDown"]) { //przygotowane do kucania
            player.currentAnimation = "die";
            player.velocity.x = 0;
        }
        else { //stoi w miejscu
            player.currentAnimation = "idle";
        }

        if (player.animator.current !== player.currentAnimation) {
            player.animator.play(player.currentAnimation);
        }
        player.animator.update(dt);
    }

    draw(ctx, camera) {
        const player = this;
        const screenX = player.x - camera.x; //wazne pozycja na ekranie z uwzglednieniem kamery. Nie ruszamy
        const screenY = player.y - camera.y;

        if (player.animator && player.animator.hasSheet()) { //jesli player jest animowany 
            const flip = player.facingLeft; // kierunek ryja
            player.animator.draw(ctx, screenX, screenY, flip); //rysuje konkretna klatke animacji ustawionej 
        } else {
            super.draw(ctx, camera); // jesli nie mamy animacji to rusza rusza rysowanie z rodzica (entity)
        }

        if (player.debug)
            player.showDebug(ctx, screenX, screenY, camera);
    }

    showDebug(ctx, screenX, screenY, camera) {
        const player = this;
        ctx.save();
        // ramka sprite’a (pełna klatka)
        ctx.strokeStyle = "rgba(0,255,255,0.8)";
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX, screenY, player.width, player.height);

        // ramka hitboxa faktycznego (Entity)
        const hb = player.getHitbox();
        ctx.save();
        ctx.strokeStyle = "rgba(255, 0, 34, 0.8)";
        ctx.lineWidth = 1;
        ctx.strokeRect(hb.x - camera.x, hb.y - camera.y, hb.width, hb.height);
        ctx.restore();
    }

    /**
     * Gdy gracz ginie odpowiednie ustawienia 
     * @param {*} obj - obiekt z ktory zabił 
     *
     */
    die(obj) {
        const player = this;
        player.isDead = true;
        player.deathTimer = 1.5; //czas animacji upadania ??
        player.velocity.x = 0;
        player.onGround = false;  //?
        player.currentAnimation = "die";   //aktualna animacja - animacja smierci
        player.animator.play("die");      //stawieni animacji
        player.lives--;                   //utrata kredytu zycia
        console.log("kolizja z przeciwnikiem");
    }

    /**
     * Ustalamy jak zderzyl sie player: od gory, dolu czy z ktoregoś boku  
     * @param {*} object - obiekt z ktorym nastopilo zderzenie 
     *
     */
    resolveCollision(object) {
        const player = this;

        // ile Player wszedł w obiekt
        const overlapX = Math.min(player.right - object.x, object.right - player.x);       //czy player jest po prawej stronie obiektu czy po lewej? mniejsza wartosc decyduje
        const overlapY = Math.min(player.bottom - object.y, object.bottom - player.y);    // czy powyzej czy ponizej

        if (overlapX < overlapY) {
            // kolizja pozioma
            if (player.center.x < object.center.x) {
                // Player z lewej strony
                player.x = object.x - player.width;
            } else {
                // Player z prawej strony
                player.x = object.right;
            }
            player.velocity.x = 0;
        } else {
            // kolizja pionowa
            if (player.center.y < object.center.y) {
                // Player uderzył w górną krawędź obiektu
                player.y = object.y - player.height;
                player.onGround = true;
            } else {
                // Player uderzył w dolną krawędź obiektu
                player.y = object.bottom;
            }
            player.velocity.y = 0;
        }
        player.recalculate();
    }

    /**
     * Sprawdzamy czy player jest powyzej obiektu wybranego   
     * @param {*} object - czy powyzej tego obiektu? 
     *
     */
    isAboaveThe(object) {
        const player = this;
        if (!object) throw ("Nie ma z czym porównac: (brak Object)");
        return this.center.top < object.top
    }
    isBelowThe(object) {
        const player = this;
        if (!object) throw ("Nie ma z czym porównac (brak Object)");
        return player.bottom > object.bottom
    }

}

