import { assert } from 'chai';
import { scanFromPrototype } from '../../src/utils/meta-scanner';

describe('scanFromPrototype()', () => {
    const SYMBOL = Symbol('metod');
    class Parent {
        parent1() {}
        method1() {}
        set setPropParent(val){}
        get getPropParent() { return '' }

        [SYMBOL]() {}
    }
    class Test1 extends Parent {
        readonly name1: string = 'Name1';

        constructor(private name2: string) {
            super();
        }
        method1() {}
        public test1() {}
        public test2() {}
        set setProp(val) {}
        get getProps() { return ''; }
        [SYMBOL]() {}
    }

    it('should find all methods', () => {
        const instance = new Test1('Name2');
        const prototype = Object.getPrototypeOf(instance);
        const metods = scanFromPrototype(prototype, name => name);
        assert.deepEqual(metods, ['method1', 'test1', 'test2', 'parent1']);
    });
  });
