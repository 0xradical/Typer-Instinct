/// <reference path="../lib/typings/core-js.d.ts" />
/// <reference path="../lib/typings/phaser.d.ts" />
/// <reference path="Fighting.ts" />
/// <reference path="WordPresenter.ts" />

interface StateFunction { (); }

class PlayerState {
    constructor(
        public player?: Fighting.Player,
        public presenter?: WordPresenter.Manager,
        public texts?: { [key: string]: Phaser.Text },
        public labels?: { [key: string]: Phaser.Text },
        public bufferText: string = null) {}
}

const WIDTH = 1324;
const HEIGHT = 466;

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

    private _playerSprite: Phaser.Sprite;
    private _groundSprite: Phaser.Sprite;
    private _opponentSprite: Phaser.Sprite;

    constructor(playerName: string) {
        this.player = new Fighting.Player(playerName, {
            onDamage: (value) => {
                // noop
            },
            onDeath: (player) => {
                this.finished = true;
            },
            onAnimate: (state) => {
            }
        });
        this.player.matcher = new StringMatcher();

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
            this.game.load.spritesheet('background', 'assets/background.png', 1024, 466);
            this.game.load.spritesheet('ground', 'assets/ground2.png', 1024, 60);
            this.game.load.spritesheet('sabrewulf', 'assets/sabrewulf.png', 120, 100);

            this.game.input.keyboard.addCallbacks(null, (e: KeyboardEvent) => {
                if (e.keyCode === Phaser.Keyboard.BACKSPACE) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.buffer.pop();
                    this.local.bufferText = this.buffer.join('');
                    this.local.presenter.updateInput();
                }
            });

            this.game.input.keyboard.addCallbacks(null, null, null, (char: string, e: KeyboardEvent) => {
                if (e.keyCode === Phaser.Keyboard.BACKSPACE) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.buffer.pop();
                    this.local.bufferText = this.buffer.join('');
                    this.local.presenter.updateInput();
                } else {
                    this.buffer.push(char);
                    this.local.bufferText = this.buffer.join('');
                    let match = this.player.matcher.updateTypingField(this.local.bufferText);
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
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.add.sprite(150, 0, 'background');

            this._groundSprite = this.game.add.sprite(200, 360, 'ground');
            this._playerSprite = this.game.add.sprite(650, 50, 'sabrewulf');

            this.game.physics.arcade.enable(this._playerSprite);
            this.game.physics.arcade.enable(this._groundSprite);

            this._playerSprite.body.gravity.y = 2000;
            this._playerSprite.body.drag.x = 1700;

            this._playerSprite.body.velocity.x = 0;
            this._playerSprite.body.velocity.y = 0;

            this._groundSprite.body.moves = false;
            this._groundSprite.body.immovable = true;
            this._groundSprite.body.gravity.x = 0;
            this._groundSprite.body.gravity.y = 0;
            this._groundSprite.body.velocity.x = 0;
            this._groundSprite.body.velocity.y = 0;

            this.local = this.initLocal(this.player);
            //this.remote = this.initRemote();
        }
    }

    get update(): StateFunction {
        return () => {
            this.game.physics.arcade.collide(this._playerSprite, this._groundSprite);
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

        let texts: { [key: string]: Phaser.Text } = {};
        let labels: { [key: string]: Phaser.Text } = {};
        let idx = 0;
        let style = { font: "32px Courier New", fill: "#ff0000" };
        for (let key in Fighting.COMMANDS) {
            texts[key] = this.game.add.text(200, 20 + 40 * idx, '', style);
            texts[key].strokeThickness = 16;
            labels[key] =this.game.add.text(10, 20 + 40 * idx, key, style);
            labels[key].strokeThickness = 16;
            idx++;
        }
        texts['input'] = this.game.add.text(10, 320, '', style);
        local.texts = texts;
        local.labels = labels;

        return local;
    }

    private initRemote(): PlayerState {
        return null;
        // let local = new PlayerState();
        // local.player = player;
        // local.presenter = this.initPresenter(local);

        // let texts: { [key: string]: Phaser.BitmapText } = {}, idx = 0;
        // for (let key in Fighting.COMMANDS) {
        //     texts[key] = this.game.add.bitmapText(10, 20 + 20 * idx, 'Arial', '', 16);
        //     idx++;
        // }
        // texts['input'] = this.game.add.bitmapText(10, 160, 'Arial', '', 16);
        // local.texts = texts;

        // return local;
    }
}


