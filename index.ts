import { arrayBufferToBase64, QubicInterface } from "./lib/qubicInterface";
import { runArgv } from "./functions";

const qubicInterface = new QubicInterface();
let command: string = "";
let seed: string = "";
let error: string = "";

const timer = setTimeout(() => {}, 999999);
(async () => {
  process.stdout.write(await runArgv());
  clearTimeout(timer);
})();
