export interface ISeed {
  alias: string;
  publicId: string;
  // publicKey: Uint8Array; // currently not used
  encryptedSeed: string;
  balance: number;
  balanceTick: number;
  lastUpdate?: Date;
  assets?: QubicAsset[];
  isExported?: boolean;
  isOnlyWatch?: boolean;
}

export interface IDecodedSeed extends ISeed {
  seed: string;
}

export interface QubicAsset {
  publicId: string;
  contractIndex: number;
  assetName: string;
  contractName: string;
  ownedAmount: number;
  possessedAmount: number;
  tick: number;
  reportingNodes: string[]; // New field to report source node
  issuerIdentity: string;
}
