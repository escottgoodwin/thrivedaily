
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, TimerReset } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from '@/components/ui/slider';
import { scripts, type TimedMeditationScript } from '@/lib/meditation-scripts';

export function GuidedMeditation() {
  const [selectedScript, setSelectedScript] = useState<TimedMeditationScript>(scripts[0]);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customDuration, setCustomDuration] = useState(600); // Default 10 minutes
  const [duration, setDuration] = useState(selectedScript.duration);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const playFinishSound = useCallback(() => {
    if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    }
  }, []);
  
  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    
    if (synth.speaking) {
      synth.cancel();
    }
    
    const newUtterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = newUtterance;
    synth.speak(newUtterance);
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      if (!isCustomMode) {
        const elapsedTime = duration - timeLeft;
        const cue = selectedScript.cues.find(c => c.time === elapsedTime);
        if (cue) {
          speak(cue.text);
        }
      }

      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playFinishSound();
    }
  }, [isRunning, timeLeft, duration, selectedScript, speak, playFinishSound, isCustomMode]);

  const handleReset = useCallback(() => {
    const synth = window.speechSynthesis;
    if (synth?.speaking) {
        synth.cancel();
    }
    setIsRunning(false);
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    handleReset();
  }, [duration, handleReset]);
  
  useEffect(() => {
    if (isCustomMode) {
        setDuration(customDuration);
    }
  }, [customDuration, isCustomMode]);


  const handleStartPause = () => {
    if (timeLeft > 0) {
      const synth = window.speechSynthesis;
      if (isRunning && synth?.speaking) {
          synth.pause();
      } else if (!isRunning && synth?.paused) {
          synth.resume();
      }
      setIsRunning(!isRunning);
    }
  };
  
  const handleSelectionChange = (title: string) => {
    if (title === "Custom Timer") {
      setIsCustomMode(true);
      setDuration(customDuration);
      setSelectedScript({ title: "Custom Timer", duration: customDuration, cues: [] });
    } else {
      setIsCustomMode(false);
      const newScript = scripts.find(s => s.title === title) || scripts[0];
      setSelectedScript(newScript);
      setDuration(newScript.duration);
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = useMemo(() => {
    return (duration - timeLeft) / duration;
  }, [timeLeft, duration]);

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="relative w-52 h-52">
        <svg className="w-full h-full" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--secondary))" strokeWidth="10" />
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold font-mono text-primary">
              {formatTime(timeLeft)}
            </span>
        </div>
      </div>
      <div className="w-[280px] space-y-4">
        <Select onValueChange={handleSelectionChange} defaultValue={selectedScript.title}>
          <SelectTrigger>
            <SelectValue placeholder="Select a meditation" />
          </SelectTrigger>
          <SelectContent>
            {scripts.map(script => (
                <SelectItem key={script.title} value={script.title}>
                    {script.title} {script.duration > 0 ? `(${script.duration / 60} min)`: ''}
                </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isCustomMode && (
            <div className="space-y-2 animate-in fade-in-20">
                <p className="text-center text-sm font-medium">
                    Duration: {customDuration / 60} minutes
                </p>
                <Slider
                    value={[customDuration]}
                    onValueChange={(value) => setCustomDuration(value[0])}
                    min={60} // 1 minute
                    max={3600} // 60 minutes
                    step={60} // 1 minute increments
                    disabled={isRunning}
                />
            </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button onClick={handleStartPause} size="lg" className="w-28" disabled={timeLeft === 0}>
          {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={handleReset} variant="outline" size="lg">
          <TimerReset />
        </Button>
      </div>
    </div>
  );
}
