import { Command } from "commander";

const program = new Command();

program
  .name("nutcracker")
  .description("CLI to unlock Cashu token")
  .version("0.0.1");

program.parse();
