/**
 * Represents an event emitter.
 */
class MatterEventEmmiter {
  events: {};
  constructor() {
    this.events = {};
  }

  /**
   * Registers a callback function for the specified event.
   * @param {string} eventName - The name of the event.
   * @param {Function} callback - The callback function to be executed when the event is emitted.
   */
  on(eventName: string, callback: Function) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  /**
   * Emits the specified event with the provided data.
   * @param {string} eventName - The name of the event to be emitted.
   * @param {*} data - The data to be passed to the event callbacks.
   */
  emit(eventName: string, data: any) {
    const eventCallbacks = this.events[eventName];
    if (eventCallbacks) {
      eventCallbacks.forEach((callback: (arg0: any) => void) => {
        callback(data);
      });
    }
  }

  /**
   * Unregisters a callback function for the specified event.
   * @param {string} eventName - The name of the event.
   * @param {Function} callback - The callback function to be unregistered.
   */
  off(eventName: string, callback: Function) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(
        (cb: Function) => cb !== callback,
      );
    }
  }
}

/** Represents the logger */
const MatterLogger = {
  debug(str: string, ...arg: any[]): void {
    console.debug(
      `%c· MMM-Matter %c %c DBUG %c ${str}`,
      "background-color:#FFE780;color:black;border-radius:0.5em",
      "",
      "background-color:#293f45;color:white;",
      "",
      ...arg,
    );
  },
  info(str: string, ...arg: any[]): void {
    console.info(
      `%c· MMM-Matter %c %c INFO %c ${str}`,
      "background-color:#FFE780;color:black;border-radius:0.5em",
      "",
      "background-color:#02675d;color:white;",
      "",
      ...arg,
    );
  },
  warninfo(str: string, ...arg: any[]): void {
    console.info(
      `%c· MMM-Matter %c %c WARN %c ${str}`,
      "background-color:#FFE780;color:black;border-radius:0.5em",
      "",
      "background-color:#a98403;color:white;",
      "",
      ...arg,
    );
  },
  warn(str: string, ...arg: any[]): void {
    console.warn(
      `%c· MMM-Matter %c %c WARN %c ${str}`,
      "background-color:#FFE780;color:black;border-radius:0.5em",
      "",
      "background-color:#a98403;color:white;",
      "",
      ...arg,
    );
  },
  error(str: string, ...arg: any[]): void {
    console.error(
      `%c· MMM-Matter %c %c ERRO %c ${str}`,
      "background-color:#FFE780;color:black;border-radius:0.5em",
      "",
      "background-color:#781919;color:white;",
      "",
      ...arg,
    );
  },
  badge(): void {
    console.log(
      ` ⠖ %c by Fabrizz %c MMM-Matter `,
      "background-color: #555;color: #fff;margin: 0.4em 0em 0.4em 0.4em;padding: 5px 3px 5px 5px;border-radius: 7px 0 0 7px;font-family: DejaVu Sans,Verdana,Geneva,sans-serif;",
      "background-color: #bc81e0;background-image: linear-gradient(90deg,rgb(187, 171, 32),rgb(250, 122, 18));color: #FFF;margin: 0.4em 0.4em 0.4em 0em;padding: 5px 5px 5px 3px;border-radius: 0 7px 7px 0;font-family: DejaVu Sans,Verdana,Geneva,sans-serif;text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3)",
    );
  },
}

export default { MatterEventEmmiter, MatterLogger };