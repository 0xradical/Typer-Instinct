/// <reference path="../lib/typings/core-js.d.ts" />
/// <reference path="../lib/typings/phaser.d.ts" />
/// <reference path="words_db/words3.ts" />
/// <reference path="words_db/words4.ts" />
/// <reference path="words_db/words5.ts" />
/// <reference path="words_db/words6.ts" />
/// <reference path="words_db/words7.ts" />
/// <reference path="words_db/words8.ts" />
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
    for (let key of StringMatcher.ALLOWED_COMMANDS) {
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
    this.updateLabel(key);
  }

  updateLabels() {
    for (let key of StringMatcher.ALLOWED_COMMANDS) {
      this.updateLabel(key);
    }
  }

  updateLabel(key: string) {
    let wordLabel = document.getElementById('word-' + key);
    let wordMatchLabel = document.getElementById('match-level-' + key);

    wordLabel.innerHTML = this.currentCommandStrings[key];
    wordMatchLabel.innerHTML = this.currentMatchLevels[key].toString();
  }

  updateMatchLevelsFromInput() {
    let input = this.getInputText();
    let levels = this.matchLevels(input);

    for (let key of StringMatcher.ALLOWED_COMMANDS) {
      let matchLevel = levels[key];
      let matchLevelLabel = document.getElementById('match-level-' + key);
      this.currentMatchLevels[key] = matchLevel;
    }

    this.updateLabels();
  }

  handleUserSubmission() {
    for (let key of StringMatcher.ALLOWED_COMMANDS) {
    if (this.currentMatchLevels[key] == 1.0) {
      this.commandCompleted(key);
      this.setupWord(key);
    }
    }

    this.setInputText('');
    this.updateMatchLevelsFromInput();
  }

  commandCompleted(command: string) {
    console.log('Command completed: ' + command);
  }

  matchLevels(partialStr: string): {[key: string]: number} {
  let partialStrLength = partialStr.length;
  let result: {[key: string]: number} = {};

  for(let key of StringMatcher.ALLOWED_COMMANDS) {
    let candidate = this.currentCommandStrings[key];
    if(candidate.indexOf(partialStr) == 0) {
    result[key] = partialStrLength / candidate.length;
    } else {
    result[key] = 0.0;
    }
  }

  return result;
  }

  getRandomWord(wordLength?): string {
  if(!wordLength) {
    let minLength = 3,
      maxLength = 8;
    wordLength = this.randInt(minLength, maxLength);
  }

  let numPossibilities = WordsDatabase[wordLength].length,
    chosenIndex = this.randInt(0, numPossibilities - 1);

  return WordsDatabase[wordLength][chosenIndex];
  }

  randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  get commandStrings(): string[] {
    return ['a'];
  }

}
