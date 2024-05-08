
import { inspect } from 'node:util';

const obj = { foo: 'bar' };

console.log(inspect(obj, { colors: true }));

export default obj;
