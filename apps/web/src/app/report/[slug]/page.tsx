import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getReportBySlug } from "@/lib/report";
import { ReportHero, RecommendationCard } from "@/components/report-hero";
import { CategoryCard } from "@/components/category-card";
import { UtilitySection } from "@/components/utility-section";
import { BadgeSection } from "@/components/badge-section";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const report = await getReportBySlug(slug);

  if (!report) {
    return { title: "Report Not Found — Skillgate" };
  }

  return {
    title: `Skillgate: ${report.result.recommendation.verdict.replace(/_/g, " ")}`,
    description: report.result.summary,
  };
}

export default async function ReportPage({ params }: Props) {
  const { slug } = await params;
  const report = await getReportBySlug(slug);

  if (!report) {
    notFound();
  }

  return (
    <section className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <ReportHero result={report.result} meta={report.meta} />

      <h2 className="text-text-heading text-xl font-semibold mb-4">
        Security Analysis
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(report.result.categories).map(([name, cat]) => (
          <CategoryCard key={name} name={name} result={cat} />
        ))}
      </div>

      <h2 className="text-text-heading text-xl font-semibold mt-8 mb-4">
        Recommendation
      </h2>
      <RecommendationCard recommendation={report.result.recommendation} />

      <h2 className="text-text-heading text-xl font-semibold mt-8 mb-4">
        Utility
      </h2>
      <UtilitySection utility={report.result.utility_analysis} />

      <h2 className="text-text-heading text-xl font-semibold mt-8 mb-4">
        Badge
      </h2>
      <BadgeSection slug={report.meta.slug} />

      <Link
        href="/audit"
        className="inline-flex items-center text-accent hover:text-accent-hover font-medium mt-8 transition-colors"
      >
        &larr; Audit another skill
      </Link>
    </section>
  );
}
