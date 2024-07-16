import { arrayBufferToBase64, QubicInterface } from "./lib/qubicInterface";
import { runArgv } from "./functions";
import { WalletService } from "./functions/walletKeyManagement/shared/walletService";
import { IDecodedSeed } from "./functions/walletKeyManagement/model/seed";

const qubicInterface = new QubicInterface();
let command: string = "";
let seed: string = "";
let error: string = "";

const timer = setTimeout(() => {}, 999999);
(async () => {
  process.stdout.write(await runArgv());
  clearTimeout(timer);
})();
