/// <reference path="../lib/core-js.d.ts" />
/// <reference path="Utils.ts" />

module Fighting {

    interface DamageListener { (number); }
    interface DeathListener { (Player); }

    class LifeBar {
        private percentage: number = 100;
        private onDamage: DamageListener;
        private onDeath: DeathListener;

        constructor(onDamage: DamageListener, onDeath: DeathListener) {
            this.onDamage = onDamage;
            this.onDeath = onDeath;
        }

        get alive(): boolean { return this.percentage > 0 }

        damageBy(percentage: number) {
            this.percentage -= percentage;

            if (this.alive) {
                this.onDamage(this.percentage);
            } else {
                this.onDeath(this);
            }
        }
    }

    interface CommandAction { (Player) };

    class Command {
        constructor(protected _name: string, protected _action: CommandAction = (_) => { }) { }

        attachTo(player: Player): AttachedCommand {
            return new AttachedCommand(this._name, this._action, player);
        }

        get name(): string { return this._name }
    }

    class AttachedCommand extends Command {
        constructor(_name: string, _action: CommandAction, private player: Player) {
            super(_name, _action);
        }

        trigger() {
            this._action(this.player);
        }
    }

    class CommandChain {
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

    class Combo {
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

    class CommandMap {
        private validCommands: { [key: string]: Command } = {};

        add(command: Command) {
            this.validCommands[command.name];
            return this;
        }

        check(key: string): boolean {
            return this.validCommands[key] != null;
        }
    }

    // Interaction between commands
    class Player {
        private _opponent: Player;
        private _commandMap: CommandMap;

        constructor(private _name: string) { }

        get commandMap(): CommandMap { return this._commandMap; }
        set opponent(opponent: Player) { this.opponent = opponent; }

        newChain(): CommandChain { return new CommandChain(this) }
    }
}
