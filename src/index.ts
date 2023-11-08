import { QubicHelper } from "./qubicHelper";
import { arrayBufferToBase64 } from "./arrayBufferUtil";
const qubicHelper = new QubicHelper();

let command: string = "";
let seed: string = "";
let error: string = "";

let sourceSeed: string = "";
let destPublicId: string = "";
let amount: string = "";
let tick: string = "";

const timer = setTimeout(() => {}, 999999);

try {
  if (process.argv[2] == "createPublicId") {
    command = "createPublicId";
    if (process.argv.length != 4) {
      throw "Invalid number of arguments. Please provide a seed.";
    }
    seed = process.argv[3];

    qubicHelper.createPublicId(seed).then((result) => {
      process.stdout.write(
        JSON.stringify({ status: "ok", publicId: result.publicId })
      );
      clearTimeout(timer);
    });
  } else if (process.argv[2] == "createTransaction") {
    command = "createTransaction";
    if (process.argv.length != 7) {
      throw "Invalid number of arguments. Please provide a sourceSeed destPublicId amount tick.";
    }
    sourceSeed = process.argv[3];
    destPublicId = process.argv[4];
    amount = process.argv[5];
    if (!/^\d+$/.test(amount)) {
      throw "Invalid amount. Please provide a numeric value without decimals.";
    }
    tick = process.argv[6];
    if (!/^\d+$/.test(tick)) {
      throw "Invalid tick. Please provide a numeric value without decimals.";
    }

    let result = qubicHelper
      .createTransaction(
        sourceSeed,
        destPublicId,
        parseInt(amount),
        parseInt(tick)
      )
      .then((result) => {
        process.stdout.write(
          JSON.stringify({
            status: "ok",
            transaction: arrayBufferToBase64(result),
          })
        );
        clearTimeout(timer);
      });
  } else {
    throw "Invalid command. Please provide a valid command (createPublicId, createTransaction).";
    clearTimeout(timer);
  }
} catch (error) {
  process.stdout.write(
    JSON.stringify({ args: process.argv, status: "error", error: error })
  );
  clearTimeout(timer);
}
