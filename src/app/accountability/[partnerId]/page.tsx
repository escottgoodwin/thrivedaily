
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '@/components/i18n/language-provider';
import type { Goal, GoalComment, DailyReview } from '@/app/types';
import { getGoals, getGoalComments, addGoalComment, getDailyReview } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

export default function PartnerProgressPage() {
    const { user, loading: authLoading } = useAuth();
    const { t } = useLanguage();
    const { toast } = useToast();
    const params = useParams();
    const router = useRouter();
    
    const partnerId = params.partnerId as string;

    const [goals, setGoals] = useState<Goal[]>([]);
    const [comments, setComments] = useState<Record<string, GoalComment[]>>({});
    const [newComment, setNewComment] = useState<Record<string, string>>({});
    const [dailyReview, setDailyReview] = useState<DailyReview | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCommenting, setIsCommenting] = useState<Record<string, boolean>>({});

    const loadPartnerData = useCallback(async () => {
        if (!partnerId) return;
        setLoading(true);
        
        const today = new Date().toISOString().split('T')[0];
        const [partnerGoals, reviewData] = await Promise.all([
             getGoals(partnerId),
             getDailyReview(partnerId, today),
        ]);

        setGoals(partnerGoals);
        setDailyReview(reviewData);

        const allComments: Record<string, GoalComment[]> = {};
        for (const goal of partnerGoals) {
            allComments[goal.id] = await getGoalComments(partnerId, goal.id);
        }
        setComments(allComments);

        setLoading(false);
    }, [partnerId]);

    useEffect(() => {
        if (!authLoading) {
            loadPartnerData();
        }
    }, [authLoading, loadPartnerData]);

    const handleAddComment = async (goalId: string) => {
        if (!user || !newComment[goalId]?.trim()) return;

        setIsCommenting(prev => ({...prev, [goalId]: true}));

        const result = await addGoalComment(partnerId, goalId, {
            authorId: user.uid,
            authorName: user.displayName || user.email || 'Anonymous',
            text: newComment[goalId],
        });

        if (result.success && result.comment) {
            setComments(prev => ({
                ...prev,
                [goalId]: [...(prev[goalId] || []), result.comment!],
            }));
            setNewComment(prev => ({...prev, [goalId]: ''}));
        } else {
            toast({ title: t('toasts.error'), description: result.error, variant: 'destructive'});
        }

        setIsCommenting(prev => ({...prev, [goalId]: false}));
    };
    
    const renderSkeleton = () => (
        <div className="space-y-6">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    );
    
    const DailyReviewDisplay = ({ review }: { review: DailyReview | null }) => {
        if (!review) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('accountabilityPage.noReview')}</CardTitle>
                    </CardHeader>
                </Card>
            )
        }
        return (
            <Card className="bg-secondary">
                <CardHeader>
                    <CardTitle>{t('accountabilityPage.dailyReviewTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {review.summary && (
                        <div>
                            <h4 className="font-semibold">{t('dailyReviewPage.summary.title')}</h4>
                            <p className="text-muted-foreground">{review.summary}</p>
                        </div>
                    )}
                    {review.wins && review.wins.length > 0 && (
                        <div>
                            <h4 className="font-semibold">{t('dailyReviewPage.wins.title')}</h4>
                            <ul className="list-disc pl-5 text-muted-foreground">
                                {review.wins.map((win, i) => <li key={i}>{win}</li>)}
                            </ul>
                        </div>
                    )}
                    {review.goalProgress && (
                        <div>
                            <h4 className="font-semibold">{t('dailyReviewPage.progress.title')}</h4>
                            <p className="text-muted-foreground">{review.goalProgress}</p>
                        </div>
                    )}
                    {review.improvements && (
                         <div>
                            <h4 className="font-semibold">{t('dailyReviewPage.improvements.title')}</h4>
                            <p className="text-muted-foreground">{review.improvements}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" asChild className="-ml-4">
              <Link href="/accountability">
                <ArrowLeft className="mr-2" />
                {t('accountabilityPage.backLink')}
              </Link>
            </Button>
            
            <h1 className="text-3xl font-bold">{t('accountabilityPage.partnerProgressTitle')}</h1>
            
            {loading ? renderSkeleton() : (
                <div className="space-y-6">
                    <DailyReviewDisplay review={dailyReview} />
                    
                    <h2 className="text-2xl font-bold">{t('accountabilityPage.goalsTitle')}</h2>

                    {goals.length > 0 ? (
                        goals.map(goal => (
                            <Card key={goal.id}>
                                <CardHeader>
                                    <CardTitle>{goal.text}</CardTitle>
                                    {goal.description && <CardDescription>{goal.description}</CardDescription>}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <h4 className="font-semibold">{t('accountabilityPage.commentsTitle')}</h4>
                                    <div className="space-y-3">
                                        {(comments[goal.id] || []).map(comment => (
                                            <div key={comment.id} className="flex items-start gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className='flex-1'>
                                                    <p className="text-sm font-semibold">{comment.authorName}</p>
                                                    <p className="text-sm text-muted-foreground">{comment.text}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(comment.createdAt), "PPP p")}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <form onSubmit={(e) => { e.preventDefault(); handleAddComment(goal.id);}} className="w-full flex gap-2">
                                        <Textarea 
                                            placeholder={t('accountabilityPage.commentPlaceholder')}
                                            value={newComment[goal.id] || ''}
                                            onChange={(e) => setNewComment(prev => ({...prev, [goal.id]: e.target.value}))}
                                            disabled={isCommenting[goal.id]}
                                            rows={1}
                                        />
                                        <Button type="submit" disabled={isCommenting[goal.id] || !newComment[goal.id]?.trim()}>
                                            <Send />
                                        </Button>
                                    </form>
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                        <Card className="text-center py-16">
                            <CardHeader>
                                <CardTitle>{t('accountabilityPage.noGoalsShared')}</CardTitle>
                            </CardHeader>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}

