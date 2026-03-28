import useSWR from "swr";

async function fetchStatus() {
  const response = await fetch(
    process.env.NODE_ENV === "development"
      ? "/proxy/3000/api/v1/status"
      : "/api/v1/status",
  );
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  const response = useSWR("status", fetchStatus);
  return (
    <>
      <h1>Status</h1>
      <pre>{JSON.stringify(response.data, null, 2)}</pre>
    </>
  );
}
