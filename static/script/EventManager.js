export class EventManager {
    bind = {};
    action = {fire: false};
    func1;
    func2;

    constructor(){
        this.bind[38] = 'up';
        this.bind[37] = 'left';
        this.bind[40] = 'down';
        this.bind[39] = 'right';
        this.bind[32] = 'fire';

        this.addEventListener();
    }

    onKeyDown (event) {
        const action = this.bind[event.keyCode];
        if (action) {
            this.action[action] = true;

            if(action === "up" || action === "down"){
                this.action['right'] = false;
                this.action['left'] = false;
            }

            if(action === "right" || action === "left"){
                this.action['up'] = false;
                this.action['down'] = false;
            }

        }
    }

    onPressDo(func){
        document.body.addEventListener('keydown', func);
    }


    onKeyUp (event) {
        const action = this.bind[event.keyCode];
        if (action) {
            this.action[action] = false;
        }
    }

    removeEventListener(){
        document.body.removeEventListener('keydown', this.func1);
        document.body.removeEventListener('keyup', this.func2);
    };

    clearAction(){
        this.action =  {fire: false};
    }

    addEventListener(){
        this.func1 = this.onKeyDown.bind(this);
        this.func2 = this.onKeyUp.bind(this);

        document.body.addEventListener('keydown', this.func1);
        document.body.addEventListener('keyup', this.func2);
    }
}