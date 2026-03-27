const { exec } = require("node:child_process");

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      checkPostgres();
      return;
    } else {
      console.log("\n🟢 Postgres Está está pronto e aceitando conexões!\n\n");
      //comentário
    }
  }
}
process.stdout.write("\n🔴 Aguardando Postgres aceitar conexões.");
checkPostgres();
