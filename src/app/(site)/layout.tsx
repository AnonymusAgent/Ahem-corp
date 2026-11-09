import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CookieConsent, SmoothScroll, Tracker, WhatsAppButton } from "@/components/ClientBits";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getServices } from "@/lib/data";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { isValidPhone } from "@/lib/site";
import { getSiteUrl } from "@/lib/site-url";

// Content is managed in the database, so public pages are rendered per request and always reflect the latest admin changes.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [s, siteUrl] = await Promise.all([getSettings(), getSiteUrl()]);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: s.seo.defaultTitle, template: `%s | ${s.general.companyName}` },
    description: s.seo.description,
    keywords: s.seo.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    verification: s.seo.gscVerification ? { google: s.seo.gscVerification } : undefined,
    openGraph: { siteName: s.general.companyName, type: "website", locale: "en", title: s.seo.defaultTitle, description: s.seo.description, url: "/", images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: s.general.tagline }] },
    twitter: { card: "summary_large_image", title: s.seo.defaultTitle, description: s.seo.description, images: [DEFAULT_OG_IMAGE] },
    robots: { index: true, follow: true },
  };
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [s, services, SITE_URL] = await Promise.all([getSettings(), getServices(), getSiteUrl()]);
  const links = services.map((x) => ({ label: x.title, href: `/services/${x.slug}` }));
  const real = !s.contact.isSample;
  const organization = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    "@id": `${SITE_URL}/#organization`,
    name: s.general.companyName,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/ahem-icon.svg`,
    image: `${SITE_URL}/opengraph-image`,
    slogan: s.general.tagline,
    description: s.general.description,
    knowsAbout: services.map((x) => x.title),
    // Contact data is published in structured data only once real details replace the sample values.
    ...(real && s.contact.email ? { email: s.contact.email } : {}),
    ...(real && s.contact.phone ? { telephone: s.contact.phone } : {}),
    ...(real && s.contact.address ? { address: { "@type": "PostalAddress", streetAddress: s.contact.address } } : {}),
    sameAs: Object.values(s.social).filter((u) => /^https?:\/\//.test(u)),
  };

  return (
    <>
      {s.home.showSampleNotice && (
        <p className="relative z-[51] bg-gold-100 px-4 py-2 text-center text-xs leading-snug text-gold-700">
          <strong className="font-semibold">Demonstration content.</strong> Items marked “Sample”, the statistics and the contact details are placeholders until replaced with official company data in the admin dashboard.
        </p>
      )}
      <Header services={links} />
      <main id="main" className="-mt-20">
        {children}
      </main>
      <Footer settings={s} services={links} />
      {isValidPhone(s.contact.whatsapp) && <WhatsAppButton number={s.contact.whatsapp} message={`Hello ${s.general.companyName}, I would like to make an inquiry.`} />}
      <CookieConsent gaId={s.seo.gaId} />
      <SmoothScroll />
      <Tracker />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }} />
      <noscript>
        <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
      </noscript>
    </>
  );
}
