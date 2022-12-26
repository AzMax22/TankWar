import {Player} from './Entities/player.js';
import {BonusHealth} from './Entities/BonusHealth.js';
import {BonusDamage} from './Entities/BonusDamage.js';
import {Bullet} from './Entities/bullet.js';
import {EnemyTank} from './Entities/EnemyTank.js';

import {MapManager} from '/script/MapManager.js';
import {SpriteManager} from '/script/SpriteManager.js';
import {EventManager} from '/script/EventManager.js';
import {PhysicManager} from '/script/PhysicManager.js';
import {SoundManager} from '/script/SoundManager.js';


export class GameManager{
    factory = {};
    entities = [];
    idCount = 0;
    player = null;
    laterKill = [];
    game_end = false;
    f_win;
    size_map = {x:null, y:null};
    map_loaded = false;
    level = 1;
    max_level = 2;
    n_enemy = 0;
    score = 0;
    player_name = localStorage["username"];
    data_score;

    sounds = ["gun.wav", "bonus.wav", "kill.mp3","boom.mp3", "probitie.mp3", "bullet_collision.wav", "bg.mp3"];


    constructor(canvas, level) {
        document.getElementById('name_player').textContent = localStorage.getItem('username');
        console.log(this.player_name);
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.currentLevel = level;

        this.factory['Player'] = Player;
        this.factory['BonusHealth'] = BonusHealth;
        this.factory['BonusDamage'] = BonusDamage;
        this.factory['bullet'] = Bullet;
        this.factory['Enemy_Tank'] = EnemyTank;
        this.eventsManager = new EventManager();

        this.soundManager = new SoundManager();
        this.soundManager.loadArray(this.sounds);
        this.soundManager.play("bg.mp3",{looping: true});

        this.loadLevel(level);
        this.spriteManager = new SpriteManager();
        this.loadScore();


    }

    loadScore(){
        const path = `/asset/score.json`;
        const request = new XMLHttpRequest();
        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status === 200) {
                this.data_score = JSON.parse(request.responseText);
            }
        };
        request.open('GET', path, true);
        request.send();
    }

    updateScore(){
        const path = `/asset/score.json`;
        const request = new XMLHttpRequest();
        request.open('POST', path, true);
        request.setRequestHeader("Content-Type", "application/json");
        request.send( JSON.stringify(this.data_score));
    }


    loadLevel(level = 1){
        document.getElementById('level').textContent = String(level);

        this.map_loaded = false;

        this.entities = [];
        this.player = null;
        this.n_enemy = 0;

        this.mapManager = new MapManager(level, this.canvas);
        this.size_map = this.mapManager.getSizeMap();
        this.physicManager = new PhysicManager(this, this.mapManager);
        this.mapManager.draw(this.ctx);
        this.mapManager.drawOverLayer(this.ctx);
        this.mapManager.parseEntities(this, this.physicManager, this.soundManager);
    }

    initPlayer (obj) {
        this.player = obj;
        this.player.eventsManager = this.eventsManager;
    }

    genIdObj(){
        return this.idCount++;
    }

    drawObj() {
        for(let e = 0; e < this.entities.length; e++) {
            this.entities[e].draw(this.spriteManager, this.ctx);
        }
    }

    update(){

        if(this.map_loaded === false) {
            return;
        }

        //обновление данных GUI
        document.getElementById('score').textContent = String(this.score);
        if(this.player !== null) {
            document.getElementById('HP').textContent = String(this.player.lifetime);
            document.getElementById('DMG').textContent = String(this.player.damage);
        } else{
            document.getElementById('HP').textContent = "0";
        }


        if(this.n_enemy === 0 && this.game_end === false){
            this.gameOver(true);
        }

        //обновление всех объектов
        this.entities.forEach((e) => {
            try {
                e.update();
            } catch(ex) {
                console.log(ex);
            }
        });

        // удаление мертвых
        for(let i = 0; i < this.laterKill.length; i++) {
            const idx = this.entities.indexOf(this.laterKill[i]);
            if(idx > -1) {
                this.entities.splice(idx, 1);
            }
        }

        if(this.laterKill.length > 0) {
            this.laterKill.length = 0;
        }


        this.mapManager.draw(this.ctx);
        this.drawObj(this.ctx);
        this.mapManager.drawOverLayer(this.ctx);

        if(this.game_end === true){
            this.showEndText(this.f_win);
        }


    }

    kill(obj){
        this.laterKill.push(obj);
    }

    play(){
        this.interval = setInterval(this.update.bind(this), 100);
    }


    printText(text, size , x, y, lineWidth){
        let ctx = this.ctx;

        ctx.save();
        ctx.font = size + "px monospace";
        ctx.shadowColor="black";
        ctx.shadowBlur=1;
        ctx.lineWidth=lineWidth;
        ctx.strokeText(text,x,y);
        ctx.shadowBlur=0;
        ctx.fillStyle="white";
        ctx.fillText(text,x,y);
        //this.ctx.fillText("Game Over", 10, 50);
        ctx.restore();
    }

    newLevel(){
        document.body.removeEventListener('keydown', this.func);
        this.eventsManager.addEventListener();
        this.game_end = false;

        this.loadLevel(this.level);
    }

    showEndText(f_win){
        if(f_win ===false ){
            this.printText("Game Over", 50, this.size_map.x / 2 - 4*32+16, this.size_map.y / 2 - 2*32, 4);
        } else {
            this.printText("You Win", 50, this.size_map.x / 2 - 3*32, this.size_map.y / 2 - 2*32, 4);
        }

        this.printText("Press to play", 25, this.size_map.x / 2 - 3*32, this.size_map.y / 2 , 2);
    }


    gameOver(f_win){
        this.f_win = f_win;
        this.game_end = true;

        if (!this.data_score[this.player_name] || this.data_score[this.player_name] < this.score){
            this.data_score[this.player_name] = this.score;
        }

        this.updateScore()

        if(f_win === false){
            this.level = 1;
            this.score = 0;
        }else{
            this.level ++;
            if (this.level > this.max_level){
                this.level = 1;
            }
        }


        this.eventsManager.removeEventListener();
        this.eventsManager.clearAction();
        this.func = this.newLevel.bind(this);
        setTimeout(this.eventsManager.onPressDo.bind(),2000,this.func);


    }

}