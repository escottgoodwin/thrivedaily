
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '@/components/i18n/language-provider';
import { useToast } from '@/hooks/use-toast';
import { getConnections, sendConnectionRequest, updateConnectionStatus } from '@/app/actions';
import type { AccountabilityPartner } from '@/app/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Send, Check, X, Link as LinkIcon, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function AccountabilityPage() {
    const { user, loading: authLoading } = useAuth();
    const { t } = useLanguage();
    const { toast } = useToast();

    const [connections, setConnections] = useState<AccountabilityPartner[]>([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);

    const loadConnections = useCallback(async () => {
        if (user) {
            setLoading(true);
            const data = await getConnections(user.uid);
            setConnections(data);
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading) {
            loadConnections();
        }
    }, [authLoading, loadConnections]);

    const handleSendRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !email.trim()) return;
        
        setIsSending(true);
        const result = await sendConnectionRequest(user.uid, user.email!, email);
        if (result.success) {
            toast({ title: t('toasts.success'), description: t('accountabilityPage.requestSent') });
            setEmail('');
            loadConnections();
        } else {
            toast({ title: t('toasts.error'), description: result.error, variant: 'destructive' });
        }
        setIsSending(false);
    };

    const handleConnectionUpdate = async (connectionId: string, status: 'accepted' | 'declined') => {
        if (!user) return;
        const result = await updateConnectionStatus(user.uid, connectionId, status);
        if (result.success) {
            toast({ title: t('toasts.success'), description: t('accountabilityPage.connectionUpdated') });
            loadConnections();
        } else {
            toast({ title: t('toasts.error'), description: result.error, variant: 'destructive' });
        }
    };
    
    const renderSkeleton = () => (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-20" />
          </div>
        ))}
      </div>
    );

    const receivedRequests = connections.filter(c => c.status === 'pending' && c.direction === 'received');
    const sentRequests = connections.filter(c => c.status === 'pending' && c.direction === 'sent');
    const acceptedPartners = connections.filter(c => c.status === 'accepted');

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Users className="text-primary"/>
                    {t('accountabilityPage.title')}
                </h1>
                <p className="text-muted-foreground mt-2">{t('accountabilityPage.description')}</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('accountabilityPage.addPartnerTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSendRequest} className="flex gap-2">
                        <Input 
                            type="email" 
                            placeholder={t('accountabilityPage.emailPlaceholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSending}
                        />
                        <Button type="submit" disabled={isSending || !email.trim()}>
                            <Send className="mr-2"/>
                            {isSending ? t('accountabilityPage.sending') : t('accountabilityPage.sendRequest')}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {loading || authLoading ? renderSkeleton() : (
              <>
                {receivedRequests.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('accountabilityPage.receivedRequestsTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {receivedRequests.map(conn => (
                                <div key={conn.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                    <p>{t('accountabilityPage.requestFrom')} <strong>{conn.email}</strong></p>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleConnectionUpdate(conn.id, 'accepted')}><Check className="text-green-500" /></Button>
                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleConnectionUpdate(conn.id, 'declined')}><X className="text-destructive" /></Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>{t('accountabilityPage.partnersTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {acceptedPartners.length > 0 ? acceptedPartners.map(conn => (
                            <div key={conn.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                <p className="font-semibold">{conn.email}</p>
                                <div className="flex gap-2">
                                    <Button asChild variant="outline">
                                        <Link href={`/accountability/${conn.userId}`}>
                                            <LinkIcon className="mr-2" />
                                            {t('accountabilityPage.viewProgress')}
                                        </Link>
                                    </Button>
                                    <Button size="icon" variant="destructive" className="h-9 w-9" onClick={() => handleConnectionUpdate(conn.id, 'declined')}>
                                        <Trash2 />
                                    </Button>
                                </div>
                            </div>
                        )) : <p className="text-muted-foreground text-center">{t('accountabilityPage.noPartners')}</p>}
                    </CardContent>
                </Card>

                 {sentRequests.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('accountabilityPage.sentRequestsTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {sentRequests.map(conn => (
                                <div key={conn.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                    <p>{conn.email}</p>
                                    <Badge variant="outline">{t('accountabilityPage.pendingStatus')}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
              </>
            )}
        </div>
    );
}
