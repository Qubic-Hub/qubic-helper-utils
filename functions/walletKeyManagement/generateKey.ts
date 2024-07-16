import { Functioneer, FunctionRunResult } from "functioneer";
import * as shared from "./shared/shared";
import { WalletService } from "./shared/walletService";
import { IDecodedSeed, ISeed } from "./model/seed";

interface exportedSeedInfo {
  alias: string;
  seed: string;
  publicId: string;
  watchOnly: boolean;
}

export function addFunction(func: Functioneer) {
  func.registerFunction(
    "wallet.generateKey",
    "Generates a pair of keys for an account",
    async () => {
      const key = await crypto.subtle.generateKey(shared.rsaAlg, true, [
        "encrypt",
        "decrypt",
      ]);
      return JSON.stringify({
        publicKey: await crypto.subtle.exportKey("jwk", key.publicKey),
        privateKey: await crypto.subtle.exportKey("jwk", key.privateKey),
      });
    }
  );
}
