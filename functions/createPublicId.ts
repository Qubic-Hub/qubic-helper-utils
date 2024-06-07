import { Functioneer, FunctionRunResult } from "functioneer";
import { arrayBufferToBase64, QubicInterface } from "../lib/qubicInterface";

export function addFunction(func: Functioneer) {
  func
    .registerFunction(
      "createPublicId",
      "Gets the public ID from a seed",
      async (seed: string) => {
        const qubicInterface = new QubicInterface();
        const res = await qubicInterface.getPublicId(seed);
        return JSON.stringify(res);
      }
    )
    .addField("seed", "string", "Seed to generate the public ID from");
}
