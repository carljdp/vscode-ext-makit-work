

import { IService, Service } from '../common/Service';
import { IRegistry, Registry } from '../common/Registry';

class RegistryOfServices extends Registry<Service> implements IRegistry<IService> {

    // implementation specific to SingletonRegistry

    public constructor() {
        super();
        this.instanceKey = Symbol.for("RegistryOfServices");
    }


}

export { RegistryOfServices };