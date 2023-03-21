import {
    toBaseAddress, toRewardAddress, toEnterpriseAddress
} from "./converter";

export const resolvePaymentKeyHash = (bech32: string) => {
    try {
        const paymentKeyHash = [
            toBaseAddress(bech32)?.payment_cred().to_keyhash(),
            toEnterpriseAddress(bech32)?.payment_cred().to_keyhash(),
        ].find((kh) => kh !== undefined);

        if (paymentKeyHash !== undefined)
            return paymentKeyHash.to_hex();

        throw new Error(`Couldn't resolve payment key hash from address: ${bech32}`);
    } catch (error) {
        throw new Error(`An error occurred during resolvePaymentKeyHash: ${error}.`);
    }
};

export const resolveStakeKeyHash = (bech32: string) => {
    try {
        const stakeKeyHash = [
            toBaseAddress(bech32)?.stake_cred().to_keyhash(),
            toRewardAddress(bech32)?.payment_cred().to_keyhash(),
        ].find((kh) => kh !== undefined);

        if (stakeKeyHash !== undefined)
            return stakeKeyHash.to_hex();

        throw new Error(`Couldn't resolve stake key hash from address: ${bech32}`);
    } catch (error) {
        throw new Error(`An error occurred during resolveStakeKeyHash: ${error}.`);
    }
};