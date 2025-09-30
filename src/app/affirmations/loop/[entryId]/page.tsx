
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { getConcernAnalysisEntries } from '@/app/actions';
import { useLanguage } from '@/components/i18n/language-provider';
import type { ConcernAnalysisEntry } from '@/app/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Play, Pause, TimerReset } from 'lucide-react';
import Link from 'next/link';

export default function AffirmationLoopPage() {
    const { user, loading: authLoading } = useAuth();
    const { t, language } = useLanguage();
    const params = useParams();
    const router = useRouter();
    const entryId = params.entryId as string;

    const [affirmation, setAffirmation] = useState<ConcernAnalysisEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [repetitions, setRepetitions] = useState(10);
    const [remainingReps, setRemainingReps] = useState(repetitions);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | undefined>();
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const loadAffirmation = async () => {
            if (user) {
                setLoading(true);
                const entries = await getConcernAnalysisEntries(user.uid);
                const foundEntry = entries.find(e => e.id === entryId);
                if (foundEntry) {
                    setAffirmation(foundEntry);
                } else {
                    router.push('/affirmations');
                }
                setLoading(false);
            }
        };

        if (!authLoading) {
            loadAffirmation();
        }
    }, [user, authLoading, entryId, router]);

    useEffect(() => {
        const synth = window.speechSynthesis;
        const populateVoiceList = () => {
            const availableVoices = synth.getVoices().filter(v => v.lang.startsWith(language));
            setVoices(availableVoices);
            if (availableVoices.length > 0 && !selectedVoiceURI) {
                const defaultVoice = availableVoices.find(v => v.default) || availableVoices[0];
                setSelectedVoiceURI(defaultVoice.voiceURI);
            }
        };
        populateVoiceList();
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = populateVoiceList;
        }
    }, [language, selectedVoiceURI]);

    const speak = useCallback((text: string, onEnd: () => void) => {
        const synth = window.speechSynthesis;
        if (synth.speaking) {
            synth.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        utterance.onend = onEnd;
        synth.speak(utterance);
    }, [selectedVoiceURI, voices]);

    const handlePlayback = useCallback(() => {
        if (!isPlaying || !affirmation) return;

        if (remainingReps > 0) {
            speak(affirmation.newDecision, () => {
                setRemainingReps(prev => prev - 1);
            });
        } else {
            setIsPlaying(false);
        }
    }, [isPlaying, remainingReps, affirmation, speak]);

    useEffect(() => {
        handlePlayback();
    }, [remainingReps, isPlaying, handlePlayback]);

    const handlePlayPause = () => {
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            if (remainingReps === 0) {
                setRemainingReps(repetitions);
            }
            setIsPlaying(true);
        }
    };

    const handleReset = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setRemainingReps(repetitions);
    };
    
    const progress = useMemo(() => {
      return (repetitions > 0) ? (repetitions - remainingReps) / repetitions : 0;
    }, [remainingReps, repetitions]);

    const circumference = 2 * Math.PI * 90;
    const strokeDashoffset = circumference * (1 - progress);

    if (loading || authLoading) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <Skeleton className="h-8 w-40" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-5 w-1/2" />
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6">
                        <Skeleton className="w-52 h-52 rounded-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-12 w-40" />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!affirmation) {
        return null; // Or a not found message
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Button variant="ghost" asChild className="-ml-4">
              <Link href="/affirmations">
                <ArrowLeft className="mr-2" />
                {t('affirmationsPage.backLink')}
              </Link>
            </Button>
            <Card className="shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-primary">"{affirmation.newDecision}"</CardTitle>
                     {affirmation.limitingBelief && (
                        <CardDescription>
                            {t('affirmationsPage.fromYour')} "{affirmation.limitingBelief}"
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-8 pt-6">
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
                                    {remainingReps}
                                </span>
                                <span className="text-sm text-muted-foreground">{t('affirmationsPage.loop.repsLeft')}</span>
                        </div>
                    </div>
                    
                    <div className="w-full max-w-sm space-y-6">
                        <div className="space-y-2">
                            <p className="text-center text-sm font-medium">
                                {t('affirmationsPage.loop.repetitions')}: {repetitions}
                            </p>
                            <Slider
                                value={[repetitions]}
                                onValueChange={(value) => {
                                    setRepetitions(value[0]);
                                    if(!isPlaying) {
                                        setRemainingReps(value[0]);
                                    }
                                }}
                                min={1}
                                max={50}
                                step={1}
                                disabled={isPlaying}
                            />
                        </div>
                        
                        <Select onValueChange={setSelectedVoiceURI} value={selectedVoiceURI} disabled={isPlaying || voices.length === 0}>
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
                    </div>

                    <div className="flex gap-4">
                        <Button onClick={handlePlayPause} size="lg" className="w-28">
                          {isPlaying ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                          {isPlaying ? t('meditationPage.pauseButton') : t('meditationPage.startButton')}
                        </Button>
                        <Button onClick={handleReset} variant="outline" size="lg" aria-label={t('meditationPage.resetButton')}>
                          <TimerReset />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}