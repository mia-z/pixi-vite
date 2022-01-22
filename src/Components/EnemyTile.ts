import { Text } from "pixi.js";
import TileSprite from "../abstractions/TileSprite";

export class EnemyTile extends TileSprite {
    maxHp: number;
    currentHp: number;
    enemyLevel: number;
    enemyDamage: number;
    hpGraphic: Text = new Text(``);

    constructor(id: number, xPos: number, yPos: number, seed: [string, string]) {
        super(id, xPos, yPos, seed);
        this.maxHp = 10;
        this.currentHp = this.maxHp;
        this.enemyDamage = 1;
        this.enemyLevel = 1;
        //Add listener for updating hp values

        this.initStartHp();
    }

    initStartHp() {
        this.hpGraphic.x -= this.width - (this.width / 5);
        this.hpGraphic.y += this.height - (this.width / 2);
        this.hpGraphic.text = `${this.currentHp}`;
        this.hpGraphic.style.fill = [ "#e46767", "#f05151" ];
        this.hpGraphic.style.stroke = "#413e3e";
        this.hpGraphic.style.strokeThickness = 1;
        this.hpGraphic.style.fontSize = 36;
        this.hpGraphic.style.dropShadow = true;
        this.hpGraphic.style.dropShadowAlpha = 0.4;
        this.hpGraphic.style.dropShadowBlur = 8;
        this.hpGraphic.style.dropShadowDistance = 2;
        this.addChild(this.hpGraphic);
    }

    updateHp(damage: number) {
        this.currentHp -= damage;
        this.hpGraphic.text = `${this.currentHp}`;
    }
}