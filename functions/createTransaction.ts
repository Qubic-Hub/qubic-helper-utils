import { Functioneer, FunctionRunResult } from "functioneer";
import { arrayBufferToBase64, QubicInterface } from "../lib/qubicInterface";

export function addFunction(func: Functioneer) {
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
        const qubicInterface = new QubicInterface();
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
}
