import { SectionPlaceholder, sectionMetadata } from "@/components/section-placeholder";

export const generateMetadata = () => sectionMetadata("profile");

export default function ProfilePage() {
  return <SectionPlaceholder section="profile" />;
}
