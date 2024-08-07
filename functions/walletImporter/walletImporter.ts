import { IConfig, IEncryptedVaultFile, IVaultFile } from "./model/config";
import { ISeed } from "./model/seed";

export class WalletImporter {
  public runningConfiguration: IConfig = {
    seeds: [],
    publicKey: undefined,
  };
  private configName = "wallet-config";
  public privateKey: CryptoKey | null = null;
  public publicKey: CryptoKey | null = null;
  public isWalletReady = false;

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

  private crypto: any;

  constructor() {
    if (
      typeof process !== "undefined" &&
      process.versions &&
      process.versions.node
    ) {
      const wc = require("crypto").webcrypto;
      this.crypto = wc;
    } else {
      this.crypto = crypto;
    }
  }

  /**
   * Imports and unlocks either a vault file or a configuration file.
   * @param selectedFileIsVaultFile - Indicates whether the selected file is a vault file or a configuration file.
   * @param password - The password used for decryption or unlocking.
   * @param selectedConfigFile - The configuration file to be imported (if not a vault file).
   * @param file - The vault file to be imported (if it is a vault file).
   * @param unlock - Determines whether to unlock the configuration file (if it is a configuration file).
   * @returns A Promise that resolves to a boolean indicating whether the import and unlock process was successful or not.
   */
  public async importAndUnlock(
    selectedFileIsVaultFile: boolean,
    password: string,
    selectedConfigFile: File | null = null,
    file: File | null = null,
    unlock: boolean = false
  ): Promise<boolean> {
    if (selectedFileIsVaultFile) {
      // one vault file
      const binaryFileData = await file?.arrayBuffer();
      if (binaryFileData) {
        const success = await this.importVault(binaryFileData, <any>password);
        if (success) {
          this.isWalletReady = true;
          return this.isWalletReady;
        } else {
          return Promise.reject(
            "Import Failed (password or file do not match)"
          );
        }
      } else {
        return Promise.reject("Unlock Failed (no file)");
      }
    } else {
      const binaryFileData = await selectedConfigFile?.arrayBuffer();
      if (binaryFileData) {
        const enc = new TextDecoder("utf-8");
        const jsonData = enc.decode(binaryFileData);
        if (jsonData) {
          const config = JSON.parse(jsonData);

          // import configuration
          if (await unlock) {
            // legacy format
            await this.importConfig(config);
          }
          return true;
        } else {
          return Promise.reject("Unlock Failed (no file)");
        }
      }
      return false;
    }
  }

  private async decrypt(
    privateKey: CryptoKey,
    message: ArrayBuffer
  ): Promise<ArrayBuffer> {
    const msg = await this.crypto.subtle.decrypt(
      this.encAlg,
      privateKey,
      message
    );
    return msg;
  }

  public getSeeds() {
    return this.runningConfiguration.seeds;
  }

  public getSeed(publicId: string): ISeed | undefined {
    return this.runningConfiguration.seeds.find((f) => f.publicId === publicId);
  }

  public async revealSeed(publicId: string): Promise<string> {
    const seed = this.getSeed(publicId);
    if (seed === undefined) return Promise.reject(null);
    try {
      const decryptedSeed = await this.decrypt(
        this.privateKey!,
        this.base64ToArrayBuffer(seed?.encryptedSeed!)
      );
      return new TextDecoder().decode(decryptedSeed);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /**
   * Imports and unlocks a vault file.
   * @param binaryVaultFile - The encrypted vault file as an ArrayBuffer.
   * @param password - The password used for decryption.
   * @returns A Promise that resolves to a boolean indicating whether the import was successful or not.
   */
  public async importVault(
    binaryVaultFile: ArrayBuffer /* encrypted vault file */,
    password: string
  ): Promise<boolean> {
    if (!this.isVaultFile(binaryVaultFile))
      return Promise.reject("INVALID VAULT FILE");

    try {
      // unlock
      await this.unlockVault(binaryVaultFile, password);
      const vault = await this.convertBinaryVault(binaryVaultFile, password);

      // import configuration
      await this.importConfig(vault.configuration);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Checks if the provided binary file is a valid vault file.
   * @param binaryFile - The binary file to be checked.
   * @returns A boolean indicating whether the file is a valid vault file or not.
   */
  private isVaultFile(binaryFile: ArrayBuffer): boolean {
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

  /**
   * Unlocks a vault file using the provided password.
   * @param binaryVaultFile - The encrypted vault file as an ArrayBuffer.
   * @param password - The password used for decryption.
   * @returns A Promise that resolves to a boolean indicating whether the unlock process was successful or not.
   */
  private async unlockVault(
    binaryVaultFile: ArrayBuffer /* encrypted vault file */,
    password: string
  ): Promise<boolean> {
    if (!this.isVaultFile(binaryVaultFile))
      return Promise.reject("INVALID VAULT FILE");

    try {
      const decryptedVaultFile = await this.convertBinaryVault(
        binaryVaultFile,
        password
      );
      const privKey = this.base64ToArrayBuffer(decryptedVaultFile.privateKey);
      const { privateKey, publicKey } = await this.importEncryptedPrivateKey(
        privKey,
        password
      );

      await this.setKeys(publicKey, privateKey);
      await this.save();
      return true;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Saves the current configuration, optionally locking it.
   * @param lock - Determines whether to lock the configuration or not.
   * @returns A Promise that resolves when the save operation is complete.
   */
  private async save(lock: boolean = false): Promise<void> {
    await this.saveConfig(lock);
  }

  /**
   * Saves the current configuration to the local storage, optionally locking it.
   * @param lock - Determines whether to lock the configuration or not.
   */
  private async saveConfig(lock: boolean) {
    if (lock) {
      // when locking we don't want that the public key is saved.
      this.runningConfiguration.publicKey = undefined;
      localStorage.setItem(
        this.configName,
        JSON.stringify(this.runningConfiguration)
      );
    } else {
      try {
        const jwk = await this.crypto.subtle.exportKey("jwk", this.publicKey!);
        this.runningConfiguration.publicKey = jwk;
        localStorage.setItem(
          this.configName,
          JSON.stringify(this.runningConfiguration)
        );
      } catch (e) {
        // ignore
      }
    }
  }

  /**
   * Sets the public and private keys for the current configuration.
   * @param publicKey - The public key to be set.
   * @param privateKey - The private key to be set (can be null).
   */
  private async setKeys(
    publicKey: CryptoKey,
    privateKey: CryptoKey | null = null
  ) {
    try {
      this.publicKey = publicKey;
      // also push the current publickey to the running configuration
      const jwk = await this.crypto.subtle.exportKey("jwk", this.publicKey!);
      this.runningConfiguration.publicKey = jwk;

      if (privateKey) this.privateKey = privateKey;
    } catch (e) {
      // ignore
    }
  }

  /**
   * Converts the binary vault file to the internal vault file format (uploaded by the user).
   * @param binaryVaultFile - The encrypted vault file as an ArrayBuffer.
   * @param password - The password used for decryption.
   * @returns A Promise that resolves to an IVaultFile object representing the decrypted vault file.
   */
  private async convertBinaryVault(
    binaryVaultFile: ArrayBuffer /* encrypted vault file */,
    password: string
  ): Promise<IVaultFile> {
    try {
      const enc = new TextDecoder("utf-8");
      const encryptedVaultFile = JSON.parse(
        enc.decode(binaryVaultFile)
      ) as IEncryptedVaultFile;

      const decryptedVaultFile = await this.decryptVault(
        encryptedVaultFile,
        password
      );
      return decryptedVaultFile;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Decrypts the encrypted vault file data using the provided password.
   * @param encryptedData - The encrypted vault file data.
   * @param password - The password used for decryption.
   * @returns A Promise that resolves to an IVaultFile object representing the decrypted vault file.
   */
  private async decryptVault(
    encryptedData: IEncryptedVaultFile,
    password: string
  ): Promise<IVaultFile> {
    const salt = this.base64ToBytes(encryptedData.salt);

    const key = await this.getVaultFileKey(password, salt);

    const iv = this.base64ToBytes(encryptedData.iv);

    const cipher = this.base64ToBytes(encryptedData.cipher);

    const contentBytes = new Uint8Array(
      await this.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher)
    );
    const decryptedVault = this.bytesToString(contentBytes);
    return JSON.parse(decryptedVault);
  }

  /**
   * Imports a configuration object.
   * @param config - The configuration object to be imported.
   * @returns A Promise that resolves to a boolean indicating whether the import was successful or not.
   */
  private async importConfig(config: IConfig): Promise<boolean> {
    if (!config || config.seeds.length <= 0) return false;

    await this.loadConfig(config);
    await this.saveConfig(false);
    return true;
  }

  /**
   * Loads a configuration object and sets up the necessary keys.
   * @param config - The configuration object to be loaded.
   */
  private async loadConfig(config: IConfig) {
    this.runningConfiguration = config;

    // convert json key to internal cryptokey
    if (this.runningConfiguration.publicKey) {
      const k = await this.crypto.subtle.importKey(
        "jwk",
        this.runningConfiguration.publicKey,
        this.rsaAlg,
        true,
        ["encrypt"]
      );
      this.publicKey = k;
      this.isWalletReady = true;
    }
  }

  /**
   * Derives a key from the provided password and salt for decrypting the vault file.
   * @param password - The password used for key derivation.
   * @param salt - The salt value used for key derivation.
   */
  private async getVaultFileKey(password: string, salt: any) {
    const passwordBytes = this.stringToBytes(password);
    const initialKey = await this.crypto.subtle.importKey(
      "raw",
      passwordBytes,
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    return this.crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
      initialKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Imports an encrypted private key using the provided password.
   * @param wrappedKey - The wrapped (encrypted) private key.
   * @param password - The password used for decryption.
   * @returns A Promise that resolves to an object containing the private key (CryptoKey) and the corresponding public key (CryptoKey).
   */
  private async importEncryptedPrivateKey(
    wrappedKey: ArrayBuffer,
    password: string
  ): Promise<{ privateKey: CryptoKey; publicKey: CryptoKey }> {
    return this.importKey(password).then((pwKey: CryptoKey) => {
      return this.deriveKey(pwKey).then((wrapKey: CryptoKey) => {
        return this.crypto.subtle
          .unwrapKey(
            "jwk",
            wrappedKey,
            wrapKey,
            this.aesAlg,
            this.rsaAlg,
            true,
            ["decrypt"]
          )
          .then((privateKey) => {
            return this.getPublicKey(privateKey).then((publicKey) => {
              return { privateKey, publicKey };
            });
          });
      });
    });
  }

  /**
   * Imports a key from the provided password.
   * @param password - The password used for key import.
   * @returns A Promise that resolves to the imported key (CryptoKey).
   */
  private async importKey(password: string) {
    const enc = new TextEncoder();
    const pw = enc.encode(password);

    return (<any>this.crypto.subtle).importKey(
      "raw",
      pw,
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
  }

  /**
   * Derives a key from the provided password key.
   * @param pwKey - The password key used for key derivation.
   * @returns A Promise that resolves to the derived key (CryptoKey).
   */
  private async deriveKey(pwKey: CryptoKey) {
    const salt = new Uint8Array(16).fill(0);

    return this.crypto.subtle.deriveKey(
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

  /**
   * Converts a Uint8Array of bytes to a string.
   * @param bytes - The bytes to be converted.
   * @returns A string representation of the bytes.
   */
  private bytesToString(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes);
  }

  /**
   * Converts a string to a Uint8Array of bytes.
   * @param str - The string to be converted.
   * @returns A Uint8Array of bytes representing the string.
   */
  private stringToBytes(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }

  /**
   * Converts a Uint8Array of bytes to a Base64 string.
   * @param arr - The bytes to be converted.
   * @returns A Base64 string representation of the bytes.
   */
  privatebytesToBase64(arr: Uint8Array): string {
    return btoa(Array.from(arr, (b) => String.fromCharCode(b)).join(""));
  }

  /**
   * Converts a Base64 string to a Uint8Array of bytes.
   * @param base64 - The Base64 string to be converted.
   * @returns A Uint8Array of bytes representing the Base64 string.
   */
  private base64ToBytes(base64: string): Uint8Array {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  }

  /**
   * Derives the public key from the provided private key.
   * @param privateKey - The private key used to derive the public key.
   * @returns A Promise that resolves to the derived public key (CryptoKey).
   */
  async getPublicKey(privateKey: CryptoKey) {
    const jwkPrivate = await this.crypto.subtle.exportKey("jwk", privateKey);
    delete jwkPrivate.d;
    jwkPrivate.key_ops = ["encrypt"];
    return this.crypto.subtle.importKey("jwk", jwkPrivate, this.rsaAlg, true, [
      "encrypt",
    ]);
  }

  /**
   * Converts a Base64 string to an ArrayBuffer.
   * @param base64 - The Base64 string to be converted.
   * @returns An ArrayBuffer representing the Base64 string.
   */
  public base64ToArrayBuffer(base64: string) {
    const binary_string = atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
