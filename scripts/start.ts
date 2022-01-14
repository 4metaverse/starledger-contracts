import { run } from "hardhat";

async function start() {
  await run("node");
  await new Promise(() => setTimeout(() => {}, 2147483647)); // until ctrl+c
}

start();
