import { csl } from "../../core";

/* -----------------[ Bytes ]----------------- */
export const fromBytes = (bytes: Uint8Array) => Buffer.from(bytes).toString("hex");

export const toBytes = (hex: string): Uint8Array => {
    if (hex.length % 2 === 0 && /^[0-9A-F]*$/i.test(hex))
        return Buffer.from(hex, "hex");

    return Buffer.from(hex, "utf-8");
};

/* -----------------[ UTF-8 ]----------------- */
export const fromUTF8 = (utf8: string) => {
    if (utf8.length % 2 === 0 && /^[0-9A-F]*$/i.test(utf8))
        return utf8;

    return fromBytes(Buffer.from(utf8, "utf-8"));
};

export const toUTF8 = (hex: string) => Buffer.from(hex, "hex").toString("utf-8");

/* -----------------[ Address ]----------------- */

export const toAddress = (bech32: string) => csl.Address.from_bech32(bech32);

export const toBaseAddress = (bech32: string) => csl.BaseAddress.from_address(toAddress(bech32));

export const toEnterpriseAddress = (bech32: string) => csl.EnterpriseAddress.from_address(toAddress(bech32));

export const toRewardAddress = (bech32: string) => csl.RewardAddress.from_address(toAddress(bech32));