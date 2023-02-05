import {Entity} from './entity.js';
import {EnemyTank} from "./EnemyTank.js";

export class Bullet extends Entity {
    move_x ; //TODO: реализовать разное направление пуль
    move_y ;
    speed = 10;
    size_x = 6;
    size_y = 6;
    damage;
    name = "bullet";

    constructor(id, physicManager, soundManager, player, click) {
        super(id, physicManager, soundManager);
    }
    draw(spriteManager, ctx){
        spriteManager.drawSprite(ctx, 'big_bullet', this.pos_x, this.pos_y);
    }
    update(){
        this.physicManager.update(this);
    }
    onTouchEntity(entity){
        if(entity.name === "Enemy_Tank" || entity.name === "Player") {
            entity.decHealth(this.damage);
        }

        if( entity.name === "Player"){
            this.soundManager.play("probitie.mp3");
        }
        this.soundManager.play("bullet_collision.wav");
        this.kill();
    }
    onTouchMap(){
        this.kill();
        this.soundManager.play("bullet_collision.wav");

    }
    kill(){ // Уничтожения объекта
        this.physicManager.gameManager.kill(this);

    }
}