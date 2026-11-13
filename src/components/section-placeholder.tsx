import type { Metadata } from "next";
import { Construction } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/i18n/dictionaries";

export type Section = "schedule" | "grades" | "requests" | "notifications" | "profile";

export async function sectionMetadata(section: Section): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.nav[section] };
}

export async function SectionPlaceholder({ section }: { section: Section }) {
  const dict = await getDictionary();
  return (
    <>
      <PageHeader title={dict.nav[section]} lead={dict.pages[section]} />
      <EmptyState
        icon={<Construction className="size-7" aria-hidden />}
        title={dict.common.soonTitle}
        text={dict.common.soonText}
      />
    </>
  );
}
