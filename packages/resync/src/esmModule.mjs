

let counter = 0;

function count() {
    return counter++;
}

class EsmModule {

    static get name() {
        return 'esmModule (static)';
    }

    constructor() {
        this.name = 'esmModule (instance)';
    }
}

export {
    count,
    EsmModule
};
