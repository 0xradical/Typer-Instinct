/// <reference path="../lib/typings/core-js.d.ts" />
/// <reference path="../lib/typings/phaser.d.ts" />
/// <reference path="Game.ts" />



interface Window {
    blah: string;
}

// declare var window: any;

class StringPresenter {

  bmpText: Phaser.BitmapText = null;

  constructor(private game: Game) { }

  update() {
      // this.bmpText = this.game.add.bitmapText(20, 20, 'mainFont', "FIGHT", 16);
      // let a = String(10);
      this.game.bmpText.text = window.blah;
      // console.log('arst');
  }


    // get preload(): StateFunction {
    // }
}
