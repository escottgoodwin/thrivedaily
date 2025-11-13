
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '@/components/i18n/language-provider';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewsletterPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        // In a real app, you'd fetch the user's subscription status
        setEmail(user.email || '');
        // For now, we'll just simulate a state
        setIsSubscribed(true); 
      }
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleSubscriptionChange = (subscribed: boolean) => {
    if (loading) return;
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(subscribed);
      toast({
        title: t('toasts.success'),
        description: subscribed ? t('newsletterPage.subscribedSuccess') : t('newsletterPage.unsubscribedSuccess'),
      });
      setLoading(false);
    }, 500);
  };
  
  const emailFeatures = [
    t('newsletterPage.features.affirmation'),
    t('newsletterPage.features.focus'),
    t('newsletterPage.features.journal'),
    t('newsletterPage.features.gratitude'),
    t('newsletterPage.features.manifestation'),
    t('newsletterPage.features.belief'),
    t('newsletterPage.features.tip'),
    t('newsletterPage.features.quote'),
    t('newsletterPage.features.resource'),
    t('newsletterPage.features.vibe'),
  ];

  if (authLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
                 <Skeleton className="h-40 w-full" />
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-48" />
            </CardFooter>
        </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Mail className="text-primary" />
          {t('newsletterPage.title')}
        </h1>
        <p className="text-muted-foreground mt-2">{t('newsletterPage.description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('newsletterPage.featuresTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {emailFeatures.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('newsletterPage.manageTitle')}</CardTitle>
            <CardDescription>{t('newsletterPage.manageDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.emailLabel')}</Label>
                    <Input id="email" type="email" value={email} disabled />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="subscription-toggle"
                        checked={isSubscribed}
                        onCheckedChange={handleSubscriptionChange}
                        disabled={loading}
                    />
                    <Label htmlFor="subscription-toggle">
                        {isSubscribed ? t('newsletterPage.subscribedStatus') : t('newsletterPage.unsubscribedStatus')}
                    </Label>
                </div>
            </div>
          </CardContent>
           <CardFooter>
                <p className="text-xs text-muted-foreground">{t('newsletterPage.privacyNotice')}</p>
           </CardFooter>
        </Card>
      </div>
    </div>
  );
}
