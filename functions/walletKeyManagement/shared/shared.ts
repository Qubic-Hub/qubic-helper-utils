export const rsaAlg = {
  name: "RSA-OAEP",
  modulusLength: 4096,
  publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
  hash: { name: "SHA-256" },
};
export const aesAlg = {
  name: "AES-GCM",
  length: 256,
  iv: new Uint8Array(12).fill(0),
};
export const encAlg = {
  name: "RSA-OAEP",
};

export const importKey = async (
  key: JsonWebKey,
  type: "public" | "private"
) => {
  return crypto.subtle.importKey(
    "jwk",
    key,
    rsaAlg,
    true,
    type === "public" ? ["encrypt"] : ["decrypt"]
  );
};
