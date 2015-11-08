/// <reference path="../lib/typings/core-js.d.ts" />
/// <reference path="../lib/typings/phaser.d.ts" />
/// <reference path="Fighting.ts" />

interface StateFunction { (); }

class Game {
  static run(playerName: string) {
    return new Game(playerName);
  }

  commandKeyMap: { [key: number]: Fighting.Command };
  player: Fighting.Player = null;
  chain: Fighting.CommandChain = null;

  game: Phaser.Game = null;
  bmpText: Phaser.BitmapText = null;
  lastKey: Phaser.Key = null;

  finished: boolean = false;

  constructor(playerName: string) {
    this.commandKeyMap = {
      [Phaser.Keyboard.A]: new Fighting.Command("Soco", (player) => {
        player.opponent.damageBy(10);
      }),
      [Phaser.Keyboard.S]: new Fighting.Command("Chute", (player) => {
        player.opponent.damageBy(8);
      }),
      [Phaser.Keyboard.D]: new Fighting.Command("Pulo", (player) => {
        player.opponent.damageBy(1);
      }),
      [Phaser.Keyboard.F]: new Fighting.Command("Agacha", (player) => {
        player.opponent.damageBy(1);
      }),
      [Phaser.Keyboard.G]: new Fighting.Command("Bloqueia", (player) => {
        player.opponent.damageBy(20);
      }),
      [Phaser.Keyboard.H]: new Fighting.Command("Cancela", (player) => {
        player.opponent.damageBy(15);
      })
    }

    this.player = new Fighting.Player(playerName, {
      onDamage: (value) => {
        this.bmpText.setText("Tomou " + value + " de dano");
      },
      onDeath: (player) => {
        this.bmpText.setText("Se lascou");
        this.finished = true;
      }
    });

    for (let key in this.commandKeyMap) {
      this.player.commandMap.add(this.commandKeyMap[key]);
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
      if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
        if(this.chain != null) {
          this.chain.trigger();
          this.chain = null;
        }

        return;
      }

      for (let key in this.commandKeyMap) {
        if(this.game.input.keyboard.isDown(key)) {
          if(this.chain == null) {
            this.chain = this.player.newChain();
          }

          this.chain.push(this.commandKeyMap[key]);
        }
      }
    }
  }

  get render(): StateFunction {
    return () => {
      // game.debug.bodyInfo(ground, 0, 0);
    }
  }
}
