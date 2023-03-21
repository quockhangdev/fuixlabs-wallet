import { FuixlabsWallet } from "./fuixlabs.service";
import { NETWORK_ID } from "../common/constants";

const wallet = new FuixlabsWallet({
    networkId: NETWORK_ID.TESTNET,
    key: {
        type: "mnemonic",
        words: FuixlabsWallet.brew(),
    }
});

beforeAll(async () => {
    expect(wallet).toBeTruthy();
    const [paymentAddress, stakeAddress] = [wallet.getPaymentAddress(), wallet.getRewardAddress()];
    expect(paymentAddress).toBeTruthy();
    expect(stakeAddress).toBeTruthy();
    expect(paymentAddress).not.toEqual(stakeAddress);
});

describe("Fuixlabs Wallet", () => {
    test("signData", async () => {
        const { signature, key } = wallet.signData(
            [wallet.getPaymentAddress()][0],
            "hello world"
        );
        expect(signature).toBeTruthy();
        expect(key).toBeTruthy();
        expect(wallet.verifySignature(
            [wallet.getPaymentAddress()][0],
            "hello world",
            { signature, key }
        )).toEqual(true);
    });
});