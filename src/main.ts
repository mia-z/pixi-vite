import { 
	Application, 
	Renderer, 
	BatchRenderer, 
	TickerPlugin, 
	AppLoaderPlugin, 
	InteractionManager, 
	Graphics, 
	Text,
	LINE_JOIN, 
	LINE_CAP, 
	DisplayObject,
	Container,
	LineStyle,
	Sprite,
	autoDetectRenderer,
} from "pixi.js";

import coin from "./public/coin.svg";
import sword from "./public/gladius.svg";
import enemy from "./public/skull-white-detail.svg";
import potion from "./public/health-potion.svg";
import shield from "./public/shield.svg";

import "./styles/styles.css";

import TileSprite from "./abstractions/TileSprite";
import TileGravityAndCollision from "./gamelogic/TileGravityAndCollision";
import { TileFactory } from "./factories/TileFactory";
import { EnemyTile } from "./Components/EnemyTile";

let InitialLoadComplete: boolean = false;

let gWidth = window.innerWidth > 475 ? 475 : window.innerWidth; //Width to use
let gHeight = window.innerHeight > 750 ? 750 : window.innerHeight; //Height to use

let b = document.getElementById("body");
const container = document.getElementById("container");
console.log(gWidth);
console.log(gHeight);



export var HEIGHT = window.screen.availHeight > 750 ? 750 : window.screen.availHeight;
export const WIDTH = window.screen.availWidth > 475 ? 475 : window.screen.availWidth;
if (HEIGHT < 750) {
	HEIGHT = Math.floor(HEIGHT - (window.screen.availWidth/6));
}
const app = new Application({
	width: WIDTH,
	height: HEIGHT,
	backgroundColor: 0x303030,
	//resolution: window.devicePixelRatio || 1,
});

document.body.appendChild(app.view);

//Might use this later
// var TileContainer = new Container();
// TileContainer.width = app.screen.width;
// TileContainer.height = app.screen.height;
// TileContainer.x = 0;
// TileContainer.y = app.screen.height - app.screen.width;

//HUD
const hud: Graphics = new Graphics();
hud.x = 0;
hud.y = 0;
hud.lineStyle(2, 0x323232, 1);
hud.beginFill(0x3F3F3F)
hud.drawRect(0, 0, WIDTH, HEIGHT - ((WIDTH / 6) * 6));
app.stage.addChild(hud);

var gold: number = 0;
const goldText: Text = new Text(`${gold}`, { fontSize: 24, fill: 0xFF0000 });
goldText.x = 20;
goldText.y = 20;
app.stage.addChild(goldText);

const widthText: Text = new Text(`w:${WIDTH} - h:${HEIGHT} - new:${HEIGHT / window.devicePixelRatio}`, { fontSize: 24, fill: 0xFF0000 });
goldText.x = 100;
goldText.y = 20;
app.stage.addChild(widthText);

const getChildByName = (name: string) => {
	return app.stage.children.find((t: DisplayObject) => {
		const ts = t as TileSprite;
		return ts.name === name;
	});
}

app.loader.add("sword", sword);
app.loader.add("coin", coin);
app.loader.add("healthPotion", potion);
app.loader.add("shield", shield);
app.loader.add("skull", enemy);

var tiles: Array<TileSprite> = [];

var isDragging = false;

app.stage.addListener("startDragging", (args: { id: number, offset: number }) => {
	isDragging = true;
	const tile = app.stage.children.find((t: DisplayObject) => {
		const ts = t as TileSprite;
		return ts.id == args.id 
	});
	updateSelectionLine(tile as TileSprite);
});

app.stage.addListener("stopDragging", (args) => {
	isDragging = false;
	points = [];
	selectionLine.position.x = 0;
	selectionLine.position.y = 0;
	fillLine.position.x = 0;
	fillLine.position.y = 0;
	app.stage.removeChild(selectionLine);
	app.stage.removeChild(fillLine);
	app.stage.removeChild(getChildByName("startPoint")!);
	app.stage.removeChild(getChildByName("joiningPoint")!);
	if (selectedTiles.length > 2)
		replaceTiles();
	else 
		selectedTiles = [];
});

app.stage.addListener("addOverTile", (args) => {
	if (isDragging) {
		const tile = app.stage.children.find((t: DisplayObject) => {
			const ts = t as TileSprite;
			return ts.id == args.id 
		});
		if (!selectedTiles.some(x => x === tile)) { //Check if this is a valid tile
			updateSelectionLine(tile as TileSprite);
		} else if (selectedTiles.length > 1) { //Check if this is the previously selected tile
			if (args.id == selectedTiles[selectedTiles.length - 2].id) {
				selectedTiles.pop();
				points.pop();
				updateSelectionLine(selectedTiles[selectedTiles.length - 1], true);
			}
		}
	}
	
});

const addTile = (tile: TileSprite) => {
	selectedTiles.push(tile);
}

var selectedTiles: Array<TileSprite> = [];
var points: Array<Array<number>> = [];
var selectionLine: Graphics;
var fillLine: Graphics;
var currentTileType: string | null = null;

const updateSelectionLine = (obj: TileSprite, remove = false) => {
	if (selectionLine) {
		selectionLine.destroy();
		fillLine.destroy();
	}

	selectionLine = new Graphics();
	selectionLine.name = "line";
	let ops = { color: 0, width: 0, cap: LINE_CAP.ROUND, join: LINE_JOIN.ROUND, alignment: 0 };
	ops.color = 0x000000;
	ops.width = 18;
	ops.cap = LINE_CAP.ROUND;
	ops.join = LINE_JOIN.ROUND;
	ops.alignment = 0.5;
	selectionLine.position.x = 0;
	selectionLine.position.y = 0;
	selectionLine.lineStyle(ops);
	app.stage.addChild(selectionLine);	

	fillLine = new Graphics();
	fillLine.name = "line";
	let fOps = { color: 0, width: 0, cap: LINE_CAP.ROUND, join: LINE_JOIN.ROUND, alignment: 0 };
	fOps.color = 0xFFFFFF;
	fOps.width = 7;
	fOps.cap = LINE_CAP.ROUND;
	fOps.join = LINE_JOIN.ROUND;
	fOps.alignment = 0.5;
	fillLine.position.x = 0;
	fillLine.position.y = 0;
	fillLine.lineStyle(fOps);
	app.stage.addChild(fillLine);

	if (points.length < 1) {
		selectionLine.moveTo(obj.x, obj.y);
		fillLine.moveTo(obj.x, obj.y);
		currentTileType = obj.tileType;
		points.push([obj.x, obj.y]);
		addTile(obj);
	} else {
		let xDistanceDiff = obj.x - points[points.length - 1][0];
		let yDistanceDiff = obj.y - points[points.length - 1][1];

		if (yDistanceDiff > 85 || yDistanceDiff < -(85) || xDistanceDiff > 85 || xDistanceDiff < -(85)) {
			console.log("DISTANCE TOO LARGE");
			selectionLine.moveTo(points[0][0], points[0][1]);
			fillLine.moveTo(points[0][0], points[0][1]);
			points.forEach(point => {
				selectionLine.lineTo(point[0], point[1]);
				fillLine.lineTo(point[0], point[1]);
			});
		} else if (obj.tileType !== currentTileType && 
				!(obj.tileType == "enemy" && currentTileType == "combat") && 
				!(obj.tileType == "combat" && currentTileType == "enemy")) {
			console.log("WRONG TILE TYPE");
			selectionLine.moveTo(points[0][0], points[0][1]);
			fillLine.moveTo(points[0][0], points[0][1]);
			points.forEach(point => {
				selectionLine.lineTo(point[0], point[1]);
				fillLine.lineTo(point[0], point[1]);
			});
		} else {
			if (!remove) {
				addTile(obj);
				points.push([obj.x, obj.y]);
			}

			selectionLine.moveTo(points[0][0], points[0][1]);
			fillLine.moveTo(points[0][0], points[0][1]);

			points.forEach(point => {
				selectionLine.lineTo(point[0], point[1]);
				fillLine.lineTo(point[0], point[1]);
			});

		}
	}
}

const replaceTiles = () => { //Happens after the player makes a move (removes their finger from dragging)
	console.log(selectedTiles);
	gold += selectedTiles.length;
	goldText.text = `${gold}`;

	const tilesToReplace: TileSprite[] = [];

	const baseDamage = 3 + selectedTiles.filter(x => x.tileName === "sword").length;

	selectedTiles.forEach((tile, index) => {
		switch(tile.tileType) {
			case "enemy": 
				let currentTile = tile as EnemyTile;
				currentTile.updateHp(baseDamage);
				if (currentTile.currentHp <= 0) {
					app.stage.removeChild(tile);
					tilesToReplace.push(tile);
				}
				break;
			default: 
				app.stage.removeChild(tile);
				tilesToReplace.push(tile);
				break;
		}
	});
	
	//This probably isnt gonna be pretty
	let sideLength = Math.floor(WIDTH / 6);
	let col1, col2, col3, col4, col5, col6;
	col1 = tilesToReplace.filter(x => x.x === (sideLength / 2) * 1);
	col2 = tilesToReplace.filter(x => x.x === (sideLength / 2) + sideLength);
	col3 = tilesToReplace.filter(x => x.x === (sideLength / 2) + (sideLength * 2));
	col4 = tilesToReplace.filter(x => x.x === (sideLength / 2) + (sideLength * 3));
	col5 = tilesToReplace.filter(x => x.x === (sideLength / 2) + (sideLength * 4));
	col6 = tilesToReplace.filter(x => x.x === (sideLength / 2) + (sideLength * 5));

	col1.forEach((t, index) => {
		let newTile = TileFactory(t.id, 0, 250 + (-(70) * (index + 1)));
		app.stage.addChild(newTile);
	});
	col2.forEach((t, index) => {
		let newTile = TileFactory(t.id, sideLength, 250 + (-(70) * (index + 1)));
		app.stage.addChild(newTile);
	});
	col3.forEach((t, index) => {
		let newTile = TileFactory(t.id, sideLength * 2, 250 + (-(70) * (index + 1)));
		app.stage.addChild(newTile);
	});
	col4.forEach((t, index) => {
		let newTile = TileFactory(t.id, sideLength * 3, 250 + (-(70) * (index + 1)));
		app.stage.addChild(newTile);
	});
	col5.forEach((t, index) => {
		let newTile = TileFactory(t.id, sideLength * 4, 250 + (-(70) * (index + 1)));
		app.stage.addChild(newTile);
	});
	col6.forEach((t, index) => {
		let newTile = TileFactory(t.id, sideLength * 5, 250 + (-(70) * (index + 1)));
		app.stage.addChild(newTile);
	});

	col1 = [];
	col2 = [];
	col3 = [];
	col4 = [];
	col5 = [];
	col6 = [];

	selectedTiles = [];
}

export const tileBoardMask: Graphics = new Graphics();
tileBoardMask.beginFill(0x000000);
tileBoardMask.drawRect(0, HEIGHT - ((WIDTH / 6) * 6), 475, (WIDTH / 6) * 6);

export const sideLength = Math.floor(WIDTH / 6);

let rect = new Graphics();
rect.lineStyle(2, 0x000000, 1);
rect.drawRect(0, 0, WIDTH, HEIGHT);
app.stage.addChild(rect);

app.loader.load(() => {
	InitialLoadComplete = true;

	app.renderer.plugins.interaction.moveWhenInside = true;


	let c = 0;
	for (let x = 0; x < 6; x++) {
		for (let y = 0; y < 6; y++) {
			let t = TileFactory(c, x*sideLength, y*sideLength);
			tiles.push(t);
			app.stage.addChild(t);
			c++;
		}
	}

	app.ticker.add(delta => {
		TileGravityAndCollision(app.stage.children.filter(x => x.name === "gameTile") as Container[]);
	});
});
