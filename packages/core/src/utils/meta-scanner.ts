export function scanFromPrototype<T = any, R = any>(
      prototype: T,
      callbackMap: (name: string) => R,
    ): R[] {
      const methodNames = findAllMethods(prototype);
      return methodNames
        .map(callbackMap)
        .filter(metadata => !!metadata);
}

function findAllMethods(prototype: any): string[] {
    const isMethod = (name: string) => {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
        if (descriptor) {
            if (descriptor.set || descriptor.get) {
                return false;
            }
        }
        return name !== 'constructor' && typeof prototype[name] === 'function';
    };
    let names = [];
    do {
        names = names.concat(
            Object.getOwnPropertyNames(prototype).filter(isMethod)
        );
    } while((prototype = Reflect.getPrototypeOf(prototype)) && prototype !== Object.prototype)
    return [...new Set(names)];
}
