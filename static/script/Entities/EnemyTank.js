import {Entity} from './Entity.js';
import {Bullet} from "./Bullet.js";
import {Boom} from "./Boom.js";


export class EnemyTank extends Entity {
    name = "Enemy_Tank";
    lifetime = 75;
    move_x = 0;
    move_y = 0;
    direct_x ; // направление
    direct_y;
    speed = 4.5;
    delay_gun = 10;
    curr_delay_gun = 0;
    drt_player = null;

    curr_sprite = 0;
    num_sprite = 8;

    constructor(id, physicManager, soundManager) {
        super(id, physicManager, soundManager);
    }

    draw(spriteManager, ctx){

        ctx.save();
        let x = this.direct_x;
        let y = this.direct_y;

        ctx.translate(this.pos_x,this.pos_y);
        ctx.rotate(-(Math.PI/2) * (1 + y + x * (x + 1)));

        spriteManager.drawSprite(ctx, "bt_" + this.curr_sprite, 0, 0);
        ctx.restore();
    }

    checkPlayer(player){ // есть ли игрок в поле зрения (по гориз-ли и верт-ли)
        if(player === null){return null}

        let p_x = player.pos_x;
        let p_y = player.pos_y;

        let x_l = this.pos_x - Math.floor(this.size_x / 2);
        let x_r = this.pos_x + Math.floor(this.size_x / 2);
        let y_u = this.pos_y - Math.floor(this.size_y / 2);
        let y_d = this.pos_y + Math.floor(this.size_y / 2);

        let drt_x = 0;
        let drt_y = 0;

        let mapManager = this.physicManager.gameManager.mapManager;

        // определяем в каком направлении игрок
        // по вертикали
        if( p_x <= x_r && p_x >= x_l ){
            if(p_y < this.pos_y){
                drt_y = -1;
            } else{
                drt_y = 1;
            }

            for (let curr_y = this.pos_y; drt_y * curr_y < drt_y * p_y; curr_y = curr_y + drt_y * 32){
                if (mapManager.getTilesetIdx( this.pos_x,curr_y, "walls") !== 0) return false;
            }
        }

        // по горизонтали
        if( p_y <= y_d && p_y >= y_u){
            if(p_x < this.pos_x){
                drt_x = -1;
            } else{
                drt_x = 1;
            }
            for (let curr_x = this.pos_x; drt_x * curr_x < drt_x * p_x; curr_x = curr_x + drt_x * 32){
                if (mapManager.getTilesetIdx( curr_x, this.pos_y, "walls") !== 0) return false;
            }

        }

        if(drt_x === 0 && drt_y === 0){ // нет игрока в поле зрения
            return null;
        }


        return {x:drt_x, y:drt_y};


    }

    update(){
        //обновление спрайтов
        this.curr_sprite++;
        if(this.curr_sprite >= this.num_sprite){
            this.curr_sprite = 0;
        }

        // AI

        this.drt_player = this.checkPlayer(this.physicManager.gameManager.player)
        if (this.drt_player){

            //меняем направление в сторону игрока
            this.direct_x = this.drt_player.x;
            this.direct_y = this.drt_player.y;

            this.speed = 5.5;

            this.fire();
        }else{
            this.speed = 4.5;
        }

        //движение по направлениею
        this.move_x = this.direct_x;
        this.move_y = this.direct_y;

        this.physicManager.update(this);
    }

    onTouchEntity(obj){


    }

    onTouchMap(idx){
        if(this.direct_x !== 0 && this.drt_player === null){this.direct_x *= -1;}
        if(this.direct_y !== 0 && this.drt_player === null){this.direct_y *= -1;}
    }

    kill(){ // Уничтожения объекта
        this.physicManager.gameManager.kill(this);

        this.soundManager.play("kill.mp3");
        this.soundManager.play("boom.mp3");


        let boom = new Boom(this.physicManager.gameManager.genIdObj(), this.physicManager, this.soundManager);
        boom.pos_x = this.pos_x;
        boom.pos_y = this.pos_y;
        this.physicManager.gameManager.score += 100;
        this.physicManager.gameManager.entities.push(boom);
        this.physicManager.gameManager.n_enemy--;
    }

    decHealth(val){
        this.lifetime -= val;
        if(this.lifetime <= 0){
            this.kill();
        }
    }

    fire(){
        if(this.curr_delay_gun !== 0){
            this.curr_delay_gun -= 1;
            return;
        }
        this.soundManager.play("gun.wav");

        let b = new Bullet(this.physicManager.gameManager.genIdObj(), this.physicManager, this.soundManager);
        b.damage = 25;
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