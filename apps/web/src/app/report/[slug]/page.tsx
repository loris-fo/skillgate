import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

  const cats = report.result.categories;
  const gridCats = [
    { key: "hidden_logic", data: cats.hidden_logic },
    { key: "data_access", data: cats.data_access },
    { key: "action_risk", data: cats.action_risk },
    { key: "permission_scope", data: cats.permission_scope },
  ];

  return (
    <div style={{ backgroundColor: "#0D0D14" }}>
      <ReportHero result={report.result} meta={report.meta} slug={slug} />

      <div className="max-w-[1100px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 pb-16">
        {/* Left column */}
        <div>
          <h2 className="text-[24px] font-semibold text-white mb-5">
            Security Analysis
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {gridCats.map(({ key, data }) => (
              <CategoryCard key={key} name={key} result={data} />
            ))}
          </div>
          <div className="mt-4">
            <CategoryCard name="override_attempts" result={cats.override_attempts} />
          </div>
          <div className="mt-6">
            <UtilitySection utility={report.result.utility_analysis} />
          </div>
        </div>

        {/* Right column */}
        <div>
          <h2 className="text-[24px] font-semibold text-white mb-5">
            Recommendation
          </h2>
          <RecommendationCard recommendation={report.result.recommendation} />
          <div className="mt-6">
            <BadgeSection slug={report.meta.slug} />
          </div>
        </div>
      </div>
    </div>
  );
}
