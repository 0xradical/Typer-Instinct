/// <reference path="../lib/typings/core-js.d.ts" />
/// <reference path="Utils.ts" />

module Fighting {
    const NOOP = (..._) => { };

    export interface DamageListener { (currentLife: number); }
    export interface DeathListener { (dead: Player); }

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
    }

    export class AttachedCommand extends Command {
        constructor(_name: string, _action: CommandAction, private player: Player) {
            super(_name, _action);
        }

        trigger() {
            this._action(this.player);
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
                this.commands[i].trigger();

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
        private validCommands: { [key: string]: Command } = {};

        add(command: Command) {
            this.validCommands[command.name];
            return this;
        }

        check(key: string): boolean {
            return this.validCommands[key] != null;
        }
    }

    export const TICKS_PER_STATE = 60;

    export class Player {
        private _opponent: Player;
        private _commandMap: CommandMap = new CommandMap();
        private _lifeBar: LifeBar;
        private _state: State;
        private _ticks: number;

        constructor(private _name: string, callbacks?: {
            onDamage?: DamageListener, onDeath?: DeathListener
        }) {
            this._lifeBar = new LifeBar(this, callbacks.onDamage || NOOP,
                callbacks.onDeath || NOOP);
        }

        get name(): string { return this._name; }
        get state(): State { return this._state; }
        get ticks(): number { return this._ticks; }
        get commandMap(): CommandMap { return this._commandMap; }

        get opponent(): Player { return this._opponent; }
        set opponent(opponent: Player) { this._opponent = opponent; }

        setState(state: State, tickState: TickState) {
            this._state = state;
            if (tickState === TickState.RESET) {
                this._ticks = TICKS_PER_STATE;
            }
        }

        animate(..._) { }

        newChain(): CommandChain { return new CommandChain(this) }
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
        CANCEL, SPECIAL, // Special states
        CONTINUE // Do not alter ticks
    }

    export const STATE_TREE = {
        [State.JUMP]: {
            [State.JUMP]: State.CONTINUE,
            [State.BLOCK]: State.BLOCK_AIR,
            [State.PUNCH]: State.PUNCH_AIR,
            [State.KICK]: State.KICK_AIR,
        },
        [State.CROUCH]: {
            [State.CROUCH]: State.CONTINUE,
            [State.BLOCK]: State.BLOCK_GROUND,
            [State.PUNCH]: State.PUNCH_GROUND,
            [State.KICK]: State.KICK_GROUND
        }
    }

    export function followStateTree(current: State, next: State): State {
        let subtree = STATE_TREE[current];
        if (!subtree) return next;

        let result = subtree[next];
        if (!result) return next

        return result;
    }

    const SUB_COMMANDS = {
        [State.PUNCH]: (player: Player) => {
            let opponent = player.opponent;
            let blocked = false, hit = false;

            switch (opponent.state) {
                case State.BLOCK:
                case State.BLOCK_AIR:
                    hit = true;
                    blocked = true;
                    opponent.damageBy(2);
                    break;
                case State.BLOCK_GROUND:
                case State.CROUCH:
                    break; // do nothing
                default:
                    hit = true;
                    opponent.damageBy(5);
            }

            player.animate(State.PUNCH, {
                blocked: blocked, hit: hit
            });
        },
        [State.PUNCH_AIR]: (player: Player) => {
            let opponent = player.opponent;
            let blocked = false, hit = false;

            switch (opponent.state) {
                case State.BLOCK_AIR:
                    hit = true;
                    blocked = true;
                    opponent.damageBy(2);
                    break;
                case State.JUMP:
                    hit = true;
                    opponent.damageBy(7);
                default:
                    break; // do nothing
            }

            player.animate(State.PUNCH, {
                blocked: blocked, hit: hit
            });
        },
        [State.PUNCH_GROUND]: (player: Player) => {
            let opponent = player.opponent;
            let blocked = false, hit = false;

            switch (opponent.state) {
                case State.BLOCK:
                case State.BLOCK_GROUND:
                    hit = true;
                    blocked = true;
                    opponent.damageBy(2);
                    break;
                case State.BLOCK_AIR:
                case State.JUMP:
                    break; // do nothing
                default:
                    hit = true;
                    opponent.damageBy(4);
            }

            player.animate(State.PUNCH, {
                blocked: blocked, hit: hit
            });
        },
    }

    export const COMMANDS = {
        punch: new Command('punch', (player) => {
            player.state = followStateTree(player.state, State.PUNCH);

        }),
        kick: new Command('kick', (player) => {
            player.state = State.KICK;

            let opponent = player.opponent;
            player.animate(State.KICK, {
                blocked: opponent.state == State.BLOCK
            });

            switch (opponent.state) {
                case State.BLOCK:
                case State.BLOCK_GROUND:
                    opponent.damageBy(2);
                    break;
                case State.BLOCK_AIR:
                case State.JUMP:
                    break; // do nothing
                default:
                    opponent.damageBy(5);
            }
        }),
        jump: new Command('jump', (player) => {

        }),
        crouch: new Command('crouch', (player) => {

        }),
        block: new Command('block', (player) => {

        }),
        cancel: new Command('cancel', (player) => {

        }),
        special: new Command('special', (player) => {

        })
    ]
}
