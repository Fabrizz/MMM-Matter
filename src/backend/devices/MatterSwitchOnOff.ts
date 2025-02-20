import { Endpoint } from '@matter/main';
import type { matterDeviceDefinition, MMMMatterDeviceSwitchOnOffBehavior, NotificationForBackendPayload } from '@typesd/module';
import { MatterBaseDevice } from './MatterBaseDevice';
import { OnOffPlugInUnitDevice } from '@matter/main/devices/on-off-plug-in-unit';
import { BridgedDeviceBasicInformationServer } from '@matter/main/behaviors/bridged-device-basic-information';
import { switchOnOffProcessNotificationSend } from './utils';

// @ts-ignore | Type instantiation is excessively deep
export class MatterSwitchOnOff extends MatterBaseDevice<OnOffPlugInUnitDevice> {
  constructor(
    device: matterDeviceDefinition,
    sendModuleControl: (event: string, payload?: any) => void,
    events: NodeJS.EventEmitter
  ) {
    super(device, sendModuleControl, events);
    const { nodeLabel, productName, productLabel, serialNumber } = device.matter;

    this.endpoint = new Endpoint(
      // @ts-ignore | Type instantiation is excessively deep
      OnOffPlugInUnitDevice.with(BridgedDeviceBasicInformationServer),
      {
        id: device.id,
        bridgedDeviceBasicInformation: {
          nodeLabel,
          productName,
          productLabel,
          serialNumber,
          reachable: true,
        },
      }
    );

    const {
      setOnWithNotification,
      setOffWithNotification,
      toggleWithNotification,
      setWithNotificationPayload,
      onOnSend,
      onOffSend,
      onToggleSend
    } = device.behavior as MMMMatterDeviceSwitchOnOffBehavior;

    this.endpoint.events.onOff.onOff$Changed.on((value: boolean) => {
      if (onToggleSend) sendModuleControl(...switchOnOffProcessNotificationSend(onToggleSend, value));
      if (value && onOnSend) sendModuleControl(onOnSend);
      if (!value && onOffSend) sendModuleControl(onOffSend);
    });

    if (setOnWithNotification) {
      events.on(`__${setOnWithNotification}`, () => {
        this.endpoint.act(async (agent) => {
          await agent.onOff.on();
        });
      });
    }
    if (setOffWithNotification) {
      events.on(`__${setOffWithNotification}`, () => {
        this.endpoint.act(async (agent) => {
          await agent.onOff.off();
        });
      });
    }
    if (toggleWithNotification) {
      events.on(`__${toggleWithNotification}`, () => {
        this.endpoint.act(async (agent) => {
          await agent.onOff.toggle();
        });
      });
    }
    if (setWithNotificationPayload) {
      events.on(`__${setWithNotificationPayload}`, (value: NotificationForBackendPayload) => {
        this.endpoint.act(async (agent) => {
          if (value.payload) await agent.onOff.on()
          else await agent.onOff.off();
        });
      });
    }

    this.endpoint.events.identify.startIdentifying.on(() => {
      events.emit("IDENTIFY", { id: device.id, type: true });
    });
    this.endpoint.events.identify.stopIdentifying.on(() => {
      events.emit("IDENTIFY", { id: device.id, type: false });
    });
  }
}