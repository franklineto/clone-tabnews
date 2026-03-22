import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";


export default async function migrations(request, response) {

  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: "Method not allowed"
    });
  }
  const dbClient = await database.getNewClient();
  const defaultMigrationOptions = {
      //databaseUrl: process.env.DATABASE_URL,
      dbClient: dbClient,
      dryRun: true,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    }
  if (request.method === "GET") {
    console.log("Entrando no GET");
    const pendingMigrations = await migrationRunner(defaultMigrationOptions);
    await dbClient.end();
    response.status(200).json(pendingMigrations);
  }

  if (request.method === "POST") {
    console.log("Entrando no POST");
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
    });
    await dbClient.end();
    if (migratedMigrations.length > 0) {
      response.status(201).json(migratedMigrations);
    } else {
      response.status(200).json(migratedMigrations);
    }
  }
}
