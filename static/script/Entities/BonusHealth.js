import {Entity} from './entity.js';


export class BonusHealth extends Entity{
    name = "BonusHealth";
    val = 25;
    curr_sprite = 0;
    num_sprite = 16;

    constructor(id, physicManager, soundManager) {
        super(id, physicManager, soundManager);
    }

    draw(spriteManager, ctx){
        spriteManager.drawSprite(ctx, 'health_' + this.curr_sprite, this.pos_x, this.pos_y);
    }

    update(){

        this.curr_sprite++;

        if(this.curr_sprite >= this.num_sprite){
            this.curr_sprite = 0;
        }
    }

    kill(){
        this.physicManager.gameManager.score += 50;
        this.physicManager.gameManager.kill(this);
    }

}