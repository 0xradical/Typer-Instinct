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
            let toOutput:    { [key: string]: string }  = player.matcher.currentCommandStrings;
            let matchLevels: { [key: string]: number }  = player.matcher.currentMatchLevels;
            for (let key in toOutput) {
                this.playerState.texts[key].setText(toOutput[key]);
                if (matchLevels[key] != 0.0) {
                    this.playerState.texts[key].clearColors()
                    this.playerState.texts[key].addColor('#00ff00', 0);
                    this.playerState.texts[key].addColor('#ff0000', matchLevels[key] * toOutput[key].length);
                } else {
                    this.playerState.texts[key].clearColors()
                }
            }
        }

        updateInput() {
            let toOutput = this.playerState.bufferText;
            this.playerState.texts['input'].setText(toOutput);
        }
    }
}
