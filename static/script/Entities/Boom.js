import {Entity} from './Entity.js';

export class Boom extends Entity{
    name = "boom";
    curr_sprite = 0;

    constructor(id,physicManager,soundManager) {
        super(id, physicManager, soundManager);
    }

    draw(spriteManager, ctx){
        spriteManager.drawSprite(ctx, this.name + "_" + this.curr_sprite, this.pos_x, this.pos_y);
    }

    update(){
        if(this.curr_sprite === 2){
            this.kill();
            return;
        }
        this.curr_sprite++;
    }

    kill(){
        this.physicManager.gameManager.kill(this);
    }

}