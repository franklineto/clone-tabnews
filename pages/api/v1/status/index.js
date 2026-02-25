import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const databaseVersionResult = await database.query("SELECT version();");
  const databaseVersionValue = databaseVersionResult.rows[0].version;

  response.status(200).json({
    updated_at: updatedAt,
    database_version: databaseVersionValue,
  });
}

export default status;
