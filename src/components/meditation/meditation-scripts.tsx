"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { scripts } from '@/lib/meditation-scripts';
import { Volume2, VolumeX } from 'lucide-react';

export function MeditationScripts() {
  const [activeScript, setActiveScript] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const handleEnd = () => setIsSpeaking(false);

    const currentUtterance = utteranceRef.current;
    if (currentUtterance) {
      currentUtterance.addEventListener('end', handleEnd);
    }
    
    return () => {
      if (currentUtterance) {
        currentUtterance.removeEventListener('end', handleEnd);
      }
      // Stop speaking when component unmounts or activeScript changes
      synth.cancel();
      setIsSpeaking(false);
    };
  }, [activeScript]);

  const handleToggleSpeech = (title: string, text: string) => {
    const synth = window.speechSynthesis;

    if (isSpeaking && activeScript === title) {
      synth.cancel();
      setIsSpeaking(false);
    } else {
      // If other script is speaking, cancel it first
      if (synth.speaking) {
        synth.cancel();
      }
      
      const newUtterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = newUtterance;
      newUtterance.onend = () => {
        setIsSpeaking(false);
        setActiveScript(null);
      };
      
      synth.speak(newUtterance);
      setIsSpeaking(true);
      setActiveScript(title);
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      {scripts.map((script) => (
        <AccordionItem value={script.title} key={script.title}>
          <AccordionTrigger>{script.title}</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Button
                onClick={() => handleToggleSpeech(script.title, script.script)}
                variant="outline"
                size="sm"
              >
                {isSpeaking && activeScript === script.title ? (
                  <>
                    <VolumeX className="mr-2 h-4 w-4" /> Stop
                  </>
                ) : (
                  <>
                    <Volume2 className="mr-2 h-4 w-4" /> Read Aloud
                  </>
                )}
              </Button>
              <ScrollArea className="h-60 w-full pr-4">
                <p className="whitespace-pre-line text-muted-foreground">{script.script}</p>
              </ScrollArea>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
