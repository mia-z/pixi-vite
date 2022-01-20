import { Sprite,
    Texture, 
    Circle, 
    Graphics, 
    DisplayObject,
    Application
} from "pixi.js";

import { Random } from "../utils";

let sideLength = window.innerWidth / 6;

const TileTypeGenerator = () => {
    let r = Random(1, 5);
    switch(r) {
        case 1: return [ "sword", "combat" ];
        case 2: return [ "coin", "currency" ];
        case 3: return [ "healthPotion", "healing" ];
        case 4: return [ "shield", "defence" ];
        case 5: return [ "skull", "combat" ];
        default: throw new Error("INVALID RANDOM NUMBER")
    }
}

export class TileSprite extends Sprite { 
    tileType: string;
    tileName: string;
    gravity: number;
    id: number;
    constructor(id: number, xPos: number, yPos: number, sideLength: number, appContext: Application) {
        super();
        let seed = TileTypeGenerator();
        this.texture = Texture.from(seed[0]);
        this.tileType = seed[1];
        this.tileName = seed[0]; 
        this.width = sideLength;
        this.height = sideLength;
        this.anchor.set(0.5, 0.5)
        this.x = xPos + (sideLength / 2);
        this.y = yPos;
        this.gravity = 0.4;
        this.interactive = true;
        this.id = id;
        this.name = "gameTile";
        this.on('pointerdown', this.onDragStart);
		this.on('pointerup', this.onDragEnd);
		this.on('pointerupoutside', this.onDragEnd);
		this.on('pointermove', this.onDragMove);
        this.hitArea = new Circle(0, 0, (sideLength / 5) * 4);
        
        let mask = new Graphics();
        mask.beginFill(0x000000);
        mask.drawRect(0, appContext.screen.height - ((appContext.screen.width / 6) * 6), 500, 622);
        this.mask = mask;

        // // Debug hitbox draw
        // let box = new Graphics();
        // box.lineStyle(2, 0xFFFFFF, 1);
        // box.moveTo(-sideLength, -sideLength);
        // box.lineTo(-sideLength, sideLength);
        // box.lineTo(sideLength, sideLength);
        // box.lineTo(sideLength, -sideLength);
        // box.lineTo(-sideLength, -sideLength);
        // this.addChild(box);
    }

    onDragStart(event: any) {
        console.log("down");
        event.currentTarget.parent.emit("startDragging", { id: this.id, offset: this.x - (sideLength / 2) });
    }

    onDragEnd(event: any) {
        console.log("up");
        event.currentTarget.parent.emit("stopDragging", { id: this.id, offset: this.x - (sideLength / 2) });
    }

    onDragMove(event: any) {
        let { x, y } = event.data.global;
        let bounds = this.getBounds();
        if (x > bounds.x && x < bounds.x + bounds.width && y > bounds.y && y < bounds.y + bounds.height) {
            event.currentTarget.parent.emit("addOverTile", { id: this.id, offset: this.x - (sideLength / 2) });
        }

    }
};

export default TileSprite;