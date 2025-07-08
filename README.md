# nutcracker

A CLI tool to unlock P2PK Cashu tokens using your nsec

## Commands

**set-key**

Saves an `ncrypt` on disk. This key will be used to unlock token later.
If you enter an `nsec` you need to add a passphrase.

**crack \<token\>**

Unlocks `<token>` using the stored private key and prints a new, unlocked token to the console.

## Installation

Nutcracker is a Typescript project written for `bun`.
You can run it directly in bun:

```sh
bun run src/index.ts
```
