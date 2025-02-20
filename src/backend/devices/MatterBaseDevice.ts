import type { Endpoint, EndpointType } from '@matter/main';
import type { matterDeviceDefinition } from '@typesd/module';

export abstract class MatterBaseDevice<T extends EndpointType> {
  protected endpoint: Endpoint<T>;

  constructor(
    public readonly device: matterDeviceDefinition,
    public readonly sendModuleControl: (event: string, payload?: any) => void,
    public readonly events: NodeJS.EventEmitter
  ) {}

  async destroyEndpoint() {
    await this.endpoint.close();
  }
}
