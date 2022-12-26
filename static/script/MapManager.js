export class MapManager {
    //imgLoadCount;
    canvas;

    constructor(level, canvas) {
        this.canvas = canvas;
        this.mapData = null;
        this.tLayer = {}; //словарь слоев
        this.xCount = 0; // ширина карты
        this.yCount = 0; // высота карты
        this.tSize = {x: 0, y: 0}; //размер блока
        this.mapSizePixel = {x: 0, y: 0}; //размер карты в пикселях
        this.tilesets = [];

        this.loadMap(level);
    }

    loadMap(level) {
        const path = `/asset/levels/level_${level}.tmj`;
        const request = new XMLHttpRequest();
        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status === 200) {
                this.parseMap(request.responseText);
            }
        };
        request.open('GET', path, true);
        request.send();
    }

    parseMap(tilesJSON) {
        this.mapData = JSON.parse(tilesJSON);
        this.xCount = this.mapData.width;
        this.yCount = this.mapData.height;
        this.tSize.x = this.mapData.tilewidth;
        this.tSize.y = this.mapData.tileheight;
        this.mapSizePixel.x = this.xCount * this.tSize.x;
        this.mapSizePixel.y = this.yCount * this.tSize.y;

        //resizeCanvas
        this.canvas.width = this.mapSizePixel.x ;
        this.canvas.height = this.mapSizePixel.y;
        document.getElementById('interface').style.left = this.mapSizePixel.x + 20 + "px";

        this.imgLoadCount = 0;

        for (let i = 0; i < this.mapData.tilesets.length; i++) {
            const img = new Image();

            img.onload = () => {
                this.imgLoadCount++;
                if (this.imgLoadCount ===
                    this.mapData.tilesets.length) {
                    this.imgLoaded = true;
                }
            };

            img.src = "asset" + this.mapData.tilesets[i].image.slice(2);
            const t = this.mapData.tilesets[i];
            const ts = {
                firstgid: t.firstgid,

                image: img,
                name: t.name,
                xCount: Math.floor(t.imagewidth / this.tSize.x),
                yCount: Math.floor(t.imageheight / this.tSize.y)
            };
            this.tilesets.push(ts);
        }
        this.jsonLoaded = true;
    }

    draw(ctx) {
        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(() => {
                this.draw(ctx);
            }, 100);
        } else {
            // находим все слои tilelayer
            if (Object.entries(this.tLayer).length === 0) {
                for (let id = 0; id < this.mapData.layers.length; id++) {
                    const layer = this.mapData.layers[id];
                    if (layer.type === 'tilelayer') {
                        this.tLayer[layer.name] = layer;
                    }
                }
            }

            // отрисовываем все слои tilelayer
            for (let name_layer in this.tLayer) {
                if (name_layer === "over_layer") continue;
                this._draw_layer(this.tLayer[name_layer], ctx);
            }
        }
    }

    drawOverLayer(ctx){
        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(() => {
                this.draw(ctx);
            }, 100);
        } else {
            this._draw_layer(this.tLayer["over_layer"], ctx);
        }
    }

    _draw_layer(layer, ctx){
        for (let i = 0; i < layer.data.length; i++) {
            if (layer.data[i] !== 0) {
                const tile = this.getTile(layer.data[i]);
                const pX = (i % this.xCount) * this.tSize.x;
                const pY = Math.floor(i / this.xCount) * this.tSize.y;
                ctx.drawImage(tile.img, tile.px, tile.py, this.tSize.x,
                    this.tSize.y, pX, pY, this.tSize.x, this.tSize.y);
            }
        }
    }

    getTile(tileIndex) {
        const tile = {
            img: null,
            px: 0, py: 0
        };
        const tileset = this.getTileset(tileIndex);
        tile.img = tileset.image;
        const id = tileIndex - tileset.firstgid;
        const x = id % tileset.xCount;
        const y = Math.floor(id / tileset.xCount);
        tile.px = x * this.tSize.x;
        tile.py = y * this.tSize.y;
        return tile;
    }

    getTileset(tileIndex) {
        for (let i = this.tilesets.length - 1; i >= 0; i--)
            if (this.tilesets[i].firstgid <= tileIndex) {
                return this.tilesets[i];
            }
        return null;
    }

    parseEntities(gameManager, physicManager, soundManager) {
        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(() => { this.parseEntities(gameManager, physicManager, soundManager); }, 100);
        } else{
            for (let j = 0; j < this.mapData.layers.length; j++)
                if(this.mapData.layers[j].type === 'objectgroup') {
                    const entities = this.mapData.layers[j];
                    for (let i = 0; i < entities.objects.length; i++) {
                        const e = entities.objects[i];
                        try {
                            const obj = new gameManager.factory[e.name](gameManager.genIdObj(), physicManager, soundManager);
                            obj.name = e.name;
                            this.biasCenterXY(obj, e);
                            obj.direct_x = this.getProperties(e, "direct_x");
                            obj.direct_y = this.getProperties(e, "direct_y");
                            obj.size_x = this.getProperties(e, "real_width");//e.properties[1].value; // width
                            obj.size_y = this.getProperties(e, "real_height");//e.properties[0].value; // height

                            gameManager.entities.push(obj);
                            if(obj.name === 'Player')
                                gameManager.initPlayer(obj);

                            if(obj.name === 'Enemy_Tank'){
                                gameManager.n_enemy++;
                            }

                        } catch (ex) {
                            console.log('Error while creating: [' + e.gid + '] ' + e.class +
                                ', ' + ex);
                        }
                    }
                }

            gameManager.map_loaded = true;
        }
    }

    getSizeMap(){
        return this.mapSizePixel;
    }

    biasCenterXY(obj, e){
        obj.pos_x = e.x + e.width/2;
        obj.pos_y = e.y + e.height/2;

        let bias_x = 0;
        let bias_y = 0;
        let drt_x = this.getProperties(e, "direct_x");
        let drt_y = this.getProperties(e, "direct_y");

        if ((drt_x === -1 && drt_y === 0)||
            (drt_x === 0 && drt_y === 1)){
            bias_x = -e.width;
        }

        if ((drt_x === 0 && drt_y === -1)||
            (drt_x === -1 && drt_y === 0)){
            bias_y = -e.height;
        }

        obj.pos_x += bias_x;
        obj.pos_y += bias_y;
    }

    getProperties(entity, name_prop){
        for(let prop of entity.properties){
            if(prop.name ===name_prop){
                return prop.value;
            }
        }
        return undefined;
    };

    getTilesetIdx(x, y, name_layer){
        const wX = x;
        const wY = y;
        const idx = Math.floor(wY / this.tSize.y) * this.xCount + Math.floor(wX / this.tSize.x);
        //console.log(this.tLayer[name_layer].data[idx]);
        return this.tLayer[name_layer].data[idx];
    }
}