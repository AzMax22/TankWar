import {Entity} from './Entity.js';
import {Bullet} from './Bullet.js';
import {Boom} from "./Boom.js";

export class Player extends Entity {
    name = "Player";
    max_lifetime = 100;
    lifetime = this.max_lifetime;
    move_x = 0; //движение
    move_y = 0;
    eventsManager;

    direct_x ; // направление
    direct_y;

    speed = 5;

    delay_gun = 10;
    curr_delay_gun = 0;
    damage = 25;

    curr_sprite = 0;
    num_sprite = 8;

    constructor(id, physicManager, soundManager) {
        super(id, physicManager, soundManager);
    }

    draw(spriteManager, ctx) {
        //his._currentSpirte = this._currentSpirte % 2 + 1;

        ctx.save();
        let x = this.direct_x;
        let y = this.direct_y;

        ctx.translate(this.pos_x,this.pos_y);
        ctx.rotate(-(Math.PI/2) * (1 + y + x * (x + 1)));

        spriteManager.drawSprite(ctx, "gt_" + this.curr_sprite, 0, 0);
        ctx.restore();

    }
    update(){


        //определение движения
        this.move_x = 0;
        this.move_y = 0;
        if (this.eventsManager.action['up']) this.move_y = -1;
        if (this.eventsManager.action['down']) this.move_y = 1;
        if (this.eventsManager.action['left']) this.move_x = -1;
        if (this.eventsManager.action['right']) this.move_x = 1;
        this.fire(this.eventsManager.action['fire']);

        //запоминаем направление
        if (this.move_x + this.move_y !== 0){
            // меняем размеры
            if(Math.abs(this.direct_x + this.move_x ) === 1){
                [this.size_x, this.size_y] = [this.size_y, this.size_x]
            }
            this.direct_x = this.move_x;
            this.direct_y = this.move_y;
        }

        //обновление спрайтов
        if (this.move_x !== 0 || this.move_y !== 0) this.curr_sprite++;
        if(this.curr_sprite >= this.num_sprite){
            this.curr_sprite = 0;
        }

        //физика движения
        this.physicManager.update(this);
    }

    onTouchEntity(obj){
        if(obj.name === "BonusHealth"){
            this.incHealth(obj.val);
            this.soundManager.play("bonus.wav");
            obj.kill();
        }

        if(obj.name === "BonusDamage"){
            this.incDamage(obj.val);
            this.soundManager.play("bonus.wav");
            obj.kill();
        }
    }

    kill(){ // Уничтожения объекта
        if (this.physicManager.gameManager.game_end === true){
            return;
        }
        this.soundManager.play("boom.mp3");

        this.physicManager.gameManager.kill(this);
        this.physicManager.gameManager.player = null;

        let boom = new Boom(this.physicManager.gameManager.genIdObj(), this.physicManager, this.soundManager);
        boom.pos_x = this.pos_x;
        boom.pos_y = this.pos_y;
        this.physicManager.gameManager.entities.push(boom);
        this.physicManager.gameManager.gameOver(false);
    }

    incHealth(val){
        this.lifetime += val;
        if(this.lifetime > this.max_lifetime){
            this.lifetime = this.max_lifetime;
        }
    }

    incDamage(val){
        this.damage += val;
    }

    decHealth(val){
        this.lifetime -= val;
        if(this.lifetime <= 0){
            this.kill();
        }
    }

    fire(bool_act){
        if(!(this.curr_delay_gun === 0 && bool_act === true)){
            if (this.curr_delay_gun !== 0){ this.curr_delay_gun -= 1}
            return;
        }

        this.soundManager.play("gun.wav");

        let b = new Bullet(this.physicManager.gameManager.genIdObj(), this.physicManager, this.soundManager);
        b.damage = this.damage;
        b.move_x = this.direct_x;
        b.move_y = this.direct_y;

        switch (b.move_x + 2*b.move_y){
            case -1: // выстрел влево
                b.pos_x = this.pos_x - b.size_x - Math.floor(this.size_x/2);
                b.pos_y = this.pos_y;
                break;
            case 1: // выстрел вправо
                b.pos_x = this.pos_x + b.size_x + Math.floor(this.size_x/2);
                b.pos_y = this.pos_y;
                break;
            case -2: // выстрел вверх
                b.pos_x = this.pos_x ;
                b.pos_y = this.pos_y -  Math.floor((b.size_y  + this.size_y)/2);
                break;
            case 2: // выстрел вниз
                b.pos_x = this.pos_x ;
                b.pos_y = this.pos_y + b.size_y + Math.floor(this.size_y/2);
                break;
            default: return;
        }

        this.curr_delay_gun = this.delay_gun;
        this.physicManager.gameManager.entities.push(b);
    }
}