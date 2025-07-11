import { GuidedMeditation } from '@/components/meditation/guided-meditation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function MeditationPage() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen />
          Guided Meditation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <GuidedMeditation />
      </CardContent>
    </Card>
  );
}
