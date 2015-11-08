/// <reference path="../lib/typings/core-js.d.ts" />
/// <reference path="Utils.ts" />

module Fighting {
    const NOOP = (..._) => { };

    export interface StringMatcher {
        updateTypingField(content: String);
        currentCommandStrings: { [key: string]: string };
        currentMatchLevels:    { [key: string]: number };

    }
    export interface DamageListener { (currentLife: number); }
    export interface DeathListener { (dead: Player); }
    export interface AnimateListener { (state: State, options?: any); }

    export class LifeBar {
        private percentage: number = 100;
        private player: Player;
        private onDamage: DamageListener;
        private onDeath: DeathListener;

        constructor(player: Player, onDamage: DamageListener, onDeath: DeathListener) {
            this.onDamage = onDamage;
            this.onDeath = onDeath;
        }

        get alive(): boolean { return this.percentage > 0 }

        damageBy(percentage: number) {
            this.percentage -= percentage;

            if (this.alive) {
                this.onDamage(this.percentage);
            } else {
                this.onDeath(this.player);
            }
        }
    }

    export interface CommandAction { (player: Player); };

    export class Command {
        constructor(protected _name: string, protected _action: CommandAction = NOOP) { }

        attachTo(player: Player): AttachedCommand {
            return new AttachedCommand(this._name, this._action, player);
        }

        get name(): string { return this._name }

        trigger(player: Player) {
            this._action(player);
        }
    }

    export class AttachedCommand extends Command {
        constructor(_name: string, _action: CommandAction, private player: Player) {
            super(_name, _action);
        }

        trigger(player: Player) {
            // this._action(this.player);
        }
    }

    export class CommandChain {
        private commands: AttachedCommand[] = [];

        constructor(private player: Player) { }

        push(command: Command): CommandChain {
            this.commands.push(command.attachTo(this.player));
            return this;
        }

        trigger() {
            let length = this.commands.length;
            let comboStart = 0;

            for (let i = 0; i < length; i++) {
                this.commands[i].trigger(this.player);

                let combo = Combo.find(this.commands.slice(comboStart, i))
                if (combo != null) {
                    combo.trigger(this.player);
                    comboStart = i + 1;
                }
            }
        }
    }

    export class Combo {
        private static combos: { [key: string]: Combo } = {};

        static find(commands: Command[]): Combo {
            for (let name in this.combos) {
                let combo = this.combos[name];
                if (Utils.arrayEquals(combo.commands, commands)) {
                    return combo;
                }
            }
            return null;
        }

        constructor(private _name: string, private commands: Command[],
            private action: CommandAction) {
            Combo.combos[_name] = this;
        }

        trigger(player: Player) {
            this.action(player);
        }
    }

    export class CommandMap {
        private validCommands: { [key: string]: AttachedCommand } = {};
        private commandKeys: string[] = [];

        add(command: AttachedCommand) {
            let key = command.name;
            if (!this.validCommands[command.name]) {
                this.validCommands[command.name] = command;
                this.commandKeys.push(command.name)
            }
            return this;
        }

        get keys(): string[] { return this.commandKeys; }

        get(key: string): AttachedCommand {
            return this.validCommands[key];
        }
    }

    export const TICKS_PER_STATE = 60;

    export class Player {
        private _opponent: Player;
        private _commandMap: CommandMap = new CommandMap();
        private _lifeBar: LifeBar;
        private _state: State;
        private _ticks: number;
        private _matcher: StringMatcher;
        private _onAnimate: AnimateListener;

        constructor(private _name: string, callbacks?: {
            onDamage?: DamageListener, onDeath?: DeathListener,
            onAnimate?: AnimateListener
        }) {
            this.matcher = new StringMatcher(this);
            for (let key in Fighting.COMMANDS) {
               this.commandMap.add(Fighting.COMMANDS[key]);
            }

            this._onAnimate = callbacks.onAnimate || NOOP;
            this._lifeBar = new LifeBar(this, callbacks.onDamage || NOOP,
                callbacks.onDeath || NOOP);
        }

        get name(): string { return this._name; }
        get state(): State { return this._state; }
        get ticks(): number { return this._ticks; }
        get commandMap(): CommandMap { return this._commandMap; }

        get opponent(): Player { return this._opponent; }
        set opponent(opponent: Player) { this._opponent = opponent; }

        get matcher(): StringMatcher { return this._matcher; }
        set matcher(matcher: StringMatcher) { this._matcher = matcher; }

        setState(state: State, tickState: TickState) {
            this._state = state;
            if (tickState === TickState.RESET) {
                this._ticks = TICKS_PER_STATE;
            }
        }

        tick(): number {
            this._ticks -= 1;
            if (this._ticks <= 0) {
                this.setState(State.STAND, TickState.RESET);
                this.animate(State.STAND);
            }
            return this._ticks;
        }

        get animate(): AnimateListener { return this._onAnimate; }

        execute(key: string) { this._commandMap.get(key).trigger(this); }
        damageBy(percentage: number) { this._lifeBar.damageBy(percentage) }
    }

    export enum TickState {
        KEEP, // keep current tick
        RESET, // reset tick
    }

    export enum State {
        BLOCK, BLOCK_AIR, BLOCK_GROUND, // Blocking states
        KICK, KICK_AIR, KICK_GROUND, // Kicking states
        PUNCH, PUNCH_AIR, PUNCH_GROUND, // Punching states
        STAND, JUMP, CROUCH, // Movement states
        CANCEL, SPECIAL // Special states
    }

    function isAir(state: State) {
        switch (state) {
            case State.JUMP: case State.PUNCH_AIR: case State.KICK_AIR: case State.BLOCK_AIR:
                return true;
            default:
                return false;
        }
    }

    function isNeutral(state: State) {
        switch (state) {
            case State.STAND: case State.PUNCH: case State.KICK: case State.BLOCK:
                return true;
            default:
                return false;
        }
    }

    function isGround(state: State) {
        switch (state) {
            case State.CROUCH: case State.PUNCH_GROUND: case State.KICK_GROUND: case State.BLOCK_GROUND:
                return true;
            default:
                return false;
        }
    }

    function isBlock(state: State) {
        switch (state) {
            case State.BLOCK: case State.BLOCK_AIR: case State.BLOCK_GROUND:
                return true;
            default:
                return false;
        }
    }

    const STATE_TREE = {
        [State.JUMP]: {
            [State.JUMP]: State.JUMP,
            [State.BLOCK]: State.BLOCK_AIR,
            [State.PUNCH]: State.PUNCH_AIR,
            [State.KICK]: State.KICK_AIR,
        },
        [State.CROUCH]: {
            [State.CROUCH]: State.CROUCH,
            [State.BLOCK]: State.BLOCK_GROUND,
            [State.PUNCH]: State.PUNCH_GROUND,
            [State.KICK]: State.KICK_GROUND
        }
    }

    function followStateTree(current: State, next: State): State {
        let subtree = STATE_TREE[current];
        if (!subtree) return next;

        let result = subtree[next];
        if (!result) return next

        return result;
    }

    const SUB_COMMANDS = {
        [State.PUNCH]: (player: Player) => {
            let opponent = player.opponent;
            let opponentState = opponent.state;
            let blocked = false, hit = false;

            if (isNeutral(opponentState)) {
                hit = true;
                if (isBlock(opponentState)) {
                    blocked = true
                    opponent.damageBy(2);
                } else {
                    opponent.damageBy(5);
                }
            }

            player.animate(State.PUNCH, {
                blocked: blocked, hit: hit
            });
        },
        [State.PUNCH_AIR]: (player: Player) => {
            let opponent = player.opponent;
            let opponentState = opponent.state;
            let blocked = false, hit = false;

            if (isAir(opponentState)) {
                hit = true;
                if (isBlock(opponentState)) {
                    blocked = true
                    opponent.damageBy(3);
                } else {
                    opponent.damageBy(7);
                }
            }

            player.animate(State.PUNCH_AIR, {
                blocked: blocked, hit: hit
            });
        },
        [State.PUNCH_GROUND]: (player: Player) => {
            let opponent = player.opponent;
            let opponentState = opponent.state;
            let blocked = false, hit = false;

            if (isGround(opponentState)) {
                hit = true;
                if (isBlock(opponentState)) {
                    blocked = true
                    opponent.damageBy(1);
                } else {
                    opponent.damageBy(4);
                }
            }

            player.animate(State.PUNCH_GROUND, {
                blocked: blocked, hit: hit
            });
        },
        [State.KICK]: (player: Player) => {
            let opponent = player.opponent;
            let opponentState = opponent.state;
            let blocked = false, hit = false;

            if (isGround(opponentState)) {
                hit = true;
                if (isBlock(opponentState)) {
                    blocked = true
                    opponent.damageBy(1);
                } else {
                    opponent.damageBy(4);
                }
            }

            player.animate(State.KICK, {
                blocked: blocked, hit: hit
            });
        },
        [State.KICK_AIR]: (player: Player) => {
            let opponent = player.opponent;
            let opponentState = opponent.state;
            let blocked = false, hit = false;

            if (isNeutral(opponentState)) {
                hit = true;
                if (isBlock(opponentState)) {
                    blocked = true
                    opponent.damageBy(2);
                } else {
                    opponent.damageBy(5);
                }
            }

            player.animate(State.KICK_AIR, {
                blocked: blocked, hit: hit
            });
        },
        [State.KICK_GROUND]: (player: Player) => {
            let opponent = player.opponent;
            let opponentState = opponent.state;
            let blocked = false, hit = false;

            if (isGround(opponentState)) {
                hit = true;
                if (isBlock(opponentState)) {
                    blocked = true
                    opponent.damageBy(3);
                } else {
                    opponent.damageBy(7);
                }
            }

            player.animate(State.KICK_GROUND, {
                blocked: blocked, hit: hit
            });
        },
    }

    function setNewState(player: Player, nextState: State): State {
        let newState = followStateTree(player.state, nextState);
        if (!newState) {
            player.setState(nextState, TickState.RESET);
            return nextState;
        } else {
            player.setState(newState, TickState.KEEP);
            return newState;
        }
    }

    export const COMMANDS = {
        punch: new Command('punch', (player) => {
            let newState = setNewState(player, State.PUNCH);
            SUB_COMMANDS[newState](player);
        }),
        kick: new Command('kick', (player) => {
            let newState = setNewState(player, State.KICK);
            SUB_COMMANDS[newState](player);
        }),
        jump: new Command('jump', (player) => {
            let newState = setNewState(player, State.JUMP);
            player.animate(newState);
        }),
        crouch: new Command('crouch', (player) => {
            let newState = setNewState(player, State.CROUCH);
            player.animate(newState);
        }),
        block: new Command('block', (player) => {
            let newState = setNewState(player, State.BLOCK);
            player.animate(newState);
        }),
        special: new Command('special', (player) => {
            player.opponent.damageBy(20);
            player.setState(State.SPECIAL, TickState.RESET);
            player.animate(State.SPECIAL);
        })
    }
}
