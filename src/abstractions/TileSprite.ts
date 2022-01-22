import { Texture, 
    Circle, 
    Sprite
} from "pixi.js";

import { tileBoardMask, sideLength } from "../main";

export class TileSprite extends Sprite {
    tileType: string;
    tileName: string;
    gravity: number;
    id: number;

    constructor(id: number, xPos: number, yPos: number, seed: [string, string]) {
        super();
        this.sortDirty = true;
        this.texture = Texture.from(seed[0]);
        this.tileType = seed[1];
        this.tileName = seed[0]; 
        this.width = sideLength;
        this.height = sideLength;
        this.anchor.set(0.5, 0.5);
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
        this.mask = tileBoardMask;

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