import { COLORS } from "@backend/utils";
import * as Log from 'logger'

const MODULE_TAG = `${COLORS.reset}[${COLORS.FG.magenta}MMM-Matter${COLORS.reset}] (${COLORS.FG.green}MatterServer${COLORS.reset}/utils)`;


export function switchOnOffProcessNotificationSend(v: string | [string, {}], state: boolean): [string, (string | boolean)?] {
  if (typeof v === "string") return [v, state]
  try {
    return [
      v[0],
      JSON.parse(JSON.stringify(v[1]), (_, value) => value === "__VALUE__" ? state : value)
    ]
  } catch (error) {
    Log.error(`${MODULE_TAG} SwitchOnOffProcessNotificationSend:`, error);
    return [v[0], "Error while parsing custom payload"]
  }
}