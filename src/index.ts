import { Command } from "commander";
import * as nip49 from "nostr-tools/nip49";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { mkdir } from "node:fs/promises";
import prompts from "prompts";
import { decode } from "nostr-tools/nip19";
import {
  CashuMint,
  CashuWallet,
  getDecodedToken,
  getEncodedToken,
} from "@cashu/cashu-ts";
import { bytesToHex } from "nostr-tools/utils";

async function init() {
  const program = new Command();
  const filePath = join(homedir(), ".config", "nutcracker", "test.txt");
  await mkdir(dirname(filePath), { recursive: true });
  const keyFile = Bun.file(filePath);

  program
    .name("nutcracker")
    .description("CLI to unlock Cashu token")
    .version("0.0.1");

  program
    .command("set-key")
    .description("Sets an nsec for nutcracker to use")
    .action(async () => {
      try {
        const { encodedKey } = await prompts({
          type: "password",
          name: "encodedKey",
          message: "Please enter your nsec/ncrypt",
        });
        if (encodedKey.startsWith("nsec1")) {
          const decodedKeyRes = decode(encodedKey as `nsec1${string}`);
          const { passphrase } = await prompts({
            type: "password",
            name: "passphrase",
            message: "Please choose a passphrase",
          });
          const { confirmedPassphrase } = await prompts({
            type: "password",
            name: "confirmedPassphrase",
            message: "Please confirm passphrase",
          });
          if (passphrase !== confirmedPassphrase) {
            throw new Error("Provided passphrases do not match");
          }
          const ncrypt = nip49.encrypt(decodedKeyRes.data, passphrase);
          await keyFile.write(ncrypt);
        } else if (encodedKey.startsWith("ncrypt")) {
          await keyFile.write(encodedKey);
        } else {
          throw new Error("Invalid key format!");
        }
        console.log("Encrypted key saved successfully");
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
    });

  program
    .command("crack")
    .argument("<token>", "A locked Cashu token")
    .description("Cracks a locked nut and creates an unlocked one")
    .action(async (token: string) => {
      try {
        const { passphrase } = await prompts({
          type: "password",
          name: "passphrase",
          message: "Please enter your passphrase",
        });
        const ncrypt = await keyFile.text();
        const decryptedKey = nip49.decrypt(ncrypt, passphrase);
        const decodedToken = getDecodedToken(token);
        const wallet = new CashuWallet(new CashuMint(decodedToken.mint));
        const newProofs = await wallet.receive(decodedToken, {
          privkey: bytesToHex(decryptedKey),
        });
        console.log(
          getEncodedToken({
            mint: decodedToken.mint,
            memo: decodedToken.memo,
            proofs: newProofs,
          }),
        );
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
    });

  program.parse();
}

init();
