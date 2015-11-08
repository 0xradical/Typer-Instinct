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
    'crouch',
    'block',
    'special',
  ];

  static NUM_COMMANDS = 6;

  currentCommandStrings: { [key: string]: string } = {};
  currentMatchLevels: { [key: string]: number } = {};
  typingField: string;

  constructor() {
    for (let key of StringMatcher.ALLOWED_COMMANDS) {
      this.setupWord(key);
    }
  }

  setupWord(key: string) {
    this.currentCommandStrings[key] = this.getRandomWord();
    this.currentMatchLevels[key] = 0.0;
  }

  updateTypingField(content: string) {
    this.typingField = content.toLowerCase();
    // document.getElementById('player-input').value = content;
    return this.handleUserSubmission();
  }

  getInputText(): string {
    return this.typingField;
  }

  setInputText(value: string) {
    // this.updateTypingField(value);
    // this.typingField = value;
    // console.log(this.getInputText());
  }

  handleUserSubmission(): boolean {
    let input = this.getInputText(),
      levels = this.matchLevels(input),
      success = false;

    for (let key of StringMatcher.ALLOWED_COMMANDS) {
      let matchLevel = levels[key];
      this.currentMatchLevels[key] = matchLevel;

      if (matchLevel == 1.0) {
        success = true;
        this.commandCompleted(key);
        this.setupWord(key);
        this.setInputText('');
      }
    }

    console.log(this.currentMatchLevels);

    return success;
  }

  commandCompleted(command: string) {
    console.log('Command completed: ' + command);
  }

  matchLevels(partialStr: string): {[key: string]: number} {
    console.log('matchLevels');
    console.log(partialStr);
    let partialStrLength = partialStr.length,
      result: {[key: string]: number} = {};

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
}
