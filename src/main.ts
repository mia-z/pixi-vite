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
	DisplayObject
} from "pixi.js";

import "./styles/styles.css";

Renderer.registerPlugin('batch', BatchRenderer);
Renderer.registerPlugin('interaction', InteractionManager);
Application.registerPlugin(AppLoaderPlugin);
Application.registerPlugin(TickerPlugin);

import TileSprite from "./abstractions/TileSprite";
import TileGravityAndCollision from "./gamelogic/TileGravityAndCollision";

let InitialLoadComplete: boolean = false;

let gWidth = window.innerWidth > 475 ? 475 : window.innerWidth; //Width to use
let gHeight = window.innerHeight > 750 ? 750 : window.innerHeight; //Height to use

let b = document.getElementById("body");
const container = document.getElementById("container");

const app = new Application({
	width: gWidth,
	height: gHeight,
	backgroundColor: 0x303030,
	//resolution: window.devicePixelRatio || 1,
	//resizeTo: window
});

container?.appendChild(app.view);

//Might use this later
// var TileContainer = new Container();
// TileContainer.width = app.screen.width;
// TileContainer.Height = app.screen.height;
// TileContainer.x = 0;
// TileContainer.y = app.screen.height - app.screen.width;

//HUD
const hud: Graphics = new Graphics();
hud.x = 0;
hud.y = 0;
hud.lineStyle(2, 0x323232, 1);
hud.beginFill(0x3F3F3F)
hud.drawRect(0, 0, app.screen.width, app.screen.height - ((app.screen.width / 6) * 6));
app.stage.addChild(hud);

const gold: number = 0;
const goldText: Text = new Text(`${gold}`, { fontSize: 24, fill: 0xFF0000 });
goldText.x = 20;
goldText.y = 20;
app.stage.addChild(goldText);

const getChildByName = (name: string) => 
	app.stage.children.find(x => x.name === name);

app.loader.add("sword", "./assets/gladius.svg");
app.loader.add("coin", "./assets/coin.svg");
app.loader.add("healthPotion", "./assets/health-potion.svg");
app.loader.add("shield", "./assets/shield.svg");
app.loader.add("skull", "./assets/skull-white-detail.svg");

var tiles: Array<TileSprite> = [];

app.stage.addListener("startDragging", (args: { id: number, offset: number }) => {
	const tile: TileSprite | undefined = app.stage.children.find<TileSprite>((t: TileSprite) => t.id == args.id) as TileSprite;
	updateSelectionLine(tile);
});

app.stage.addListener("stopDragging", (args) => {
	points = [];
	selectionLine.position.x = 0;
	selectionLine.position.y = 0;
	fillLine.position.x = 0;
	fillLine.position.y = 0;
	app.stage.removeChild(selectionLine);
	app.stage.removeChild(fillLine);
	app.stage.removeChild(getChildByName("startPoint"));
	app.stage.removeChild(getChildByName("joiningPoint"));
	if (selectedTiles.length > 2)
		replaceTiles();
	else 
		selectedTiles = [];
});

app.stage.addListener("addOverTile", (args) => {
	let tile = app.stage.children.find(t => t.id == args.id);
	if (!selectedTiles.some(x => x === tile)) { //Check if this is a valid tile
		updateSelectionLine(tile);
	} else if (selectedTiles.length > 1) { //Check if this is the previously selected tile
		if (args.id == selectedTiles[selectedTiles.length - 2].id) {
			selectedTiles.pop();
			points.pop();
			updateSelectionLine(selectedTiles[selectedTiles.length - 1], true);
		}
	}
});

const addTile = (tile) => {
	selectedTiles.push(tile);
}

var selectedTiles = [];
var points = [];
var selectionLine;
var fillLine;
var currentTileType = null;

const updateSelectionLine = (obj, remove = false) => {
	if (selectionLine) {
		selectionLine.destroy();
		fillLine.destroy();
	}

	selectionLine = new Graphics();
	selectionLine.name = "line";
	let ops = {};
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
	let fOps = {};
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

		if (obj.x == points[points.length - 1][0] && obj.y == points[points.length - 1][1]) {
			console.log("back step");
		}

		if (yDistanceDiff > 85 || yDistanceDiff < -(85) || xDistanceDiff > 85 || xDistanceDiff < -(85)) {
			console.log("DISTANCE TOO LARGE");
			selectionLine.moveTo(points[0][0], points[0][1]);
			fillLine.moveTo(points[0][0], points[0][1]);
			points.forEach(point => {
				selectionLine.lineTo(point[0], point[1]);
				fillLine.lineTo(point[0], point[1]);
			});
		} else if (obj.tileType !== currentTileType) {
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

const replaceTiles = () => {
	console.log(selectedTiles);
	gold += selectedTiles.length;
	goldText.text = `${gold}`;
	selectedTiles.forEach((tile, index) => {
		app.stage.removeChild(tile);
	});
	
	//This probably isnt gonna be pretty
	let sideLength = Math.floor(app.screen.width / 6);
	let col1, col2, col3, col4, col5, col6;
	col1 = selectedTiles.filter(x => x.x === (sideLength / 2) * 1);
	col2 = selectedTiles.filter(x => x.x === (sideLength / 2) + sideLength);
	col3 = selectedTiles.filter(x => x.x === (sideLength / 2) + (sideLength * 2));
	col4 = selectedTiles.filter(x => x.x === (sideLength / 2) + (sideLength * 3));
	col5 = selectedTiles.filter(x => x.x === (sideLength / 2) + (sideLength * 4));
	col6 = selectedTiles.filter(x => x.x === (sideLength / 2) + (sideLength * 5));

	col1.forEach((t, index) => {
		let newTile = new TileSprite(t.id, 0, 250 + (-(70) * (index + 1)), sideLength, app);
		app.stage.addChild(newTile);
	});
	col2.forEach((t, index) => {
		let newTile = new TileSprite(t.id, sideLength, 250 + (-(70) * (index + 1)), sideLength, app);
		app.stage.addChild(newTile);
	});
	col3.forEach((t, index) => {
		let newTile = new TileSprite(t.id, sideLength * 2, 250 + (-(70) * (index + 1)), sideLength, app);
		app.stage.addChild(newTile);
	});
	col4.forEach((t, index) => {
		let newTile = new TileSprite(t.id, sideLength * 3, 250 + (-(70) * (index + 1)), sideLength, app);
		app.stage.addChild(newTile);
	});
	col5.forEach((t, index) => {
		let newTile = new TileSprite(t.id, sideLength * 4, 250 + (-(70) * (index + 1)), sideLength, app);
		app.stage.addChild(newTile);
	});
	col6.forEach((t, index) => {
		let newTile = new TileSprite(t.id, sideLength * 5, 250 + (-(70) * (index + 1)), sideLength, app);
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

let rect = new Graphics();
rect.lineStyle(2, 0x000000, 1);
rect.drawRect(0, 0, app.screen.width, app.screen.height);
app.stage.addChild(rect);

app.loader.load(() => {
	InitialLoadComplete = true;

	app.renderer.plugins.interaction.moveWhenInside = true;

	let sideLength = Math.floor(app.screen.width / 6);

	let c = 0;
	for (let x = 0; x < 6; x++) {
		for (let y = 0; y < 6; y++) {
			let t = new TileSprite(c, x*sideLength, y*sideLength, sideLength, app);
			tiles.push(t);
			app.stage.addChild(t);
			c++;
		}
	}

	app.ticker.add(delta => {
		TileGravityAndCollision(app.stage.children.filter(x => x.name === "gameTile"));
	});
});

console.log(app.screen.width)