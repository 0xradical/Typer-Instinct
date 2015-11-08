/// <reference path="../lib/typings/core-js.d.ts" />
/// <reference path="../lib/typings/phaser.d.ts" />
/// <reference path="Game.ts" />

interface HTMLElement {
    value: any;
}

class StringMatcher {
  static ALLOWED_COMMANDS = [
    'punch',
    'kick',
    'jump',
    'squat',
    'block',
    'special',
  ];

  static NUM_COMMANDS = 6;

  currentCommandStrings: { [key: string]: string } = {};
  currentMatchLevels: { [key: string]: number } = {};

  constructor() {
    for(let key of StringMatcher.ALLOWED_COMMANDS) {
      this.setupWord(key);
    }
  }

  getInputText(): string {
    return document.getElementById('player-input').value;
  }

  setInputText(value: string) {
    document.getElementById('player-input').value = value;
  }

  setupWord(key: string) {
    this.currentCommandStrings[key] = this.getRandomWord();
    this.currentMatchLevels[key] = 0.0;
    // this.updateLabel(key);
  }

  updateMatchLevelsFromInput(input: string) {
    let levels = this.matchLevels(input);
  }

  matchLevels(input: string): { [key: string]: number } {
    this.currentCommandStrings; // ...
    return { 'a': 10 };
  }
}
