/// <reference path="../lib/core-js.d.ts" />

module Typing {
    export interface Dictionary {
        language: string;
        nextWord(): Word;
    }

    export interface MatchCallback {
        (word: Word): void;
    }

    export class WordList {
        public onMatch: MatchCallback;
        private words: Word[];

        constructor(private dict: Dictionary, private size: number) {
            this.words = [];
            for (let i = 0; i < size; i++) {
                this.words.push(dict.nextWord());
            }
        }

        match(text: string): void {
            for (let word of this.words) {
                if (word.match(text)) {
                    this.onMatch(word);
                }
            }
        }
    }

    export class Word {
        private _length: number;

        constructor(private _text: string) {
            this._length = _text.length;
        }

        get difficulty(): number { return this._length }
        get text(): string { return this._text; }

        match(text: string): boolean {
            return this._text.startsWith(text);
        }
    }

}