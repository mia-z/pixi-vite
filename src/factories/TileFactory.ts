import TileSprite from "../abstractions/TileSprite";
import { EnemyTile } from "../Components/EnemyTile";
import { TileTypeGenerator } from "../utils";

export const TileFactory = (id: number, x: number, y: number): TileSprite => {
    const tt = TileTypeGenerator();
    switch(tt[1]) {
        case "enemy": return new EnemyTile(id, x, y, tt);
        default: return new TileSprite(id, x, y, tt);
    }
}