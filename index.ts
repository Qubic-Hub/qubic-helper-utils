import { arrayBufferToBase64, QubicInterface } from "./lib/qubicInterface";
import { Functioneer, FunctionRunResult } from "functioneer";

const qubicInterface = new QubicInterface();
let command: string = "";
let seed: string = "";
let error: string = "";

let sourceSeed: string = "";
let destPublicId: string = "";
let amount: string = "";
let tick: string = "";

const func = new Functioneer({
  showHelpOnError: true,
  debug: false,
  returnJSONString: true,
});

const timer = setTimeout(() => {}, 999999);
(async () => {
  func
    .registerFunction(
      "createPublicId",
      "Gets the public ID from a seed",
      async (seed: string) => {
        const res = await qubicInterface.getPublicId(seed);
        return JSON.stringify(res);
      }
    )
    .addField("seed", "string", "Seed to generate the public ID from");

  func
    .registerFunction(
      "createTransaction",
      "Creates a transaction",
      async (
        sourceSeed: string,
        destPublicId: string,
        amount: number,
        tick: number
      ) => {
        const res = await qubicInterface.getTransaction(
          sourceSeed,
          destPublicId,
          amount,
          tick,
          true
        );
        return JSON.stringify(res);
      }
    )
    .addField("seed", "string", "Seed of the source account")
    .addField("destPublicId", "string", "Public ID of the destination account")
    .addField("amount", "number", "Amount to transfer")
    .addField("tick", "number", "Tick of the transaction");

  func
    .registerFunction(
      "createTransactionAssetMove",
      "Creates a transaction to move an asset",
      async (
        sourceSeed: string,
        destPublicId: string,
        assetName: string,
        assetIssuer: string,
        numberOfUnits: number,
        tick: number
      ) => {
        const res = await qubicInterface.getAssetTransferTransaction(
          sourceSeed,
          destPublicId,
          assetName,
          assetIssuer,
          numberOfUnits,
          tick,
          true
        );
        return JSON.stringify(res);
      }
    )
    .addField("sourceSeed", "string", "Seed of the source account")
    .addField("destPublicId", "string", "Public ID of the destination account")
    .addField("assetName", "string", "Name of the asset to transfer")
    .addField("assetIssuer", "string", "Issuer of the asset to transfer")
    .addField("numberOfUnites", "number", "Amount of assets to transfer")
    .addField("tick", "number", "Tick of the transaction");

  const result = JSON.parse((await func.runArgv(process.argv)) as any);

  if (result.success === true) {
    let output = JSON.parse(result.result);
    output.status = "ok";
    process.stdout.write(JSON.stringify(output) + "\n\n");
  } else {
    console.log(result.message.replace("\n", " ", "g"));

    process.stdout.write(
      JSON.stringify({
        args: process.argv,
        status: "error",
        error: result.message.replace("\\n", "\n") || "An error has occurred",
      })
    );
  }

  console.log("\n--------------------------------------------\n");

  //  process.stdout.write(JSON.stringify(output) + "\n\n");

  // if (run.success) {
  //   process.stdout.write(JSON.stringify({ result: run.result, status: "ok" }));
  //   //clearTimeout(timer);
  // } else {
  //   process.stdout.write(
  //     JSON.stringify({
  //       args: process.argv,
  //       status: "error",
  //       error: run.message || "An error has occurred",
  //     })
  //   );
  // }

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
