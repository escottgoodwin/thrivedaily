"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, TimerReset } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function MeditationTimer() {
  const [duration, setDuration] = useState(300); // 5 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Optionally play a sound
      new Audio('/finish-sound.mp3').play().catch(() => {});
    }
  }, [isRunning, timeLeft]);
  
  useEffect(() => {
    setTimeLeft(duration);
    setIsRunning(false);
  }, [duration])

  const handleStartPause = () => {
    if (timeLeft > 0) {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const handleDurationChange = (value: string) => {
    setDuration(parseInt(value, 10));
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
        <Select onValueChange={handleDurationChange} defaultValue={String(duration)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="60">1 Minute</SelectItem>
            <SelectItem value="300">5 Minutes</SelectItem>
            <SelectItem value="600">10 Minutes</SelectItem>
            <SelectItem value="900">15 Minutes</SelectItem>
          </SelectContent>
        </Select>
      <div className="flex gap-4">
        <Button onClick={handleStartPause} size="lg" className="w-28">
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
