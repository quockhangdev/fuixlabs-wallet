import { generateMnemonic, mnemonicToEntropy } from "bip39";
import { customAlphabet } from "nanoid";
import { checkSignature, csl, deriveAccountKeys, signMessage } from "../core";
import {
    buildBaseAddress, buildBip32PrivateKey,
    buildRewardAddress, buildEnterpriseAddress, fromBytes, fromUTF8,
} from "../common/utils/index";
import type {
    Address, Message, PrivateKey, Signer
} from "../core";

import type { Account, DataSignature } from "../common/types/index";

export class BaseWallet {
    constructor(
        private readonly _networkId: number,
        private readonly _encryptedSecret: string | [string, string],
    ) { }

    getAccount(accountIndex: number, password: string): Account {
        return this.accountContext(accountIndex, password, (paymentKey, stakeKey) => {
            const baseAddress = buildBaseAddress(
                this._networkId, paymentKey.to_public().hash(), stakeKey.to_public().hash(),
            ).to_address().to_bech32();

            const enterpriseAddress = buildEnterpriseAddress(
                this._networkId, paymentKey.to_public().hash(),
            ).to_address().to_bech32();

            const rewardAddress = buildRewardAddress(
                this._networkId, stakeKey.to_public().hash(),
            ).to_address().to_bech32();

            return <Account>{
                baseAddress,
                enterpriseAddress,
                rewardAddress,
            };
        }
        );
    }

    signData(
        accountIndex: number, password: string,
        address: string, payload: string,
    ): DataSignature {
        try {
            return this.accountContext(accountIndex, password, (paymentKey, stakeKey) => {
                const message: Message = { payload };

                const signer: Signer = {
                    address: BaseWallet.resolveAddress(
                        this._networkId, address, paymentKey, stakeKey
                    ),
                    key: address.startsWith("stake") ? stakeKey : paymentKey,
                };

                const {
                    coseSign1: signature, coseKey: key
                } = signMessage(message, signer);

                return <DataSignature>{ signature, key };
            }
            );
        } catch (error) {
            throw new Error(`An error occurred during signData: ${error}.`);
        }
    }

    verifySignature(
        accountIndex: number, password: string,
        address: string, payload: string, { signature, key }: DataSignature,
    ): boolean {
        try {
            return this.accountContext(accountIndex, password, (paymentKey, stakeKey) => {
                const message: string = payload;

                const signer: Signer = {
                    address: BaseWallet.resolveAddress(
                        this._networkId, address, paymentKey, stakeKey
                    ),
                    key: address.startsWith("stake") ? stakeKey : paymentKey,
                };

                return checkSignature(message, signer.address.to_bech32(), { signature, key });
            });
        } catch (error) {
            throw new Error(`An error occurred during verifySignature: ${error}.`);
        }
    }

    static encryptMnemonic(words: string[], password: string): string {
        const entropy = mnemonicToEntropy(words.join(" "));
        const bip32PrivateKey = buildBip32PrivateKey(entropy);
        const cborBip32PrivateKey = fromBytes(bip32PrivateKey.as_bytes());

        bip32PrivateKey.free();

        return BaseWallet.encrypt(cborBip32PrivateKey, password);
    }

    static generateMnemonic(strength = 256): string[] {
        const mnemonic = generateMnemonic(strength);
        return mnemonic.split(" ");
    }

    private accountContext<T>(
        accountIndex: number, password: string,
        callback: (paymentKey: PrivateKey, stakeKey: PrivateKey) => T,
    ): T {
        const { paymentKey, stakeKey } = BaseWallet.resolveKeys(
            accountIndex, password, this._encryptedSecret,
        );

        const result = callback(paymentKey, stakeKey);

        paymentKey.free();
        stakeKey.free();

        return result;
    }

    private static decrypt(data: string, password: string): string {
        try {
            return csl.decrypt_with_password(
                fromUTF8(password), data,
            );
        } catch (error) {
            throw new Error("The password is incorrect.");
        }
    }

    private static encrypt(data: string, password: string): string {
        const generateRandomHex = customAlphabet("0123456789abcdef");
        const salt = generateRandomHex(64);
        const nonce = generateRandomHex(24);
        return csl.encrypt_with_password(
            fromUTF8(password), salt, nonce, data,
        );
    }

    private static resolveAddress(
        networkId: number, bech32: string,
        payment: PrivateKey, stake: PrivateKey,
    ): Address {
        const address = [
            buildBaseAddress(networkId, payment.to_public().hash(), stake.to_public().hash()),
            buildEnterpriseAddress(networkId, payment.to_public().hash()),
            buildRewardAddress(networkId, stake.to_public().hash()),
        ].find((a) => a.to_address().to_bech32() === bech32);

        if (address !== undefined)
            return address.to_address();

        throw new Error(`Address: ${bech32} doesn't belong to this account.`);
    }

    private static resolveKeys(
        accountIndex: number, password: string,
        encryptedSecret: string | [string, string],
    ): { paymentKey: PrivateKey; stakeKey: PrivateKey; } {
        if (typeof encryptedSecret === 'string') {
            const rootKey = BaseWallet
                .decrypt(encryptedSecret, password);

            return deriveAccountKeys(rootKey, accountIndex);
        }

        const cborPaymentKey = BaseWallet
            .decrypt(encryptedSecret[0], password);

        const cborStakeKey = BaseWallet
            .decrypt(encryptedSecret[1], password);

        return {
            paymentKey: csl.PrivateKey.from_hex(cborPaymentKey),
            stakeKey: csl.PrivateKey.from_hex(cborStakeKey),
        };
    }

}  