import { SectionPlaceholder, sectionMetadata } from "@/components/section-placeholder";

export const generateMetadata = () => sectionMetadata("requests");

export default function RequestsPage() {
  return <SectionPlaceholder section="requests" />;
}
