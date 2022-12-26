export class PhysicManager {
    constructor(gameManager, mapManager) {
        this.gameManager = gameManager;
        this.mapManager = mapManager;
    }
    update(obj) {
        if (obj.move_x === 0 && obj.move_y === 0)
            return 'stop';
        const newX = obj.pos_x + Math.floor(obj.move_x * obj.speed);
        const newY = obj.pos_y + Math.floor(obj.move_y * obj.speed);


        let edge_x1,edge_y1,edge_x2, edge_y2; //края obj

        if (obj.move_y !== 0){
            // края по верт. в соот. с движ
            edge_x1 = newX + obj.size_x / 2;
            edge_y1 = newY + obj.move_y * obj.size_y / 2;
            edge_x2 = newX - obj.size_x / 2;
            edge_y2 = edge_y1;

        } else {
            // края по горз. в соот. с движ
            edge_x1 = newX + obj.move_x * obj.size_x / 2;
            edge_y1 = newY + obj.size_y / 2;
            edge_x2 = edge_x1;
            edge_y2 = newY - obj.size_y / 2;
        }

        // обработка столкновения с обьектами //
        let e1 = this.entityAtXY(obj, edge_x1, edge_y1);
        let e2 = this.entityAtXY(obj, edge_x2, edge_y2);

        if (e1 === null) {e1 = e2; e2=null;}
            // таким образом если
            // e1 = null , e2 = null  =>  без разницы
            // only e_ = obj   =>  обьект будет в e1
            //  e1 = obj , e2 = obj  =>  столкновение будет только с e1

        if (e1 !== null && obj.onTouchEntity) {
            console.log(obj.name, e1.name);
            obj.onTouchEntity(e1);

            if(e1.name === "BonusHealth" || e1.name === "bullet"||e1.name === "BonusDamage"){//для того чтобы не стопорится на бонусах
                e1 = null;
            }

        }

        if(e2!==null &&(e2.name === "BonusHealth" || e2.name === "bullet"||e2.name === "BonusDamage")){//для того чтобы не стопорится на бонусах
            e2 = null;
        }


        // обработка столкновения со стенами //
        let idx_t1 = this.mapManager.getTilesetIdx(edge_x1,edge_y1, "walls");
        let idx_t2 = this.mapManager.getTilesetIdx(edge_x2, edge_y2, "walls");

        if (idx_t1 === 0) {idx_t1 = idx_t2;}

        if (idx_t1 !== 0 && obj.onTouchMap) {
            obj.onTouchMap(idx_t1);
        }

        if (obj.name === "bullet"){
            obj.pos_x = newX;
            obj.pos_y = newY;
        }

        if (idx_t1 === 0 && idx_t2 === 0 &&
            e1 === null && e2 === null) {
            obj.pos_x = newX;
            obj.pos_y = newY;
        } else {
            return 'break';
        }
        return 'move';
    }

    entityAtXY(obj, x_obj, y_obj) {
        for (let i = 0; i < this.gameManager.entities.length; i++) {
            let e = this.gameManager.entities[i];

            if (e.name !== obj.name) {
                let x_l = e.pos_x - Math.floor(e.size_x / 2);
                let x_r = e.pos_x + Math.floor(e.size_x / 2);
                let y_u = e.pos_y - Math.floor(e.size_y / 2);
                let y_d = e.pos_y + Math.floor(e.size_y / 2);

                if (x_obj >= x_l && x_obj <= x_r &&
                    y_obj >= y_u && y_obj <= y_d)
                    return e;
            }
        }
        return null;
    }
}