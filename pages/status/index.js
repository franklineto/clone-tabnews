import useSWR from "swr";

async function fetchStatus() {
  const response = await fetch("/proxy/3000/api/v1/status");
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  const response = useSWR("status", fetchStatus);
  //console.log(response.isLoading);
  //console.log(response.data);

  return (
    <>
      <h1>Status</h1>
      <pre>{JSON.stringify(response.data, null, 2)}</pre>
    </>
  );
}
