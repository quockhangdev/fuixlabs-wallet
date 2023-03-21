import { csl } from "../../core";
import {
    fromUTF8, toBytes
} from "./converter";
import type {
    BaseAddress, Bip32PrivateKey, Ed25519KeyHash, EnterpriseAddress, RewardAddress,
} from "../../core";

export const buildBaseAddress = (
    networkId: number,
    paymentKeyHash: Ed25519KeyHash,
    stakeKeyHash: Ed25519KeyHash,
): BaseAddress => {
    return csl.BaseAddress.new(networkId,
        csl.StakeCredential.from_keyhash(paymentKeyHash),
        csl.StakeCredential.from_keyhash(stakeKeyHash),
    );
};

export const buildBip32PrivateKey = (
    entropy: string, password = "",
): Bip32PrivateKey => {
    return csl.Bip32PrivateKey.from_bip39_entropy(
        toBytes(entropy), toBytes(fromUTF8(password))
    );
};

export const buildEnterpriseAddress = (
    networkId: number, paymentKeyHash: Ed25519KeyHash,
): EnterpriseAddress => {
    return csl.EnterpriseAddress.new(networkId,
        csl.StakeCredential.from_keyhash(paymentKeyHash),
    );
};

export const buildRewardAddress = (
    networkId: number, stakeKeyHash: Ed25519KeyHash,
): RewardAddress => {
    return csl.RewardAddress.new(networkId,
        csl.StakeCredential.from_keyhash(stakeKeyHash),
    );
};