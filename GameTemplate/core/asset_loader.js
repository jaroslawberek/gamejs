export const assetsToLoad = {
    player: "assets/goblin.png",
    // enemy: "img/enemy.png",
    platform: "assets/platform.png"
};

export const assets = {};

export function loadAssets(callback) {
    const keys = Object.keys(assetsToLoad);
    let loaded = 0;

    if (keys.length === 0) {
        console.log("Nie było zasobów do załadowania");
        callback(); // brak assetów, start od razu
        return;
    }

    keys.forEach(key => {
        const img = new Image();
        img.src = assetsToLoad[key];
        img.onload = () => {
            assets[key] = img;
            loaded++;
            if (loaded === keys.length) {
                console.log("Wszystkie zasoby gotowe ✅");
                callback();
            }
        };
    });
}
