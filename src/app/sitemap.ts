import type { MetadataRoute } from "next";
import { getJobs, getNews, getPages, getProjects, getServices, getTenders } from "@/lib/data";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, tenders, jobs, news, pages, SITE_URL] = await Promise.all([getServices(), getProjects(), getTenders(), getJobs(), getNews(), getPages(), getSiteUrl()]);
  const now = new Date();
  const fixed: [string, number][] = [
    ["", 1], ["/about", 0.8], ["/services", 0.9], ["/projects", 0.9], ["/tenders", 0.9], ["/inquiry", 0.8],
    ["/clients", 0.6], ["/certifications", 0.7], ["/careers", 0.6], ["/news", 0.6], ["/contact", 0.8],
  ];
  return [
    ...fixed.map(([path, priority]) => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency: "weekly" as const, priority })),
    ...services.map((x) => ({ url: `${SITE_URL}/services/${x.slug}`, lastModified: x.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...projects.map((x) => ({ url: `${SITE_URL}/projects/${x.slug}`, lastModified: x.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...tenders.map((x) => ({ url: `${SITE_URL}/tenders/${x.slug}`, lastModified: x.updatedAt, changeFrequency: "daily" as const, priority: 0.7 })),
    ...jobs.map((x) => ({ url: `${SITE_URL}/careers/${x.slug}`, lastModified: x.createdAt, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...news.map((x) => ({ url: `${SITE_URL}/news/${x.slug}`, lastModified: x.createdAt, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...pages.map((x) => ({ url: `${SITE_URL}/legal/${x.slug}`, lastModified: x.updatedAt, changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
