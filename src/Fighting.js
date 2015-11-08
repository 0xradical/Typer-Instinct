/// <reference path="../lib/typings/core-js.d.ts" />
/// <reference path="Utils.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Fighting;
(function (Fighting) {
    var NOOP = function () {
        var _ = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _[_i - 0] = arguments[_i];
        }
    };
})(Fighting || (Fighting = {}));
;
var LifeBar = (function () {
    function LifeBar(player, onDamage, onDeath) {
        this.percentage = 100;
        this.onDamage = onDamage;
        this.onDeath = onDeath;
    }
    Object.defineProperty(LifeBar.prototype, "alive", {
        get: function () { return this.percentage > 0; },
        enumerable: true,
        configurable: true
    });
    LifeBar.prototype.damageBy = function (percentage) {
        this.percentage -= percentage;
        if (this.alive) {
            this.onDamage(this.percentage);
        }
        else {
            this.onDeath(this.player);
        }
    };
    return LifeBar;
})();
exports.LifeBar = LifeBar;
;
var Command = (function () {
    function Command(_name, _action) {
        if (_action === void 0) { _action = NOOP; }
        this._name = _name;
        this._action = _action;
    }
    Command.prototype.attachTo = function (player) {
        return new AttachedCommand(this._name, this._action, player);
    };
    Object.defineProperty(Command.prototype, "name", {
        get: function () { return this._name; },
        enumerable: true,
        configurable: true
    });
    return Command;
})();
exports.Command = Command;
var AttachedCommand = (function (_super) {
    __extends(AttachedCommand, _super);
    function AttachedCommand(_name, _action, player) {
        _super.call(this, _name, _action);
        this.player = player;
    }
    AttachedCommand.prototype.trigger = function () {
        this._action(this.player);
    };
    return AttachedCommand;
})(Command);
exports.AttachedCommand = AttachedCommand;
var CommandChain = (function () {
    function CommandChain(player) {
        this.player = player;
        this.commands = [];
    }
    CommandChain.prototype.push = function (command) {
        this.commands.push(command.attachTo(this.player));
        return this;
    };
    CommandChain.prototype.trigger = function () {
        var length = this.commands.length;
        var comboStart = 0;
        for (var i = 0; i < length; i++) {
            this.commands[i].trigger();
            var combo = Combo.find(this.commands.slice(comboStart, i));
            if (combo != null) {
                combo.trigger(this.player);
                comboStart = i + 1;
            }
        }
    };
    return CommandChain;
})();
exports.CommandChain = CommandChain;
var Combo = (function () {
    function Combo(_name, commands, action) {
        this._name = _name;
        this.commands = commands;
        this.action = action;
        Combo.combos[_name] = this;
    }
    Combo.find = function (commands) {
        for (var name_1 in this.combos) {
            var combo = this.combos[name_1];
            if (Utils.arrayEquals(combo.commands, commands)) {
                return combo;
            }
        }
        return null;
    };
    Combo.prototype.trigger = function (player) {
        this.action(player);
    };
    Combo.combos = {};
    return Combo;
})();
exports.Combo = Combo;
var CommandMap = (function () {
    function CommandMap() {
        this.validCommands = {};
        this.commandKeys = [];
    }
    CommandMap.prototype.add = function (command) {
        var key = command.name;
        if (!this.validCommands[command.name]) {
            this.validCommands[command.name] = command;
            this.commandKeys.push(command.name);
        }
        return this;
    };
    Object.defineProperty(CommandMap.prototype, "keys", {
        get: function () { return this.commandKeys; },
        enumerable: true,
        configurable: true
    });
    CommandMap.prototype.get = function (key) {
        return this.validCommands[key];
    };
    return CommandMap;
})();
exports.CommandMap = CommandMap;
exports.TICKS_PER_STATE = 60;
var Player = (function () {
    function Player(_name, callbacks) {
        this._name = _name;
        this._commandMap = new CommandMap();
        this._lifeBar = new LifeBar(this, callbacks.onDamage || NOOP, callbacks.onDeath || NOOP);
    }
    Object.defineProperty(Player.prototype, "name", {
        get: function () { return this._name; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "state", {
        get: function () { return this._state; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "ticks", {
        get: function () { return this._ticks; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "matcher", {
        get: function () { return this._matcher; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "commandMap", {
        get: function () { return this._commandMap; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "opponent", {
        get: function () { return this._opponent; },
        set: function (opponent) { this._opponent = opponent; },
        enumerable: true,
        configurable: true
    });
    Player.prototype.setState = function (state, tickState) {
        this._state = state;
        if (tickState === TickState.RESET) {
            this._ticks = exports.TICKS_PER_STATE;
        }
    };
    Player.prototype.tick = function () {
        this._ticks -= 1;
        if (this._ticks <= 0) {
            this.setState(State.STAND, TickState.RESET);
        }
        return this._ticks;
    };
    Player.prototype.animate = function () {
        var _ = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _[_i - 0] = arguments[_i];
        }
    };
    Player.prototype.execute = function (key) { this._commandMap.get(key).trigger(); };
    Player.prototype.damageBy = function (percentage) { this._lifeBar.damageBy(percentage); };
    return Player;
})();
exports.Player = Player;
(function (TickState) {
    TickState[TickState["KEEP"] = 0] = "KEEP";
    TickState[TickState["RESET"] = 1] = "RESET";
})(exports.TickState || (exports.TickState = {}));
var TickState = exports.TickState;
(function (State) {
    State[State["BLOCK"] = 0] = "BLOCK";
    State[State["BLOCK_AIR"] = 1] = "BLOCK_AIR";
    State[State["BLOCK_GROUND"] = 2] = "BLOCK_GROUND";
    State[State["KICK"] = 3] = "KICK";
    State[State["KICK_AIR"] = 4] = "KICK_AIR";
    State[State["KICK_GROUND"] = 5] = "KICK_GROUND";
    State[State["PUNCH"] = 6] = "PUNCH";
    State[State["PUNCH_AIR"] = 7] = "PUNCH_AIR";
    State[State["PUNCH_GROUND"] = 8] = "PUNCH_GROUND";
    State[State["STAND"] = 9] = "STAND";
    State[State["JUMP"] = 10] = "JUMP";
    State[State["CROUCH"] = 11] = "CROUCH";
    State[State["CANCEL"] = 12] = "CANCEL";
    State[State["SPECIAL"] = 13] = "SPECIAL"; // Special states
})(exports.State || (exports.State = {}));
var State = exports.State;
function isAir(state) {
    switch (state) {
        case State.JUMP:
        case State.PUNCH_AIR:
        case State.KICK_AIR:
        case State.BLOCK_AIR:
            return true;
        default:
            return false;
    }
}
function isNeutral(state) {
    switch (state) {
        case State.STAND:
        case State.PUNCH:
        case State.KICK:
        case State.BLOCK:
            return true;
        default:
            return false;
    }
}
function isGround(state) {
    switch (state) {
        case State.CROUCH:
        case State.PUNCH_GROUND:
        case State.KICK_GROUND:
        case State.BLOCK_GROUND:
            return true;
        default:
            return false;
    }
}
function isBlock(state) {
    switch (state) {
        case State.BLOCK:
        case State.BLOCK_AIR:
        case State.BLOCK_GROUND:
            return true;
        default:
            return false;
    }
}
var STATE_TREE = (_a = {},
    _a[State.JUMP] = (_b = {},
        _b[State.JUMP] = State.JUMP,
        _b[State.BLOCK] = State.BLOCK_AIR,
        _b[State.PUNCH] = State.PUNCH_AIR,
        _b[State.KICK] = State.KICK_AIR,
        _b
    ),
    _a[State.CROUCH] = (_c = {},
        _c[State.CROUCH] = State.CROUCH,
        _c[State.BLOCK] = State.BLOCK_GROUND,
        _c[State.PUNCH] = State.PUNCH_GROUND,
        _c[State.KICK] = State.KICK_GROUND,
        _c
    ),
    _a
);
function followStateTree(current, next) {
    var subtree = STATE_TREE[current];
    if (!subtree)
        return next;
    var result = subtree[next];
    if (!result)
        return next;
    return result;
}
var SUB_COMMANDS = (_d = {},
    _d[State.PUNCH] = function (player) {
        var opponent = player.opponent;
        var opponentState = opponent.state;
        var blocked = false, hit = false;
        if (isNeutral(opponentState)) {
            hit = true;
            if (isBlock(opponentState)) {
                blocked = true;
                opponent.damageBy(2);
            }
            else {
                opponent.damageBy(5);
            }
        }
        player.animate(State.PUNCH, {
            blocked: blocked, hit: hit
        });
    },
    _d[State.PUNCH_AIR] = function (player) {
        var opponent = player.opponent;
        var opponentState = opponent.state;
        var blocked = false, hit = false;
        if (isAir(opponentState)) {
            hit = true;
            if (isBlock(opponentState)) {
                blocked = true;
                opponent.damageBy(3);
            }
            else {
                opponent.damageBy(7);
            }
        }
        player.animate(State.PUNCH_AIR, {
            blocked: blocked, hit: hit
        });
    },
    _d[State.PUNCH_GROUND] = function (player) {
        var opponent = player.opponent;
        var opponentState = opponent.state;
        var blocked = false, hit = false;
        if (isGround(opponentState)) {
            hit = true;
            if (isBlock(opponentState)) {
                blocked = true;
                opponent.damageBy(1);
            }
            else {
                opponent.damageBy(4);
            }
        }
        player.animate(State.PUNCH_GROUND, {
            blocked: blocked, hit: hit
        });
    },
    _d[State.KICK] = function (player) {
        var opponent = player.opponent;
        var opponentState = opponent.state;
        var blocked = false, hit = false;
        if (isGround(opponentState)) {
            hit = true;
            if (isBlock(opponentState)) {
                blocked = true;
                opponent.damageBy(1);
            }
            else {
                opponent.damageBy(4);
            }
        }
        player.animate(State.KICK, {
            blocked: blocked, hit: hit
        });
    },
    _d[State.KICK_AIR] = function (player) {
        var opponent = player.opponent;
        var opponentState = opponent.state;
        var blocked = false, hit = false;
        if (isNeutral(opponentState)) {
            hit = true;
            if (isBlock(opponentState)) {
                blocked = true;
                opponent.damageBy(2);
            }
            else {
                opponent.damageBy(5);
            }
        }
        player.animate(State.KICK_AIR, {
            blocked: blocked, hit: hit
        });
    },
    _d[State.KICK_GROUND] = function (player) {
        var opponent = player.opponent;
        var opponentState = opponent.state;
        var blocked = false, hit = false;
        if (isGround(opponentState)) {
            hit = true;
            if (isBlock(opponentState)) {
                blocked = true;
                opponent.damageBy(3);
            }
            else {
                opponent.damageBy(7);
            }
        }
        player.animate(State.KICK_GROUND, {
            blocked: blocked, hit: hit
        });
    },
    _d
);
function setNewState(player, nextState) {
    var newState = followStateTree(player.state, nextState);
    if (!newState) {
        player.setState(nextState, TickState.RESET);
        return nextState;
    }
    else {
        player.setState(newState, TickState.KEEP);
        return newState;
    }
}
exports.COMMANDS = {
    punch: new Command('punch', function (player) {
        var newState = setNewState(player, State.PUNCH);
        SUB_COMMANDS[newState](player);
    }),
    kick: new Command('kick', function (player) {
        var newState = setNewState(player, State.KICK);
        SUB_COMMANDS[newState](player);
    }),
    jump: new Command('jump', function (player) {
        var newState = setNewState(player, State.JUMP);
        player.animate(newState);
    }),
    crouch: new Command('crouch', function (player) {
        var newState = setNewState(player, State.CROUCH);
        player.animate(newState);
    }),
    block: new Command('block', function (player) {
        var newState = setNewState(player, State.CROUCH);
        player.animate(newState);
    }),
    special: new Command('special', function (player) {
        player.setState(State.SPECIAL, TickState.RESET);
        player.animate(State.SPECIAL);
    })
};
var _a, _b, _c, _d;
