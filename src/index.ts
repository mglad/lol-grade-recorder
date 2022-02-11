import RiotClient from "./riot-client";
import { saveGrade } from "./firebase";
import { sleep } from "./util";
import chalk from "chalk";

const WAIT_TIME = 2000;

async function tick(riotClient: RiotClient): Promise<void> {
  const mastery = await riotClient.getEOGChampionMasteryUpdates();
  if (!mastery?.gameId || !mastery?.grade) {
    return;
  }

  const currentSummoner = await riotClient.getCurrentSummoner();
  if (!currentSummoner?.displayName) {
    return;
  }

  await saveGrade(currentSummoner.displayName, mastery.grade, mastery.gameId);
}

async function run(): Promise<void> {
  const riotClient = new RiotClient();
  let hasInformedWaiting = false;
  while (!(await riotClient.isReady())) {
    if (!hasInformedWaiting) {
      console.log(chalk.gray("Waiting for league client to open..."));
      hasInformedWaiting = true;
    }

    await sleep(WAIT_TIME);
  }

  console.log(chalk.green("League client detected. Watching for grades to record..."));

  while (true) {
    await tick(riotClient);

    await sleep(WAIT_TIME);
    if (riotClient.hasClosedOrChanged()) {
      break;
    }
  }

  await run();
}

run().catch((err) => {
  console.error(chalk.red(err));
});
