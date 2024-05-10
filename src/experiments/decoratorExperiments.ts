var myGlobalVar = 'I am a global variable';
globalThis.myGlobalVar = myGlobalVar;

function CheckDependencies(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
        let accessed = false;  // Flag to track access5
        const proxyHandler = {
            get: function (target: any, prop: string, receiver: unknown) {
                if (prop === 'myGlobalVar') {
                    accessed = true;  // Set the flag if myGlobalVar is accessed
                    console.warn(`Warning: Accessing global object in method: ${propertyKey}`);
                }
                return Reflect.get(target, prop, receiver);
            }
        };

        const globalProxy = new Proxy(globalThis, proxyHandler);

        try {
            // Execute the method using the proxied version of globalThis
            return originalMethod.apply(this, args);
        } finally {
            if (accessed) {
                console.log(`Global variable was accessed during the execution of ${propertyKey}.`);
            }
        }
    };
}

class Example {
    @CheckDependencies
    print() {
        console.log(globalThis.myGlobalVar); // This access should trigger the proxy warning
        return 'Printing completed';
    }

    @CheckDependencies
    method() {
        return 'No global access here'; // This does not access the global variable
    }
}

const e = new Example();
console.log('Global variable value before method call:', globalThis.myGlobalVar);
e.print();  // Should trigger both the log and the warning
e.method();  // Should not trigger the warning
