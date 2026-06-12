import { getExperiences } from "@/lib/queries";
import CalendarView from "@/components/CalendarView";

export const revalidate = 60;

export default async function ExperiencesPage() {
  const experiences = await getExperiences();
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-lg font-bold text-gray-800 mb-6">体験カレンダー</h1>
      <CalendarView experiences={experiences} />
    </div>
  );
}
