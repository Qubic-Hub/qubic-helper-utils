import { Functioneer } from "functioneer";
import { addFunction as generateKey } from "./generateKey";
import { addFunction as createVaultFile } from "./createVaultFile";

export function addFunctions(func: Functioneer) {
  // Register all functions with the functioneer
  generateKey(func);
  createVaultFile(func);
}
