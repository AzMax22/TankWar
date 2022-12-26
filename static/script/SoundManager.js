export class SoundManager{
    clips = {}; //звуки
    context = null;
    gainNode = null; // громкость
    loaded = false;

    global_volume = 0.4;

    constructor() {
        this.context = new AudioContext();
        this.context.resume();
        this.gainNode = this.context.createGain ?
            this.context.createGain() : this.context.createGainNode();
        this.gainNode.connect(this.context.destination);

    }

    load (name_file, callback) {
        const path = `/asset/sound/${name_file}`;

        if (this.clips[path]) {
            callback(this.clips[path]);
            return;
        }

        const clip = {path: path, buffer: null, loaded: false};

        clip.play =  (volume, loop) => {
            this.play(this.path, {looping: loop?loop:false,
                volume: volume?volume:1});
        };

        this.clips[path] = clip;
        const request = new XMLHttpRequest();
        request.open('GET', path, true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
            this.context.decodeAudioData(request.response,
                function (buffer) {
                    clip.buffer = buffer;
                    clip.loaded = true;
                    callback(clip);
                });
        };
        request.send();
    }

    loadArray(array) {
        for (let i = 0; i < array.length; i++) {
            this.load(array[i],  () => {
                if (array.length ===
                    Object.keys(this.clips).length) {
                    for (const sd in this.clips)
                        if (!this.clips[sd].loaded) return;
                    this.loaded = true;
                }
            });
        }
    }

    play (name_file, settings) {
        if (!this.loaded) {
            setTimeout(() => { this.play(name_file, settings); },
                1000);
            return;
        }
        const path = `/asset/sound/${name_file}`;
        let looping = false;
        let volume = this.global_volume;

        if (settings) {
            if (settings.looping!== undefined)
                looping = settings.looping;
            if (settings.volume !== undefined)
                volume = settings.volume;
        }
        const sd = this.clips[path];
        if (sd === null)
            return false;
        const sound = this.context.createBufferSource();
        sound.buffer = sd.buffer;
        sound.connect(this.gainNode);
        sound.loop = looping;
        this.gainNode.gain.value = volume;
        sound.start(0);
        return true;
    }

}