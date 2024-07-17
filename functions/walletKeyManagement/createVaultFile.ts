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
  func
    .registerFunction(
      "wallet.createVaultFile",
      "Creates a vault file from wallet contents",
      async (password: string, seedsJSON: string) => {
        let inputSeeds: exportedSeedInfo[] = [];
        try {
          inputSeeds = JSON.parse(seedsJSON) as exportedSeedInfo[];
        } catch (e) {
          throw "Could not parse seeds JSON";
        }
        const seeds: IDecodedSeed[] = [];
        for (const seed of inputSeeds) {
          if (!seed.seed || !/^([a-z]){55}$/g.test(seed.seed)) {
            throw new Error(
              "Seed must be 55 characters long and only contain lowercase letters"
            );
          }
          if (!seed.publicId || !/^([A-Z]){60}$/g.test(seed.publicId)) {
            throw new Error(
              "Public ID must be 60 characters long and contain only uppercase letters"
            );
          }
          seeds.push({
            alias: seed.alias,
            seed: seed.seed,
            publicId: seed.publicId,
            balance: 0,
            balanceTick: 0,
            encryptedSeed: "",
          });
        }

        const wService = new WalletService();
        await wService.createNewKeys();
        wService.runningConfiguration.name = "exported";
        for (const seed of seeds) {
          await wService.addSeed(seed);
        }
        return JSON.stringify({ base64: await wService.exportVault(password) });
      }
    )
    .addField("password", "string", "Password to encrypt the vault file with")
    .addField(
      "seedsJSON",
      "string",
      "JSON string of seeds to export [{alias: string, seed: string, publicId: string}]"
    );
}
