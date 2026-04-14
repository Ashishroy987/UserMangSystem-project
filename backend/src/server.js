import app from "./app.js";
import env from "./config/env.js";
import connectDatabase from "./config/db.js";
import { seedBaseUsers } from "./services/userService.js";

async function startServer() {
  try {
    await connectDatabase();

    if (env.seedOnStartup) {
      await seedBaseUsers();
    }

    app.listen(env.port, () => {
      console.log(`Server listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server");
    console.error(error);
    process.exit(1);
  }
}

startServer();
