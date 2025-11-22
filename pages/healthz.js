export async function getServerSideProps({ res }) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.end(JSON.stringify({
    ok: true,
    version: process.env.APP_VERSION || "1.0"
  }));

  return { props: {} };
}

export default function Health() {
  return null;
}
