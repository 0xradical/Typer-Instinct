/// <reference path="../lib/typings/core-js.d.ts" />
/// <reference path="../lib/typings/phaser.d.ts" />
/// <reference path="Fighting.ts" />
/// <reference path="WordPresenter.ts" />

interface StateFunction { (); }

class PlayerState {
    constructor(
        public player?: Fighting.Player, 
        public presenter?: WordPresenter.Manager,
        public texts?: { [key: string]: Phaser.BitmapText },
        public bufferText: string = null) {}
}

const WIDTH = 512;
const HEIGHT = 233;

class Game {
    static run(playerName: string) {
        return new Game(playerName);
    }

    player: Fighting.Player;
    opponent: Fighting.Player;
    local: PlayerState;
    remote: PlayerState;

    game: Phaser.Game = null;

    finished: boolean = false;
    buffer: string[] = [];

    constructor(playerName: string) {
        this.player = new Fighting.Player(playerName, {
            onDamage: (value) => {
                // noop
            },
            onDeath: (player) => {
                this.finished = true;
            }
        });

        for (let key in Fighting.COMMANDS) {
           this.player.commandMap.add(Fighting.COMMANDS[key]);
        }

        this.game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'game-div', {
            preload: this.preload, create: this.create,
            update: this.update, render: this.render
        });
    }

    get preload(): StateFunction {
        return () => {
            this.game.load.spritesheet('background', 'assets/background.png', WIDTH, HEIGHT);
            this.game.load.spritesheet('ground', 'assets/ground.png', WIDTH, 30);
            this.game.load.bitmapFont('mainFont', 'assets/font.png', 'assets/font.fnt');

            this.game.input.keyboard.addCallbacks(null, null, (e: KeyboardEvent) => {
                if (e.keyCode === Phaser.Keyboard.BACKSPACE) {
                    this.buffer.pop();
                } else {
                    this.buffer.push(String.fromCharCode(e.charCode));
                    this.local.bufferText = this.buffer.join('');
                    let match = this.player.matcher.run(this.local.bufferText);
                    if (match) {
                        this.buffer.length = 0;
                        this.local.bufferText = '';
                    }
                }
            });
        };
    }

    get create(): StateFunction {
        return () => {
            this.game.add.sprite(0, 0, 'background');
            this.local = this.initLocal(this.player);
            //this.remote = this.initRemote();
        }
    }

    get update(): StateFunction {
        return () => {
            this.player.tick();
            this.local.presenter.update();
            //this.remote.presenter.update();
        }
    }

    get render(): StateFunction {
        return () => {
            // game.debug.bodyInfo(ground, 0, 0);
        }
    }

    private initLocal(player: Fighting.Player): PlayerState {
        let local = new PlayerState();
        local.player = player;
        local.presenter = new WordPresenter.Manager(local);

        let texts: { [key: string]: Phaser.BitmapText } = {}, idx = 0;
        for (let key in Fighting.COMMANDS) {
            texts[key] = this.game.add.bitmapText(10, 20 + 20 * idx, 'mainFont', '', 16);
            idx++;
        }
        texts['input'] = this.game.add.bitmapText(10, 160, 'mainFont', '', 16);
        local.texts = texts;

        return local;
    }

    private initRemote(): PlayerState {
        return null;
        // let local = new PlayerState();
        // local.player = player;
        // local.presenter = this.initPresenter(local);

        // let texts: { [key: string]: Phaser.BitmapText } = {}, idx = 0;
        // for (let key in Fighting.COMMANDS) {
        //     texts[key] = this.game.add.bitmapText(10, 20 + 20 * idx, 'mainFont', '', 16);
        //     idx++;
        // }
        // texts['input'] = this.game.add.bitmapText(10, 160, 'mainFont', '', 16);
        // local.texts = texts;

        // return local;
    }
}


