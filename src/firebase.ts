import chalk from "chalk";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

// TODO: Replace with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-Ng6xuymekr5ukFQsCOv1Gg_CjKMMYQ0",
  authDomain: "lol-grade-recorder.firebaseapp.com",
  databaseURL: "https://lol-grade-recorder-default-rtdb.firebaseio.com",
  projectId: "lol-grade-recorder",
  storageBucket: "lol-grade-recorder.appspot.com",
  messagingSenderId: "453283686597",
  appId: "1:453283686597:web:9a13fb594894b66a7c28ac",
};

const app = initializeApp(firebaseConfig);

// Get a reference to the database service
const database = getDatabase(app);

const localState: { [key: string]: boolean } = {};
export async function saveGrade(
  summonerName: string,
  grade: string,
  matchId: string,
): Promise<void> {
  const key = `matches/${matchId}/${summonerName}`;
  if (key in localState) {
    return;
  }
  await set(ref(database, key), grade);
  localState[key] = true;
  console.log(`Recorded grade ${chalk.bold.green(grade)} for summoner ${chalk.bold.cyan(summonerName)}`)
}
