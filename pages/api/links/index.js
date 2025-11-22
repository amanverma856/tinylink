import prisma from "../../../lib/prisma";
import { genCode, isValidShortCode, normalizeUrl } from "../../../lib/utils";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(links);
  }

  if (req.method === "POST") {
    const { url, customCode } = req.body || {};

    const normalized = normalizeUrl(url);
    if (!normalized) {
      return res.status(400).json({ error: "invalid url" });
    }

    let shortCode = customCode ? customCode.trim() : null;

    // Custom code
    if (shortCode) {
      if (!isValidShortCode(shortCode)) {
        return res.status(400).json({
          error: "custom code invalid. must match [A-Za-z0-9]{6,8}",
        });
      }

      const exists = await prisma.link.findUnique({
        where: { shortCode },
      });

      if (exists) {
        return res.status(409).json({ error: "code exists" });
      }
    } else {
      // Generate random code
      let tries = 0;
      do {
        shortCode = genCode(6 + Math.floor(Math.random() * 3));
        const exists = await prisma.link.findUnique({
          where: { shortCode },
        });
        if (!exists) break;
        tries++;
      } while (tries < 5);

      if (tries >= 5) {
        return res
          .status(500)
          .json({ error: "could not generate unique code" });
      }
    }

    const created = await prisma.link.create({
      data: {
        shortCode,
        url: normalized,
      },
    });

    return res.status(201).json({
      shortCode: created.shortCode,
      shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${created.shortCode}`,
      url: created.url,
      createdAt: created.createdAt,
    });
  }

  res.setHeader("Allow", "GET,POST");
  return res.status(405).end();
}
