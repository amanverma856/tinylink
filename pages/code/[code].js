import prisma from "../../lib/prisma";

export async function getServerSideProps({ params }) {
  const code = params.code;

  const link = await prisma.link.findUnique({
    where: { shortCode: code },
  });

  if (!link) {
    return { notFound: true };
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const logs = await prisma.click.findMany({
    where: {
      linkId: link.id,
      createdAt: { gt: since },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    props: {
      link: {
        shortCode: link.shortCode,
        url: link.url,
        clicks: link.clicks,
        createdAt: link.createdAt.toISOString(),
        lastClicked: link.lastClicked ? link.lastClicked.toISOString() : null,
      },
      logs: logs.map((log) => ({
        createdAt: log.createdAt.toISOString(),
        referrer: log.referrer || "direct",
      })),
    },
  };
}

export default function StatsPage({ link, logs }) {
  return (
    <div className="container">
      <h1>Stats for code: {link.shortCode}</h1>

      <p>
        <b>Target URL:</b>{" "}
        <a href={link.url} target="_blank" rel="noreferrer">
          {link.url}
        </a>
      </p>

      <p><b>Total Clicks:</b> {link.clicks}</p>
      <p><b>Created At:</b> {new Date(link.createdAt).toLocaleString()}</p>
      <p>
        <b>Last Clicked:</b>{" "}
        {link.lastClicked ? new Date(link.lastClicked).toLocaleString() : "—"}
      </p>

      <h2>Click History (Last 30 days)</h2>
      {logs.length === 0 && <p>No clicks in the last 30 days.</p>}

      <ul>
        {logs.map((l, index) => (
          <li key={index}>
            {new Date(l.createdAt).toLocaleString()} — {l.referrer}
          </li>
        ))}
      </ul>

      <p>
        <a href="/">← Back to Dashboard</a>
      </p>
    </div>
  );
}
