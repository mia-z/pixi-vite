const Random = (min: number, max: number): number => Math.floor(Math.random() * (max-min + 1) + min);

const TileTypeGenerator = (): [string, string] => {
    let r = Random(1, 5);
    switch(r) {
        case 1: return [ "sword", "combat" ];
        case 2: return [ "coin", "currency" ];
        case 3: return [ "healthPotion", "healing" ];
        case 4: return [ "shield", "defence" ];
        case 5: return [ "skull", "enemy" ];
        default: throw new Error("INVALID RANDOM NUMBER")
    }
}

export {
    Random,
    TileTypeGenerator
};