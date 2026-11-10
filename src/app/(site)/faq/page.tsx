import Link from "next/link";
import { FaqAccordion, type FaqItem } from "@/components/Faq";
import { Reveal } from "@/components/Motion";
import { CtaBand, PageHero, SectionHead } from "@/components/ui";
import { pageMeta } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

export const metadata = pageMeta({
  title: "Frequently Asked Questions",
  description: "Answers about inviting Ahem Corporation to bid, requesting quotations, submitting project requirements, confidentiality of tender documents, careers and company documents.",
  path: "/faq",
});

const GROUPS: { title: string; intro: string; items: FaqItem[] }[] = [
  {
    title: "Tenders & bidding",
    intro: "For procurement authorities and organizations that want Ahem Corporation to participate in a tender.",
    items: [
      {
        question: "How do I invite Ahem Corporation to bid?",
        answer: "Use the confidential tender-invitation form on the Inquiry page (or the Tenders page). Attach the bidding documents, BOQ and drawings, and include the tender reference and submission deadline. You will immediately receive a unique reference number for follow-up.",
      },
      {
        question: "Are tender invitations kept confidential?",
        answer: "Yes. Invitations and documents you submit are never published on this website. They are stored securely and are visible only to our tender desk and administrators. Only public tender announcements that have been approved for publication appear in the Tenders section.",
      },
      {
        question: "What documents should we send with an invitation?",
        answer: "The bidding documents, bill of quantities, specifications and drawings, plus any clarifications or addenda. If your procurement process requires pre-qualification documents (registrations, certificates, company profile), request them through the company-profile form and we will provide the pack.",
      },
      {
        question: "How quickly will we hear back?",
        answer: "Every submission is acknowledged on screen with a reference number as soon as it is received. Our tender desk reviews invitations and responds according to the tender timetable — please include the submission deadline in your form so we can prioritise accordingly.",
      },
    ],
  },
  {
    title: "Quotations & project requirements",
    intro: "For private clients, developers and institutions planning construction or engineering work.",
    items: [
      {
        question: "How do I request a quotation?",
        answer: "Submit a quotation request through the Inquiry page with your scope, quantities, specifications and drawings. For early-stage projects, submit a project requirement instead — our team will advise on next steps, including site visits and budgeting.",
      },
      {
        question: "What information helps you price accurately?",
        answer: "Drawings and specifications, a bill of quantities where available, site location and access details, required programme dates, and any constraints (phasing, working hours, existing structures). Attachments up to 10 MB each are accepted.",
      },
      {
        question: "Do you offer design-and-build or turnkey delivery?",
        answer: "Yes. We deliver design-and-build and turnkey projects alongside traditional build-only contracts. Early contractor involvement and value engineering are available for private and corporate clients — describe your stage in the project-requirement form.",
      },
      {
        question: "Can you work under government procurement rules?",
        answer: "Yes. We regularly deliver public-sector works under open, limited and pre-qualification tenders, with measured, lump-sum and item-rate contracts, consultant inspections and full as-built documentation. See the Government & private-sector capability section on the homepage.",
      },
    ],
  },
  {
    title: "Careers",
    intro: "About applications, CVs and recruitment.",
    items: [
      {
        question: "How do I apply for a vacancy?",
        answer: "Open the vacancy on the Careers page and submit the application form with your CV. Each application is acknowledged with a reference number. General applications are also accepted on the Careers page when you do not see a suitable role.",
      },
      {
        question: "How long are applications kept?",
        answer: "Unsuccessful applications are retained for up to twelve months unless you ask us to delete them sooner. You can request deletion at any time using the Contact page — see the Privacy Policy for details.",
      },
    ],
  },
  {
    title: "General",
    intro: "Documents, confidentiality and using this website.",
    items: [
      {
        question: "How do I get the corporate profile or pre-qualification documents?",
        answer: "Download the corporate profile PDF from the Downloads page, or request the full pre-qualification pack (registrations, certificates, insurance) through the company-profile form on the Inquiry page.",
      },
      {
        question: "What happens to information I submit through the forms?",
        answer: "Submissions are validated, stored securely and routed to the responsible team. They are never published. See the Data Handling & Confidentiality page for how access is controlled and how to request deletion or return of documents.",
      },
      {
        question: "Where can I find tender deadlines and eligibility?",
        answer: "Public announcements in the Tenders section summarise each opportunity. The official tender documents issued by the procuring organization always prevail — always confirm deadlines, eligibility and requirements with the issuing organization.",
      },
    ],
  },
];

export default async function FaqPage() {
  const SITE_URL = await getSiteUrl();
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GROUPS.flatMap((g) =>
      g.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    ),
    url: `${SITE_URL}/faq`,
  };
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions."
        intro="Answers for procurement authorities, private clients, suppliers and candidates. For anything else, use the Inquiry hub or the Contact page."
        crumbs={[{ label: "FAQ" }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/inquiry" className="btn-gold">Submit an inquiry</Link>
          <Link href="/contact" className="btn-ghost">Contact us</Link>
        </div>
      </PageHero>

      <section className="section bg-mist">
        <div className="wrap space-y-16">
          {GROUPS.map((group, gi) => (
            <div key={group.title} className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
              <Reveal>
                <SectionHead eyebrow={`Topic ${gi + 1}`} title={group.title} intro={group.intro} />
              </Reveal>
              <Reveal delay={0.08}>
                <FaqAccordion items={group.items} idPrefix={`faq-${gi}`} />
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      <section className="section bg-white">
        <div className="wrap">
          <Reveal>
            <SectionHead
              center
              eyebrow="Still have a question?"
              title="Talk to the right team."
              intro="Tender invitations go to the tender desk; project requirements go to our project teams; supplier and partnership matters go to business development."
            />
          </Reveal>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/inquiry?type=tender-invitation" className="btn-navy">Invite us to bid</Link>
            <Link href="/inquiry?type=project-requirement" className="btn-outline">Submit a project requirement</Link>
            <Link href="/inquiry?type=business-inquiry" className="btn-outline">Business inquiry</Link>
          </div>
        </div>
      </section>

      <CtaBand />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    </>
  );
}
