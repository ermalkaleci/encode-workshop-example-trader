import { ContractFactory, ethers } from "ethers";
import { PolkaSigner as SubstrateSigner, Signer as BodhiSigner, Provider as BodhiProvider } from "@acala-network/bodhi";
import { Keyring, WsProvider } from "@polkadot/api";
import Trader from "../build/Trader.json";

async function main() {
  const provider = new BodhiProvider({ provider: new WsProvider("ws://localhost:8000") });
  await provider.isReady()

  const keyring = new Keyring({ type: "sr25519" });
  const pair = keyring.addFromUri("//Alice");

  const signer = new SubstrateSigner(provider.api.registry, [pair]);
  const wallet = new BodhiSigner(provider, pair.address, signer);

  if (!await wallet.isClaimed()) {
    console.log("Claiming account...");
    await wallet.claimDefaultAccount();
  }

  console.log("Deploying trader contract...");

  const trader = await ContractFactory.fromSolidity(Trader).connect(wallet).deploy({ value: ethers.parseEther("100") });
  const traderAddress = await trader.getAddress();
  console.log(
    `Trader deployed to ${traderAddress} with balance: ${await provider.getBalance(traderAddress)}`
  );

  const traderSubstrateAddress = await provider.getSubstrateAddress(traderAddress)
  console.log("Trader Substrate address: ", traderSubstrateAddress);

  // first trade will fail because current price is not $1.0
  await trader.trade().catch((error) => {
    console.log("First trade failed as expected with error: ", error.message);
  });
  console.log(`Trader balance: ${await provider.getBalance(traderAddress)}`);

  console.log("Mock ACA price to be $1.0");
  await provider.api.rpc("dev_setStorage", {
    AcalaOracle: {
      Values: [
        [
          [{ Token: "ACA" }],
          {
            value: 1_000_000_000_000_000_000n,
            timestamp: Date.now(),
          }
        ]
      ]
    }
  });

  console.log("Trade again...");
  await trader.trade();
  console.log(`Trade successfull. Remaining balance: ${await provider.getBalance(traderAddress)}`);

  console.log("Trader AUSD balance: ", (await provider.api.query.tokens.accounts(traderSubstrateAddress, { Token: "AUSD" })).free.toHuman());
}

main().catch((error) => {
  console.error(error);
}).finally(() => process.exit());
