import useSWR from "swr";

const url =
  process.env.NODE_ENV === "development"
    ? "/proxy/3000/api/v1/status"
    : "/api/v1/status";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody; 
}

export default function StatusPage() {
  return (
    <>
      {/* <pre>{JSON.stringify(response.data, null, 2)}</pre> */}
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR(url, fetchAPI, {
    refreshInterval: 2000,
  });

  let UpdatedAtText = "Carregando...";

  if (!isLoading && data) {
    UpdatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }
  return <> 
      <h1>Status</h1>
      <div>Ultima atualização: {UpdatedAtText}</div>
    </>
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR(url, fetchAPI, {
    refreshInterval: 2000,
  });
  let databaseStatusInformation = "Carregando...";
  if (!isLoading && data) {
    databaseStatusInformation = (
      <>
      <div>Versão: {data.dependencies.database.version}</div>
      <div>Conexões Abertas: {data.dependencies.database.opened_connections}</div>
      <div>Máximo Conexões Simultâneas: {data.dependencies.database.max_connections}</div>
    </>
    )
  }
  return (
    <>
      <h1>Database</h1>
      <div>{databaseStatusInformation}</div>
    </>
  );
}
