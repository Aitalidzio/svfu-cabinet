import { SectionPlaceholder, sectionMetadata } from "@/components/section-placeholder";

export const generateMetadata = () => sectionMetadata("grades");

export default function GradesPage() {
  return <SectionPlaceholder section="grades" />;
}
