import useSWR from "swr";

const url = process.env.NODE_ENV === "development"
      ? "/proxy/3000/api/v1/status"
      : "/api/v1/status"

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      {/* <pre>{JSON.stringify(response.data, null, 2)}</pre> */}
      <UpdatedAt />
      <h1>Database</h1>
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt(){
  const {isLoading, data} = useSWR(url, fetchAPI, {
    refreshInterval: 2000,
    //dedupingInterval: 500,
  });

  let UpdatedAtText = "Carregando..."

  if (!isLoading && data){
    UpdatedAtText = new Date(data.updated_at).toLocaleString('pt-BR');
  }
  return <div>Ultima atualização: {UpdatedAtText}</div>
}

function DatabaseStatus(){
  const {isLoading, data} = useSWR(url, fetchAPI, {
    refreshInterval: 2000,
    //dedupingInterval: 500,
  });

  let Version =  "Carregando..."
  let MaxConnections =  "Carregando..."
  let OpennedConnections =  "Carregando..."

  if (!isLoading && data){
    Version = data.dependencies.database.version;
    MaxConnections = data.dependencies.database.max_connections;
    OpennedConnections =  data.dependencies.database.opened_connections
  }
  return <>
          <div>Versão: {Version}</div>
          <div>Máximo Conexões Simultâneas: {MaxConnections}</div>
          <div>Conexões Abertas: {OpennedConnections}</div>
          </>
}
