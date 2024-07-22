import { Functioneer, FunctionRunResult } from "functioneer";
import { WalletImporter } from "./walletImporter";
import { IDecodedSeed, ISeed } from "./model/seed";

interface exportedSeedInfo {
  alias: string;
  seed: string;
  publicId: string;
  watchOnly: boolean;
}

export function addFunction(func: Functioneer) {
  func
    .registerFunction(
      "wallet.importVault",
      "Reads the seeds of a vault file as base64. (supports only non watch only seeds)",
      async (password: string, base64VaultFile: string) => {
        const walletImporter = new WalletImporter();
        const ab = await walletImporter.base64ToArrayBuffer(base64VaultFile);
        const success = await walletImporter.importVault(ab, password);
        if (success) {
          const importedSeeds = walletImporter.getSeeds();
          const seeds: IDecodedSeed[] = [];

          for (const seed of importedSeeds) {
            seeds.push({
              alias: seed.alias,
              seed: await walletImporter.revealSeed(seed.publicId),
              publicId: seed.publicId,
              balance: 0,
              balanceTick: 0,
              encryptedSeed: "",
            });
          }
          return JSON.stringify({
            seeds: seeds,
          });
        } else {
          throw "Import Failed (password or file do not match)";
        }
      }
    )
    .addField("password", "string", "Password to decrypt the vault file with")
    .addField("base64VaultFile", "string", "Base64 encoded vault file");

  func
    .registerFunction(
      "wallet.importVaultFile",
      "Reads the seeds of a vault file. (supports only non watch only seeds)",
      async (password: string, filename: string) => {
        const walletImporter = new WalletImporter();
        const { readFileSync } = require("fs");
        var contents = readFileSync(filename, null);

        const success = await walletImporter.importVault(contents, password);
        if (success) {
          const importedSeeds = walletImporter.getSeeds();
          const seeds = [];

          for (const seed of importedSeeds) {
            if (seed.isOnlyWatch == null || seed.isOnlyWatch == false) {
              seeds.push({
                alias: seed.alias,
                seed: await walletImporter.revealSeed(seed.publicId),
                publicId: seed.publicId,
              });
            }
          }

          return JSON.stringify({
            seeds: seeds,
          });
        } else {
          throw "Import Failed (password or file do not match)";
        }
      }
    )
    .addField("password", "string", "Password to decrypt the vault file with")
    .addField("base64VaultFile", "string", "Base64 encoded vault file");
}
