

let counter = 0;

function count() {
    return counter++;
}

class CjsModule {

    static get name() {
        return 'cjsModule (static)';
    }

    constructor() {
        this.name = 'cjsModule (instance)';
    }
}

module.exports = {
    count,
    CjsModule
};
