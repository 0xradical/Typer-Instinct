/// <reference path="../lib/typings/core-js.d.ts" />
/// <reference path="../lib/typings/phaser.d.ts" />
/// <reference path="Game.ts" />

module WordPresenter {
    export class Manager {
        constructor(private playerState: PlayerState) { }

        update() {
            this.updateMenu();
            if(this.playerState.bufferText !== null) this.updateInput();
        }

        updateMenu() {
            let player = this.playerState.player;
            // let toOutput: { [key: string]: string } = player.matcher.currentCommandStrings;
            // for (let key in toOutput) {
            //     this.playerState.texts[key].setText(toOutput[key]);
            // }
        }

        updateInput() {
            let toOutput = this.playerState.bufferText;
            this.playerState.texts['input'].setText(toOutput);
        }
    }
}
