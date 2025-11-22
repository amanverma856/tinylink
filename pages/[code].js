import prisma from "../lib/prisma";

export async function getServerSideProps({ params, req, res }) {
  const code = params.code;

  const link = await prisma.link.findUnique({
    where: { shortCode: code },
  });

  if (!link) {
    res.statusCode = 404;
    return { props: {} };
  }

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const ua = req.headers["user-agent"] || null;
  const ref = req.headers["referer"] || null;

  await prisma.$transaction([
    prisma.link.update({
      where: { id: link.id },
      data: {
        clicks: { increment: 1 },
        lastClicked: new Date(),
      },
    }),
    prisma.click.create({
      data: {
        linkId: link.id,
        userAgent: ua,
        referrer: ref,
        ipHash: ip ? String(ip).slice(0, 50) : null,
      },
    }),
  ]);

  res.writeHead(302, { Location: link.url });
  res.end();

  return { props: {} };
}

export default function RedirectPage() {
  return <div>Redirecting...</div>;
}
