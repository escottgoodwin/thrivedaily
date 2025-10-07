
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Zap } from 'lucide-react';
import { useLanguage } from '@/components/i18n/language-provider';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/auth-provider';
import { useSubscription } from '@/hooks/use-subscription';
import { loadStripe } from '@stripe/stripe-js';

export default function UpgradePage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const { user } = useAuth();
    const { isSubscribed } = useSubscription();

    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.uid }),
            });

            if (!res.ok) {
                throw new Error('Could not create checkout session');
            }

            const { sessionId } = await res.json();
            if (!sessionId) {
                throw new Error('Could not create checkout session');
            }

            const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
            if (!stripe) {
                throw new Error('Stripe.js not loaded');
            }
            
            await stripe.redirectToCheckout({ sessionId });

        } catch (error) {
            console.error("Checkout error:", error);
            toast({ title: t('toasts.error'), description: (error as Error).message, variant: 'destructive' });
            setLoading(false);
        }
    };
    
    const handleBillingPortal = async () => {
        if (!user) return;
        setLoading(true);
         try {
            const res = await fetch('/api/create-billing-portal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.uid }),
            });

            if (!res.ok) {
                throw new Error('Could not create billing portal session');
            }

            const { url } = await res.json();
            if (!url) {
                throw new Error('Could not create billing portal session');
            }
            
            window.location.href = url;

        } catch (error) {
            console.error("Billing portal error:", error);
            toast({ title: t('toasts.error'), description: t('upgradePage.billingPortalError'), variant: 'destructive' });
            setLoading(false);
        }
    }

    const features = [
        t('upgradePage.features.quote'),
        t('upgradePage.features.chat'),
        t('upgradePage.features.suggestions'),
        t('upgradePage.features.analysis'),
        t('upgradePage.features.meditation'),
    ];

    return (
        <div className="flex justify-center items-center py-12">
            <Card className="w-full max-w-lg shadow-2xl">
                <CardHeader className="text-center">
                    <Zap className="mx-auto h-12 w-12 text-primary mb-4" />
                    <CardTitle className="text-3xl">{t('upgradePage.title')}</CardTitle>
                    <CardDescription>{t('upgradePage.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <h3 className="font-semibold text-lg mb-4">{t('upgradePage.featuresTitle')}</h3>
                    <ul className="space-y-3">
                        {features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                                <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    {isSubscribed ? (
                         <Button onClick={handleBillingPortal} disabled={loading} className="w-full">
                            {t('upgradePage.manageSubscription')}
                        </Button>
                    ) : (
                        <Button onClick={handleCheckout} disabled={loading} className="w-full">
                            {loading ? t('upgradePage.upgrading') : t('upgradePage.upgradeButton')}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
