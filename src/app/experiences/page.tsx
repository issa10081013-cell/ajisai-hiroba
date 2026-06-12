import { experiences } from "@/lib/data";
import CalendarView from "@/components/CalendarView";

export default function ExperiencesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-lg font-bold text-gray-800 mb-6">体験カレンダー</h1>
      <CalendarView experiences={experiences} />
    </div>
  );
}
