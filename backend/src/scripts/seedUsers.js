import connectDatabase from "../config/db.js";
import { seedBaseUsers } from "../services/userService.js";

async function run() {
  try {
    await connectDatabase();
    await seedBaseUsers();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
