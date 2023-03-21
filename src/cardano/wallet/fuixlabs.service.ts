import type { DataSignature } from "../common/types/index";
import { BaseWallet } from "./base.service";

const DEFAULT_PASSWORD = "FUIXLABS-DEFAULT-PASSWORD";

export type CreateAppWalletOptions = {
    networkId: number;
    key: {
        type: "mnemonic";
        words: string[];
    };
};

export class FuixlabsWallet {
    private readonly _wallet: BaseWallet;

    constructor(options: CreateAppWalletOptions) {
        switch (options.key.type) {
            case "mnemonic":
                this._wallet = new BaseWallet(
                    options.networkId,
                    BaseWallet.encryptMnemonic(options.key.words, DEFAULT_PASSWORD),
                );
                break;
            default:
                throw new Error("Invalid key type");
        }
    }

    getPaymentAddress(accountIndex = 0): string {
        const account = this._wallet
            .getAccount(accountIndex, DEFAULT_PASSWORD);
        return account.baseAddress;
    }

    getRewardAddress(accountIndex = 0): string {
        const account = this._wallet
            .getAccount(accountIndex, DEFAULT_PASSWORD);
        return account.rewardAddress;
    }

    signData(address: string, payload: string, accountIndex = 0): DataSignature {
        try {
            return this._wallet.signData(accountIndex, DEFAULT_PASSWORD, address, payload);
        } catch (error) {
            throw new Error(`[FuixlabsWallet] An error occurred during signData: ${error}.`);
        }
    }

    verifySignature(address: string, payload: string, { signature, key }: DataSignature, accountIndex = 0): boolean {
        try {
            return this._wallet.verifySignature(accountIndex, DEFAULT_PASSWORD, address, payload, { signature, key });
        } catch (error) {
            throw new Error(`[FuixlabsWallet] An error occurred during verifySignature: ${error}.`);
        }
    }

    static brew(strength = 256): string[] {
        return BaseWallet.generateMnemonic(strength);
    }
}