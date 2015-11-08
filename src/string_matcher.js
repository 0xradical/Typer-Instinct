var StringMatcher = {
  setupWords: function() {
    window.ALLOWED_COMMANDS = [
      'punch',
      'kick',
      'jump',
      'squat',
      'block',
      'special',
      'cancel'
    ];

    window.NUM_COMMANDS = 7;
    window.currentWords = {};
    window.currentMatchLevels = {};
    for(var i = 0; i < window.NUM_COMMANDS; ++i) {
      StringMatcher.setupWord(window.ALLOWED_COMMANDS[i]);
    }
  },

  setupWord: function(index) {
    window.currentWords[index] = StringMatcher.getRandomWord();;
    window.currentMatchLevels[index] = 0.0;
    StringMatcher.updateLabel(index);
  },

  updateLabels: function() {
    for(var i = 0; i < window.NUM_COMMANDS; ++i) {
      StringMatcher.updateLabel(window.ALLOWED_COMMANDS[i]);
    }
  },

  updateLabel: function(index) {
    var wordLabel = document.getElementById('word-' + index),
      wordMatchLevel = document.getElementById('match-level-' + index);

    wordLabel.innerHTML = window.currentWords[index];
    wordMatchLevel.innerHTML = window.currentMatchLevels[index];
  },

  updateMatchLevelsFromInput: function() {
    var elem = document.getElementById('player-input'),
      matchLevels = StringMatcher.matchLevels(window.currentWords, elem.value);

    for(var i = 0; i < window.NUM_COMMANDS; ++i) {
      var idx = window.ALLOWED_COMMANDS[i],
        matchLevel = matchLevels[idx],
        matchLevelLabel = document.getElementById('match-level-' + idx);

      window.currentMatchLevels[idx] = matchLevel;
    }

    // console.log(elem.value);
    StringMatcher.updateLabels();

  },

  handleUserSubmission: function() {
    for(var i = 0; i < window.NUM_COMMANDS; ++i) {
      var idx = window.ALLOWED_COMMANDS[i];
      if(window.currentMatchLevels[idx] == 1.0) {
        StringMatcher.commandCompleted(idx);
        StringMatcher.setupWord(idx);
      }
    }
    document.getElementById('player-input').value = '';
    StringMatcher.updateMatchLevelsFromInput();
  },

  commandCompleted: function(command) {
    console.log('Command completed: ' + command)
  },

  matchLevels: function(currentWords, partialStr) {
    // returns match percentage (if 1.0, full match)
    var partialStrLength = partialStr.length,
      currentWordsLength = currentWords.length,
      result = {};

    for(var idx in currentWords) {
      if(currentWords.hasOwnProperty(idx)) {
        var candidate = currentWords[idx];
        if(candidate.indexOf(partialStr) == 0) {
          result[idx] = partialStrLength / candidate.length;
        } else {
          result[idx] = 0.0;
        }
      }
    }

    return result;
  },

  getRandomWord: function(wordLength) {
    if(!wordLength) {
      var minLength = 3,
        maxLength = 8;
      wordLength = StringMatcher.randInt(minLength, maxLength);
    }

    var numPossibilities = WordsDatabase[wordLength].length,
      chosenIndex = StringMatcher.randInt(0, numPossibilities - 1);

    return WordsDatabase[wordLength][chosenIndex];
  },

  randInt: function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },

  iterateObject: function(obj, f) {
    for(var idx in obj) {
      if(obj.hasOwnProperty(idx)) {
        f(idx, obj[idx]);
      }
    }
  }
};
