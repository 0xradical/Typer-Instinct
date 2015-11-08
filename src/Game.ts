/// <reference path="../lib/typings/core-js.d.ts" />
/// <reference path="../lib/typings/phaser.d.ts" />
/// <reference path="Fighting.ts" />
/// <reference path="StringPresenter.ts" />

interface StateFunction { (); }

class Game {
    static run(playerName: string) {
        return new Game(playerName);
    }

    player: Fighting.Player = null;
    stringPresenter: StringPresenter = null;

    game: Phaser.Game = null;
    bmpText: Phaser.BitmapText = null;

    finished: boolean = false;
    buffer: string[] = [];

    constructor(playerName: string) {
        this.player = new Fighting.Player(playerName, {
            onDamage: (value) => {
                this.bmpText.setText("Tomou " + value + " de dano");
            },
            onDeath: (player) => {
                this.bmpText.setText("Se lascou");
                this.finished = true;
            }
        });

        for (let key in Fighting.COMMANDS) {
            this.player.commandMap.add(Fighting.COMMANDS[key]);
        }

        this.game = new Phaser.Game(512, 223, Phaser.AUTO, '', {
            preload: this.preload, create: this.create,
            update: this.update, render: this.render
        });
    }

    get preload(): StateFunction {
        return () => {
            this.game.load.spritesheet('background', 'assets/background.png', 512, 223);
            this.game.load.spritesheet('ground', 'assets/ground.png', 512, 30);
            this.game.load.bitmapFont('mainFont', 'assets/font.png', 'assets/font.fnt');

            this.game.input.keyboard.addCallbacks(null, null, (e: KeyboardEvent) => {
                if (e.keyCode === Phaser.Keyboard.BACKSPACE) {
                    this.buffer.pop();
                } else {
                    this.buffer.push(String.fromCharCode(e.charCode));
                    let match = false; // this.player.matcher.run(this.buffer.join(''));
                    if (match) {
                        this.buffer.length = 0;
                    }
                }
            });
        };
    }

    get create(): StateFunction {
        return () => {
            this.game.add.sprite(0, 0, 'background');
            this.bmpText = this.game.add.bitmapText(20, 20, 'mainFont', "FIGHT", 16);
        }
    }

    get update(): StateFunction {
        return () => {
            this.player.tick();
            this.stringPresenter.update();
        }
    }

    get render(): StateFunction {
        return () => {
            // game.debug.bodyInfo(ground, 0, 0);
        }
    }
}


