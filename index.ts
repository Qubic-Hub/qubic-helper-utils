import { arrayBufferToBase64, QubicInterface } from "./lib/qubicInterface";

const qubicInterface = new QubicInterface();
let command: string = "";
let seed: string = "";
let error: string = "";

let sourceSeed: string = "";
let destPublicId: string = "";
let amount: string = "";
let tick: string = "";

const timer = setTimeout(() => {}, 999999);
(async () => {
  try {
    if (process.argv[2] == "createPublicId") {
      command = "createPublicId";
      if (process.argv.length != 4) {
        throw "Invalid number of arguments. Please provide a seed.";
      }
      seed = process.argv[3];

      qubicInterface.getPublicId(seed).then((result) => {
        process.stdout.write(JSON.stringify({ ...result, status: "ok" }));
        clearTimeout(timer);
      });
    } else if (process.argv[2] == "createTransaction") {
      if (process.argv.length != 7) {
        throw "Invalid number of arguments. Please provide a sourceSeed destPublicId amount tick.";
      }
      let [node, executable, command, sourceSeed, destPublicId, amount, tick] =
        process.argv;
      if (!/^\d+$/.test(amount)) {
        throw "Invalid amount. Please provide a numeric value without decimals.";
      }
      if (!/^\d+$/.test(tick)) {
        throw "Invalid tick. Please provide a numeric value without decimals.";
      }
      qubicInterface
        .getTransaction(
          sourceSeed,
          destPublicId,
          parseInt(amount),
          parseInt(tick),
          true
        )
        .then((result) => {
          process.stdout.write(
            JSON.stringify({
              transaction: result.transaction,
              status: "ok",
            })
          );
          clearTimeout(timer);
        });
    } else if (process.argv[2] == "createTransactionAssetMove") {
      if (process.argv.length != 9) {
        throw (
          "Invalid number of arguments(" +
          process.argv.length +
          "). Please provide a <sourceSeed> <destPublicId> <assetName> <assetIssuer> <numberOfUnites> <tick>"
        );
      }
      //sourceSeed destinationPublicId assetName assetIssuer numberOfUnits tick
      let [
        node,
        executable,
        command,
        sourceSeed,
        destPublicId,
        assetName,
        assetIssuer,
        numberOfUnits,
        tick,
      ] = process.argv;
      if (!/^\d+$/.test(numberOfUnits)) {
        throw "Invalid number of units. Please provide a numeric value without decimals.";
      }
      if (!/^\d+$/.test(tick)) {
        throw "Invalid tick. Please provide a numeric value without decimals.";
      }
      const result = await qubicInterface.getAssetTransferTransaction(
        sourceSeed,
        destPublicId,
        assetName,
        assetIssuer,
        parseInt(numberOfUnits),
        parseInt(tick),
        true
      );
      process.stdout.write(
        JSON.stringify({
          transaction: result.transaction,
          status: "ok",
        })
      );
      clearTimeout(timer);
    } else {
      throw "Invalid command. Please provide a valid command (createPublicId, createTransaction, createTransactionAssetMove).";
      clearTimeout(timer);
    }
  } catch (error) {
    process.stdout.write(
      JSON.stringify({ args: process.argv, status: "error", error: error })
    );
    clearTimeout(timer);
  }
})();
