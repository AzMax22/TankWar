export class Entity {
    id;
    name;
    pos_x;
    pos_y;
    size_x;
    size_y;
    constructor(id, physicManager, soundManager) {
        this.id = id
        this.physicManager = physicManager;
        this.soundManager = soundManager;
    }
}