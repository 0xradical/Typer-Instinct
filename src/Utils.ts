module Utils {
    export function arrayEquals<T>(one: T[], another: T[]): boolean {
        let length = one.length;
        if (length !== another.length) {
            return false;
        }

        for (let i = 0; i < length; i++) {
            if (one[i] !== another[i]) {
                return false;
            }
        }

        return true;
    }
}
