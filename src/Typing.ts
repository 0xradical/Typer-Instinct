/// <reference path="../lib/typings/core-js.d.ts" />

module Typing {
    export interface Dictionary {
        language: string;
        nextWord(): Word;
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
