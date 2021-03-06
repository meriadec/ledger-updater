import axios from "axios";
import { listen as listenLogs } from "@ledgerhq/logs";
import { setNetwork } from "@ledgerhq/live-common/lib/network";
import { registerTransportModule } from "@ledgerhq/live-common/lib/hw";

import HidProxy from "./HidProxy";

listenLogs(log => {
  console.log(...log);
});

setNetwork((...args) => {
  console.log(">> network:", args);
  return axios(...args);
});

let t;

registerTransportModule({
  id: "hid",
  open: async () => {
    t = await HidProxy.open();
    return t;
  },
  disconnect: () => t.close(),
});
