import { IConfig, IEncryptedVaultFile, IVaultFile } from "../model/config";
import { arrayBufferToBase64 } from "../../../lib/qubicInterface";
import { IDecodedSeed, ISeed } from "../model/seed";

export class WalletService {
  public privateKey: CryptoKey | null = null;
  public publicKey: CryptoKey | null = null;
  public runningConfiguration: IConfig;
  private isWalletReady = false;
  public configError = false;
  public erroredCOnfig: string = "";

  private rsaAlg = {
    name: "RSA-OAEP",
    modulusLength: 4096,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    hash: { name: "SHA-256" },
  };
  private aesAlg = {
    name: "AES-GCM",
    length: 256,
    iv: new Uint8Array(12).fill(0),
  };
  private encAlg = {
    name: "RSA-OAEP",
  };

  constructor(private persistence = true) {
    // create empty configuration
    this.runningConfiguration = {
      seeds: [],
      webBridges: [],
      tickAddition: 10,
      useBridge: false,
      enableBeta: false,
    };
  }

  private async loadConfig(config: IConfig) {
    this.runningConfiguration = config;

    // backward compatibility
    if (!this.runningConfiguration.tickAddition)
      this.runningConfiguration.tickAddition = 20;

    // convert json key to internal cryptokey
    if (this.runningConfiguration.publicKey) {
      const k = await crypto.subtle.importKey(
        "jwk",
        this.runningConfiguration.publicKey,
        this.rsaAlg,
        true,
        ["encrypt"]
      );
      this.publicKey = k;
      this.isWalletReady = true;
    }

    const tempFixedBridgeAddress = "wss://webbridge.qubic.li";

    if (!this.runningConfiguration.webBridges)
      this.runningConfiguration.webBridges = [];

    // remove legacy entries
    this.runningConfiguration.webBridges =
      this.runningConfiguration.webBridges.filter(
        (f) => f !== "https://1.b.qubic.li"
      );
    if (this.runningConfiguration.webBridges.length <= 0)
      this.runningConfiguration.webBridges.push(tempFixedBridgeAddress);

    // todo: load web bridges dynamically
  }

  public async loadConfigFromString(jsonString: string) {
    try {
      const config = JSON.parse(jsonString);
      await this.loadConfig(config);
    } catch (e) {
      this.configError = true;
      this.erroredCOnfig = jsonString;
    }
  }

  private async encrypt(message: string): Promise<ArrayBuffer> {
    return crypto.subtle
      .encrypt(this.encAlg, this.publicKey!, new TextEncoder().encode(message))
      .then((emessage) => {
        return emessage;
      });
  }

  public addSeed(seed: IDecodedSeed): Promise<ISeed> {
    return this.encrypt(seed.seed).then((encryptedSeed) => {
      const newSeed = <ISeed>{
        encryptedSeed: btoa(
          String.fromCharCode(...new Uint8Array(encryptedSeed))
        ),
        alias: seed.alias,
        publicId: seed.publicId,
        isOnlyWatch: seed.isOnlyWatch,
      };
      this.runningConfiguration.seeds.push(newSeed);
      return newSeed;
    });
  }
  public arrayBufferToBase64 = arrayBufferToBase64;

  private async importKey(password: string) {
    const enc = new TextEncoder();
    const pw = enc.encode(password);

    return (<any>crypto.subtle).importKey(
      "raw",
      pw,
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
  }
  private async deriveKey(pwKey: CryptoKey) {
    const salt = new Uint8Array(16).fill(0);
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      pwKey,
      this.aesAlg,
      true,
      ["wrapKey", "unwrapKey"]
    );
  }

  private async createJsonKey(password: string): Promise<ArrayBuffer | null> {
    if (!this.privateKey) return Promise.resolve<ArrayBuffer | null>(null);

    const pwKey = await this.importKey(password);
    const wrapKey = await this.deriveKey(pwKey);
    const jsonKey = await crypto.subtle.wrapKey(
      "jwk",
      this.privateKey!,
      wrapKey,
      this.aesAlg
    );

    return jsonKey;
  }

  private prepareConfigExport(): IConfig {
    const exportConfig: IConfig = {
      name: this.runningConfiguration.name,
      seeds: this.runningConfiguration.seeds.map((m) => {
        const exportSeed: ISeed = <ISeed>{};
        Object.assign(exportSeed, m);
        // reset states balance
        exportSeed.balanceTick = 0;
        exportSeed.lastUpdate = undefined;
        exportSeed.isExported = true;
        return exportSeed;
      }),
      webBridges: this.runningConfiguration.webBridges,
      useBridge: this.runningConfiguration.useBridge,
      tickAddition: this.runningConfiguration.tickAddition,
      enableBeta: this.runningConfiguration.enableBeta,
    };
    return exportConfig;
  }
  private stringToBytes(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }
  private bytesToBase64(arr: Uint8Array): string {
    return btoa(Array.from(arr, (b) => String.fromCharCode(b)).join(""));
  }
  private base64ToBytes(base64: string): Uint8Array {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  }

  private async getVaultFileKey(password: string, salt: any) {
    const passwordBytes = this.stringToBytes(password);

    const initialKey = await crypto.subtle.importKey(
      "raw",
      passwordBytes,
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
      initialKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }
  private async encryptVault(
    vaultFile: IVaultFile,
    password: string
  ): Promise<IEncryptedVaultFile> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await this.getVaultFileKey(password, salt);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const contentBytes = this.stringToBytes(JSON.stringify(vaultFile));

    const cipher = new Uint8Array(
      await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, contentBytes)
    );

    return {
      salt: this.bytesToBase64(salt),
      iv: this.bytesToBase64(iv),
      cipher: this.bytesToBase64(cipher),
    };
  }

  public async exportVault(password: string): Promise<string> {
    if (!this.privateKey || !this.runningConfiguration.publicKey)
      return Promise.reject("Private- or PublicKey not loaded");

    const jsonKey = await this.createJsonKey(password);
    if (jsonKey === null) {
      return Promise.reject("JSONKEY IS NULL");
    }

    const vaultFile: IVaultFile = {
      privateKey: this.arrayBufferToBase64(jsonKey),
      publicKey: this.runningConfiguration.publicKey!,
      configuration: this.prepareConfigExport(),
    };

    const encryptedVaultFile = await this.encryptVault(vaultFile, password);

    const fileData = new TextEncoder().encode(
      JSON.stringify(encryptedVaultFile)
    );
    const blob = new Blob([fileData], { type: "application/octet-stream" });
    const name = this.runningConfiguration.name ?? "qubic-wallet";

    //this.downloadBlob(name + ".qubic-vault", blob);
    //this.shouldExportKey = false;

    //await this.markSeedsAsSaved();
    return this.arrayBufferToBase64(fileData);
  }
  public isVaultFile(binaryFile: ArrayBuffer): boolean {
    try {
      const enc = new TextDecoder("utf-8");
      const jsonData = enc.decode(binaryFile);
      const vaultFile = JSON.parse(jsonData) as IEncryptedVaultFile;
      return (
        vaultFile !== undefined &&
        vaultFile.cipher !== undefined &&
        vaultFile.iv !== undefined &&
        vaultFile.salt !== undefined
      );
    } catch (error) {
      return false;
    }
  }

  private async setKeys(
    publicKey: CryptoKey,
    privateKey: CryptoKey | null = null
  ) {
    this.publicKey = publicKey;
    // also push the current publickey to the running configuration
    const jwk = await crypto.subtle.exportKey("jwk", this.publicKey!);
    this.runningConfiguration.publicKey = jwk;

    if (privateKey) this.privateKey = privateKey;
  }

  public async createNewKeys() {
    const key = await crypto.subtle.generateKey(this.rsaAlg, true, [
      "encrypt",
      "decrypt",
    ]);
    await this.setKeys(key.publicKey, key.privateKey);
  }

  public async importConfig(config: IConfig): Promise<boolean> {
    if (!config || config.seeds.length <= 0) return false;

    await this.loadConfig(config);

    return true;
  }
}
