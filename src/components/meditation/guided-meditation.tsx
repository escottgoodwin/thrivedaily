
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, TimerReset, Sparkles, Save, Zap } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from '@/components/ui/slider';
import { scripts as defaultScripts, type TimedMeditationScript } from '@/lib/meditation-scripts';
import { useLanguage } from '../i18n/language-provider';
import { useAuth } from '../auth/auth-provider';
import { getListForToday, getCustomMeditationAction, getCustomMeditationScripts, saveCustomMeditationScript, recordUsage } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import type { SavedMeditationScript } from '@/app/types';
import { Input } from '../ui/input';
import { useSubscription } from '@/hooks/use-subscription';
import { useUsage } from '@/hooks/use-usage';
import Link from 'next/link';

export function GuidedMeditation() {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { isSubscribed } = useSubscription();
  const { canUse, updateUsage } = useUsage();
  
  const [allScripts, setAllScripts] = useState<TimedMeditationScript[]>([]);
  const [selectedScript, setSelectedScript] = useState<TimedMeditationScript | null>(null);
  const [isCustomScriptMode, setIsCustomScriptMode] = useState(false);
  const [isTimerOnlyMode, setIsTimerOnlyMode] = useState(false);
  const [customDuration, setCustomDuration] = useState(600); // Default 10 minutes
  const [duration, setDuration] = useState(300);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<TimedMeditationScript | null>(null);
  const [newScriptName, setNewScriptName] = useState('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const customMeditationAllowed = canUse('customMeditation');

  const loadScripts = useCallback(async () => {
    const staticScripts = defaultScripts[language] || defaultScripts.en;
    if (user) {
        const customScripts = await getCustomMeditationScripts(user.uid);
        const all = [...staticScripts, ...customScripts];
        setAllScripts(all);
        setSelectedScript(all[0]);
    } else {
        setAllScripts(staticScripts);
        setSelectedScript(staticScripts[0]);
    }
  }, [language, user]);

  useEffect(() => {
    if (!authLoading) {
      loadScripts();
    }
  }, [authLoading, loadScripts]);

  useEffect(() => {
    if (selectedScript) {
        const isCustom = selectedScript.isCustom || false;
        const isTimer = selectedScript.isTimerOnly || false;
        setIsCustomScriptMode(isCustom);
        setIsTimerOnlyMode(isTimer);
        
        if (isCustom || isTimer) {
            setDuration(customDuration);
        } else {
            setDuration(selectedScript.duration);
        }
        setGeneratedScript(null);
    }
  }, [selectedScript, customDuration]);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const populateVoiceList = () => {
      const availableVoices = synth.getVoices().filter(v => v.lang.startsWith(language));
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        const currentVoice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
        if (!currentVoice) {
          const defaultVoice = availableVoices.find(v => v.default) || availableVoices[0];
          setSelectedVoiceURI(defaultVoice.voiceURI);
        }
      } else {
        setSelectedVoiceURI(undefined);
      }
    };
    
    populateVoiceList();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = populateVoiceList;
    }
  }, [selectedVoiceURI, language]);


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
    if (selectedVoiceURI) {
      const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
      if (selectedVoice) {
        newUtterance.voice = selectedVoice;
      }
    }
    utteranceRef.current = newUtterance;
    synth.speak(newUtterance);
  }, [selectedVoiceURI, voices]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      const scriptToPlay = generatedScript || selectedScript;
      if (scriptToPlay) {
        const elapsedTime = duration - timeLeft;
        const cue = scriptToPlay.cues.find(c => c.time === elapsedTime);
        if (cue) {
          speak(cue.text);
        }
      }

      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playFinishSound();
    }
  }, [isRunning, timeLeft, duration, selectedScript, generatedScript, speak, playFinishSound]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };
  
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
  
  const handleSelectionChange = (title: string) => {
    const newScript = allScripts.find(s => s.title === title);
    if (newScript) {
      setSelectedScript(newScript);
    }
  }

  const handleGenerateCustomScript = async () => {
    if (!user || !customMeditationAllowed) return;
    setIsGenerating(true);
    setGeneratedScript(null);

    const concerns = await getListForToday(user.uid, 'concerns');
    if (concerns.length === 0) {
      toast({
        title: t('meditationPage.custom.noConcernsTitle'),
        description: t('meditationPage.custom.noConcernsDesc'),
        variant: 'destructive'
      });
      setIsGenerating(false);
      return;
    }

    if (!isSubscribed) {
        const recordResult = await recordUsage(user.uid, 'customMeditation');
        if (recordResult.success) {
            updateUsage(recordResult.newUsage);
        } else {
            toast({ title: t('toasts.error'), description: recordResult.error, variant: 'destructive'});
            setIsGenerating(false);
            return;
        }
    }

    const result = await getCustomMeditationAction({
      concerns: concerns.map(c => c.text),
      duration: customDuration,
      language
    });
    
    const newScript = {
      ...result,
      duration: customDuration,
      isCustom: true,
      title: result.title || "Custom Meditation",
    };
    
    setGeneratedScript(newScript);
    setNewScriptName(newScript.title);
    setIsGenerating(false);

    toast({
        title: t('meditationPage.custom.successTitle'),
        description: t('meditationPage.custom.successDesc')
    });
  }
  
  const handleSaveScript = async () => {
    if (!user || !generatedScript || !newScriptName.trim()) return;

    setIsSaving(true);
    const result = await saveCustomMeditationScript(user.uid, {
        ...generatedScript,
        title: newScriptName.trim(),
    });

    if (result.success && result.script) {
        toast({ title: t('toasts.success'), description: t('meditationPage.custom.saveSuccess') });
        await loadScripts();
        setSelectedScript(result.script);
        setGeneratedScript(null);
    } else {
        toast({ title: t('toasts.error'), description: result.error, variant: 'destructive' });
    }
    setIsSaving(false);
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = useMemo(() => {
    return (duration > 0) ? (duration - timeLeft) / duration : 0;
  }, [timeLeft, duration]);

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress);

  if (authLoading || !selectedScript) {
      return (
        <div className="flex flex-col items-center gap-6 p-4">
            <Skeleton className="w-52 h-52 rounded-full" />
            <div className="w-[280px] space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-12 w-28" />
              <Skeleton className="h-12 w-12" />
            </div>
        </div>
      )
  }

  const renderGenerateButton = () => {
    if (!customMeditationAllowed) {
        return (
            <div className="w-full text-center space-y-2">
                <p className="text-sm text-muted-foreground">{t('usageLimits.weeklyLimitReached')}</p>
                <Button asChild><Link href="/upgrade">{t('sidebar.upgrade')}</Link></Button>
            </div>
        )
    }

    return (
        <Button onClick={handleGenerateCustomScript} className="w-full" disabled={isGenerating || isRunning}>
            <Sparkles className="mr-2"/>
            {isGenerating ? t('meditationPage.custom.generating') : t('meditationPage.custom.generateButton')}
        </Button>
    )
  }


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
             {isGenerating ? (
                <Skeleton className="h-10 w-32" />
            ) : (
                <span className="text-4xl font-bold font-mono text-primary">
                {formatTime(timeLeft)}
                </span>
            )}
        </div>
      </div>
      <div className="w-[280px] space-y-4">
        <Select onValueChange={handleSelectionChange} defaultValue={selectedScript.title} disabled={isRunning || isGenerating}>
          <SelectTrigger>
            <SelectValue placeholder={t('meditationPage.selectMeditation')} />
          </SelectTrigger>
          <SelectContent>
            {allScripts.map(script => (
                <SelectItem key={script.title} value={script.title}>
                    {script.title} {script.duration > 0 ? `(${script.duration / 60} min)`: ''}
                </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(isCustomScriptMode || isTimerOnlyMode) && (
            <div className="space-y-4 animate-in fade-in-20">
                <div className="space-y-2">
                    <p className="text-center text-sm font-medium">
                        {t('meditationPage.duration').replace('{minutes}', (customDuration/60).toString())}
                    </p>
                    <Slider
                        value={[customDuration]}
                        onValueChange={(value) => setCustomDuration(value[0])}
                        min={60}
                        max={3600}
                        step={60}
                        disabled={isRunning || isGenerating}
                    />
                </div>
                 {isCustomScriptMode && !generatedScript && (
                    renderGenerateButton()
                 )}
            </div>
        )}

        {generatedScript && (
            <div className="space-y-3 animate-in fade-in-20 border-t pt-4">
                <Input 
                    value={newScriptName}
                    onChange={(e) => setNewScriptName(e.target.value)}
                    placeholder={t('meditationPage.custom.savePlaceholder')}
                />
                <Button onClick={handleSaveScript} className="w-full" disabled={isSaving || isRunning}>
                    <Save className="mr-2"/>
                    {isSaving ? t('meditationPage.custom.saving') : t('meditationPage.custom.saveButton')}
                </Button>
            </div>
        )}

        {!isTimerOnlyMode && (
          <Select onValueChange={setSelectedVoiceURI} value={selectedVoiceURI} disabled={isRunning || voices.length === 0 || isGenerating}>
            <SelectTrigger>
              <SelectValue placeholder={t('meditationPage.selectVoice')} />
            </SelectTrigger>
            <SelectContent>
              {voices.map(voice => (
                  <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex gap-4">
        <Button onClick={handleStartPause} size="lg" className="w-28" disabled={timeLeft === 0 || isGenerating}>
          {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isRunning ? t('meditationPage.pauseButton') : t('meditationPage.startButton')}
        </Button>
        <Button onClick={handleReset} variant="outline" size="lg" aria-label={t('meditationPage.resetButton')} disabled={isGenerating}>
          <TimerReset />
        </Button>
      </div>
    </div>
  );
}
