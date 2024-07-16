import { Functioneer, FunctionRunResult } from "functioneer";
import { addFunction as createPublicId } from "./createPublicId";
import { addFunction as createTransaction } from "./createTransaction";
import { addFunction as createTransactionAssetMove } from "./createTransactionAssetMove";

import { addFunctions as keyManagement } from "./walletKeyManagement";

export function addFunctions(func: Functioneer) {
  // Register all functions with the functioneer
  createPublicId(func);
  createTransaction(func);
  createTransactionAssetMove(func);
  keyManagement(func);
}

export async function runArgv() {
  const func = new Functioneer({
    showHelpOnError: true,
    returnJSONString: true,
  });

  addFunctions(func);
  const result = JSON.parse((await func.runArgv(process.argv)) as any);

  if (result.success === true) {
    let output = JSON.parse(result.result);
    output.status = "ok";
    return JSON.stringify(output);
  } else {
    return JSON.stringify({
      args: process.argv,
      status: "error",
      error:
        result.message.replace(/[\r\n\t]+/g, " ").replace(/ +/g, " ") ||
        "An error has occurred",
    });
  }
}

export async function runBrowser(functionName: string, ...args: any[]) {
  const func = new Functioneer({
    showHelpOnError: false,
    returnJSONString: true,
  });

  addFunctions(func);
  const result = (await func.run(functionName, args)) as string;
  const resObj = JSON.parse(result) as FunctionRunResult;

  if (resObj.success === true) {
    const resultData = JSON.parse(resObj.result);
    const out = {
      ...resultData,
      status: "ok",
    };
    return out;
  } else {
    return {
      status: "error",
      error: JSON.parse(result).message,
    };
  }
}
