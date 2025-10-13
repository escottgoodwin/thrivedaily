
"use client";

import { Button } from "@/components/ui/button";
import { useLanguage, type Language } from "@/components/i18n/language-provider";
import Link from "next/link";
import { ArrowRight, BrainCircuit, CheckCircle, Cloudy, Gift, ListTodo, Sparkles, Target, Languages } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function LandingPage() {
    const { t, setLanguage } = useLanguage();

    const features = [
        {
            icon: <Sparkles className="h-10 w-10 text-primary" />,
            title: t('landingPage.features.one.title'),
            description: t('landingPage.features.one.description')
        },
        {
            icon: <Target className="h-10 w-10 text-primary" />,
            title: t('landingPage.features.two.title'),
            description: t('landingPage.features.two.description')
        },
        {
            icon: <BrainCircuit className="h-10 w-10 text-primary" />,
            title: t('landingPage.features.three.title'),
            description: t('landingPage.features.three.description')
        },
        {
            icon: <ListTodo className="h-10 w-10 text-primary" />,
            title: t('landingPage.features.four.title'),
            description: t('landingPage.features.four.description')
        }
    ];

    return (
        <div className="flex flex-col min-h-[100vh]">
             <header className="absolute top-0 left-0 right-0 z-50 p-4 bg-transparent">
                <div className="container mx-auto flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost">
                                <Languages className="mr-2" />
                                {t('sidebar.language')}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setLanguage('en' as Language)}>English</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLanguage('es' as Language)}>Español</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLanguage('fr' as Language)}>Français</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <main className="flex-1">
                {/* Hero Section */}
                <section className="w-full pt-32 pb-20 md:pt-48 md:pb-32 lg:pt-56 lg:pb-40 bg-gradient-to-br from-background via-secondary to-accent">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="space-y-2">
                                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                                        {t('landingPage.hero.title')}
                                    </h1>
                                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                        {t('landingPage.hero.description')}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                    <Button asChild size="lg">
                                        <Link href="/signup">
                                            {t('landingPage.hero.ctaPrimary')}
                                            <ArrowRight className="ml-2" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg">
                                        <Link href="/login">
                                            {t('landingPage.hero.ctaSecondary')}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                            <Image
                              src="https://picsum.photos/seed/rocket/600/400"
                              width="600"
                              height="400"
                              alt="Hero"
                              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                              data-ai-hint="rocket launch"
                            />
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">{t('landingPage.features.badge')}</div>
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{t('landingPage.features.title')}</h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    {t('landingPage.features.description')}
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-2 xl:grid-cols-4 mt-12">
                            {features.map((feature, index) => (
                                <Card key={index} className="h-full flex flex-col">
                                    <CardHeader>
                                        {feature.icon}
                                        <CardTitle className="mt-4">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <p className="text-muted-foreground">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                 {/* How It Works Section */}
                <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
                    <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">{t('landingPage.howItWorks.title')}</h2>
                            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                {t('landingPage.howItWorks.description')}
                            </p>
                        </div>
                        <div className="mx-auto w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                           <div className="flex flex-col items-center gap-2">
                               <div className="flex items-center justify-center rounded-full bg-primary text-primary-foreground h-16 w-16 text-2xl font-bold">1</div>
                               <h3 className="text-xl font-bold">{t('landingPage.howItWorks.stepOne.title')}</h3>
                               <p className="text-sm text-muted-foreground">{t('landingPage.howItWorks.stepOne.description')}</p>
                           </div>
                           <div className="flex flex-col items-center gap-2">
                               <div className="flex items-center justify-center rounded-full bg-primary text-primary-foreground h-16 w-16 text-2xl font-bold">2</div>
                               <h3 className="text-xl font-bold">{t('landingPage.howItWorks.stepTwo.title')}</h3>
                               <p className="text-sm text-muted-foreground">{t('landingPage.howItWorks.stepTwo.description')}</p>
                           </div>
                           <div className="flex flex-col items-center gap-2">
                               <div className="flex items-center justify-center rounded-full bg-primary text-primary-foreground h-16 w-16 text-2xl font-bold">3</div>
                               <h3 className="text-xl font-bold">{t('landingPage.howItWorks.stepThree.title')}</h3>
                               <p className="text-sm text-muted-foreground">{t('landingPage.howItWorks.stepThree.description')}</p>
                           </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t('landingPage.finalCta.title')}</h2>
                            <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                {t('landingPage.finalCta.description')}
                            </p>
                            <Button asChild size="lg">
                                <Link href="/signup">
                                    {t('landingPage.finalCta.cta')}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

    