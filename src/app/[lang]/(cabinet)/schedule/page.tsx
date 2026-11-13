import { SectionPlaceholder, sectionMetadata } from "@/components/section-placeholder";

export const generateMetadata = () => sectionMetadata("schedule");

export default function SchedulePage() {
  return <SectionPlaceholder section="schedule" />;
}
