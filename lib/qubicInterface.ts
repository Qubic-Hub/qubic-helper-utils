import { RequestPackageTypes } from "./requestPackageTypes";
import { QubicHelper } from "@qubic-lib/qubic-ts-library/dist/qubicHelper";
import { QubicTransferAssetPayload } from "@qubic-lib/qubic-ts-library/dist/qubic-types/transacion-payloads/QubicTransferAssetPayload";
import { QubicTransaction } from "@qubic-lib/qubic-ts-library/dist/qubic-types/QubicTransaction";
import { RequestResponseHeader } from "@qubic-lib/qubic-ts-library/dist/qubic-communication/RequestResponseHeader";
import { PublicKey } from "@qubic-lib/qubic-ts-library/dist/qubic-types/PublicKey";
import { QubicDefinitions } from "@qubic-lib/qubic-ts-library/dist/QubicDefinitions";

export function encodeBase64Bytes(bytes: Uint8Array): string {
  return btoa(
    bytes.reduce((acc, current) => acc + String.fromCharCode(current), "")
  );
}

export function base64ToUint8(base64: string) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

export function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export class QubicInterface {
  private qubicHelper: QubicHelper = new QubicHelper();

  async getPublicId(seed: string) {
    const result = await this.qubicHelper.createIdPackage(seed);
    return {
      publicId: result.publicId,
      publicKeyB64: arrayBufferToBase64(result.publicKey),
      privateKeyB64: arrayBufferToBase64(result.privateKey),
    };
  }

  async sendTransactionRaw(base64: string) {
    const transaction = new QubicTransaction();
    const header = new RequestResponseHeader(
      RequestPackageTypes.BROADCAST_TRANSACTION,
      transaction.getPackageSize()
    );
    return {
      header: header.getPackageData(),
      transaction: base64ToArrayBuffer(base64),
    };
  }

  async getTransaction(
    sourceSeed: string,
    destinationPublicId: string,
    amount: number,
    tick: number,
    asBase64: boolean = true
  ) {
    const sourceInfo = await this.qubicHelper.createIdPackage(sourceSeed);
    const transaction = new QubicTransaction()
      .setDestinationPublicKey(destinationPublicId)
      .setSourcePublicKey(sourceInfo.publicId)
      .setAmount(amount)
      .setTick(tick);

    const tx = await transaction.build(sourceSeed);

    return {
      transaction: asBase64
        ? arrayBufferToBase64(transaction.getPackageData())
        : transaction.getPackageData(),
    };
  }

  getAssetTransferTransaction = async (
    sourceSeed: string,
    destinationPublicId: string,
    assetName: string,
    assetIssuer: string,
    numberOfUnits: number,
    tick: number,
    asBase64: boolean = true
  ) => {
    const sourceInfo = await this.qubicHelper.createIdPackage(sourceSeed);
    const targetAddress = new PublicKey(destinationPublicId);

    const assetTransfer = new QubicTransferAssetPayload()
      .setIssuer(assetIssuer)
      .setNewOwnerAndPossessor(destinationPublicId)
      .setAssetName(assetName)
      .setNumberOfUnits(numberOfUnits);

    // build and sign tx
    const transaction = new QubicTransaction()
      .setSourcePublicKey(sourceInfo.publicId)
      .setDestinationPublicKey(QubicDefinitions.QX_ADDRESS) // a transfer should go the QX SC
      .setAmount(QubicDefinitions.QX_TRANSFER_ASSET_FEE)
      .setTick(tick) // just a fake tick
      .setInputType(QubicDefinitions.QX_TRANSFER_ASSET_INPUT_TYPE)
      .setPayload(assetTransfer);

    const tx = await transaction.build(sourceSeed);

    return {
      transaction: asBase64
        ? arrayBufferToBase64(transaction.getPackageData())
        : transaction.getPackageData(),
    };
  };
}
