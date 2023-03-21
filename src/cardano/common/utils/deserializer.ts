import { csl } from "../../core";
import { toBytes } from "./converter";

export const deserializeAddress = (address: string) => csl.Address
  .from_bytes(toBytes(address));

export const deserializeBip32PrivateKey = (bip32PrivateKey: string) => csl.Bip32PrivateKey
  .from_bytes(toBytes(bip32PrivateKey));

export const deserializeEd25519Signature = (ed25519Signature: string) => csl.Ed25519Signature
  .from_bytes(toBytes(ed25519Signature));

export const deserializePublicKey = (publicKey: string) => csl.PublicKey
  .from_bytes(toBytes(publicKey));

