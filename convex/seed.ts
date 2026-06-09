import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

type Section = "portfolio" | "project" | "story" | "publication" | "commission";

// Deterministic placeholder image (Lorem Picsum). Portrait & landscape mix.
function placeholder(seed: string, i: number) {
  const portrait = i % 3 !== 1;
  const w = portrait ? 1200 : 1600;
  const h = portrait ? 1500 : 1066;
  return {
    externalUrl: `https://picsum.photos/seed/${seed}-${i}/${w}/${h}`,
    width: w,
    height: h,
  };
}

const GALLERIES: Array<{
  section: Section;
  slug: string;
  title: string;
  subtitle?: string;
  statement?: string;
  isFeatured?: boolean;
  count: number;
}> = [
  {
    section: "project",
    slug: "the-mud-angels",
    title: "The Mud Angels",
    subtitle: "Valencia, 2024",
    isFeatured: true,
    statement:
      "On 30 October 2024, after the catastrophic floods that struck Valencia, thousands of volunteers arrived with buckets and shovels to clear the mud from streets and homes. This series portrays them at the end of each day — exhausted, caked in mud, anonymous in their solidarity. Eternal thanks to every volunteer.",
    count: 8,
  },
  {
    section: "project",
    slug: "the-remains",
    title: "The Remains",
    subtitle: "2023",
    statement:
      "A meditation on what is left behind — landscapes and objects emptied of their former life, photographed in the quiet after departure.",
    count: 6,
  },
  {
    section: "project",
    slug: "skf-some-kind-of-freedom",
    title: "SKF — Some Kind of Freedom",
    subtitle: "Long-term project",
    statement:
      "The first chapter of the SKF cycle, an ongoing inquiry into the many forms freedom takes and the spaces in which it is sought.",
    count: 7,
  },
  {
    section: "project",
    slug: "theatres",
    title: "Theatres",
    subtitle: "Europe, 2016–2019",
    statement:
      "Empty European theatres photographed from the stage and the gods — gilded, silent architectures built entirely for the gaze.",
    count: 6,
  },
  {
    section: "project",
    slug: "ciudades-subterraneas",
    title: "Ciudades Subterráneas",
    subtitle: "Underground Cities",
    statement:
      "Subterranean infrastructures and forgotten tunnels — the cities beneath our cities.",
    count: 6,
  },
  {
    section: "story",
    slug: "jose-y-familia",
    title: "José y Familia",
    subtitle: "Documentary story",
    statement:
      "An intimate portrait of José and his family across a single season at home.",
    count: 6,
  },
  {
    section: "story",
    slug: "valentina",
    title: "Valentina",
    subtitle: "Documentary story",
    count: 5,
  },
  {
    section: "story",
    slug: "rosario",
    title: "Rosario",
    subtitle: "Documentary story",
    count: 5,
  },
  {
    section: "publication",
    slug: "el-pais-semanal",
    title: "El País Semanal",
    subtitle: "Editorial",
    statement: "Selected assignments and features for El País Semanal.",
    count: 5,
  },
  {
    section: "publication",
    slug: "exit",
    title: "EXIT",
    subtitle: "Art magazine",
    count: 4,
  },
  {
    section: "publication",
    slug: "citizen-k",
    title: "Citizen K",
    subtitle: "Editorial",
    count: 4,
  },
  {
    section: "commission",
    slug: "british-museum",
    title: "British Museum",
    subtitle: "Commission",
    count: 5,
  },
  {
    section: "commission",
    slug: "mar-menor",
    title: "Mar Menor",
    subtitle: "Commission",
    count: 5,
  },
  {
    section: "commission",
    slug: "bioparc",
    title: "Bioparc",
    subtitle: "Commission",
    count: 5,
  },
];

const NEWS = [
  {
    slug: "mud-angels-sony-award",
    title: "The Mud Angels — 2nd place, Sony World Photography Awards",
    date: "2025-04-17",
    excerpt:
      "The portrait series of Valencia's flood volunteers is recognised in the portraiture category.",
    body: "The Mud Angels has been awarded second place in the portraiture category of the Sony World Photography Awards 2025. The series documents the thousands of volunteers who cleared mud from the streets of Valencia after the October 2024 floods.",
  },
  {
    slug: "muros-de-pizarra-exhibition",
    title: "Muros de Pizarra — solo exhibition opens in Cáceres",
    date: "2019-09-12",
    excerpt: "A new solo show opens at the cultural centre in Cáceres.",
    body: "Muros de Pizarra opens this week, gathering work made across the slate landscapes of western Spain.",
  },
];

const BIO = {
  statement:
    "Raúl Belinchón (Valencia, 1975) holds a degree in History of Art from the Universidad de Valencia and works as an independent photographer. He has photographed stories and spaces around the world, with work held in major public collections.",
  soloExhibitions: [
    "2019 — Muros de Pizarra, Cáceres",
    "2013 — Sensación de Vivir, Poland",
    "2010 — Kéyah, Valencia",
  ],
  groupExhibitions: [
    "Art Basel",
    "Paris Photo, Louvre",
    "ARCO Madrid",
    "Fundació Joan Miró, Barcelona",
  ],
  awards: [
    "2009 — Prix Pictet, nominee",
    "2006 — Joop Swart Masterclass, World Press Photo, nominee",
    "2004 — World Press Photo, 3rd Prize, Arts & Entertainment Stories",
    "2003 — Grant, Spanish Academy in Rome",
  ],
  collections: [
    "Museo Reina Sofía",
    "IVAM",
    "Spanish Ministry of Education",
    "Spanish Ministry of Foreign Affairs",
  ],
  publications: ["El País Semanal", "EXIT", "Citizen K", "Squire"],
};

const CONTACT = {
  email: "studio@example.com",
  instagram: "raulbelinchon",
  representation: "For prints and commissions, please get in touch.",
};

const SETTINGS = {
  siteTitle: "Raúl Belinchón",
  tagline: "Photographer",
};

export const run = mutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, { force }) => {
    const existing = await ctx.db.query("galleries").collect();
    if (existing.length > 0 && !force) {
      return {
        skipped: true,
        message:
          "Galleries already exist. Pass { force: true } to wipe and reseed.",
      };
    }

    // Wipe content tables (not auth/users) when forcing.
    if (force) {
      for (const table of ["images", "galleries", "news", "pages"] as const) {
        const rows = await ctx.db.query(table).collect();
        for (const row of rows) await ctx.db.delete(row._id);
      }
    }

    let order = 0;
    for (const g of GALLERIES) {
      const galleryId: Id<"galleries"> = await ctx.db.insert("galleries", {
        section: g.section,
        slug: g.slug,
        title: g.title,
        subtitle: g.subtitle,
        statement: g.statement,
        published: true,
        isFeatured: g.isFeatured ?? false,
        order: order++,
        createdAt: Date.now(),
      });
      let coverId: Id<"images"> | undefined;
      for (let i = 0; i < g.count; i++) {
        const ph = placeholder(g.slug, i);
        const imageId = await ctx.db.insert("images", {
          galleryId,
          order: i,
          alt: `${g.title} — image ${i + 1}`,
          provider: "external",
          externalUrl: ph.externalUrl,
          width: ph.width,
          height: ph.height,
        });
        if (i === 0) coverId = imageId;
      }
      if (coverId) await ctx.db.patch(galleryId, { coverImageId: coverId });
    }

    let newsOrder = 0;
    for (const n of NEWS) {
      await ctx.db.insert("news", {
        slug: n.slug,
        title: n.title,
        date: n.date,
        excerpt: n.excerpt,
        body: n.body,
        published: true,
        order: newsOrder++,
      });
    }

    await ctx.db.insert("pages", { key: "bio", content: BIO });
    await ctx.db.insert("pages", { key: "contact", content: CONTACT });
    await ctx.db.insert("pages", { key: "settings", content: SETTINGS });
    await ctx.db.insert("pages", {
      key: "home",
      content: { featuredSlug: "the-mud-angels" },
    });

    return { skipped: false, galleries: GALLERIES.length, news: NEWS.length };
  },
});
