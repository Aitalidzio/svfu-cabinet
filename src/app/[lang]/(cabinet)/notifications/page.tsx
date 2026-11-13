import { SectionPlaceholder, sectionMetadata } from "@/components/section-placeholder";

export const generateMetadata = () => sectionMetadata("notifications");

export default function NotificationsPage() {
  return <SectionPlaceholder section="notifications" />;
}
