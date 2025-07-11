import { MeditationTimer } from '@/components/meditation/meditation-timer';
import { MeditationScripts } from '@/components/meditation/meditation-scripts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, BookOpen } from 'lucide-react';

export default function MeditationPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer />
            Meditation Timer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MeditationTimer />
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen />
            Guided Scripts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MeditationScripts />
        </CardContent>
      </Card>
    </div>
  );
}
