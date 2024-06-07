import { Functioneer, FunctionRunResult } from "functioneer";
import { arrayBufferToBase64, QubicInterface } from "../lib/qubicInterface";

export function addFunction(func: Functioneer) {
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
        const qubicInterface = new QubicInterface();
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
}
