
"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/i18n/language-provider";
import Link from "next/link";
import { ArrowRight, BrainCircuit, CheckCircle, Cloudy, Gift, ListTodo, Sparkles, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function LandingPage() {
    const { t } = useLanguage();

    const features = [
        {
            icon: <Sparkles className="h-10 w-10 text-primary" />,
            title: "AI-Powered Insights",
            description: "Get personalized quotes, analyze journal entries for themes, and chat with an AI companion about your concerns and goals."
        },
        {
            icon: <Target className="h-10 w-10 text-primary" />,
            title: "Comprehensive Goal Setting",
            description: "Define your goals, break them down into actionable tasks, and track your progress with visual aids and celebratory wins."
        },
        {
            icon: <BrainCircuit className="h-10 w-10 text-primary" />,
            title: "Custom Guided Meditations",
            description: "Generate personalized meditation scripts based on your current concerns to find calm and focus."
        },
        {
            icon: <ListTodo className="h-10 w-10 text-primary" />,
            title: "Daily Journaling & Review",
            description: "Capture your thoughts, gratitudes, and concerns daily. Reflect on your progress with a structured daily review process."
        }
    ];

    return (
        <div className="flex flex-col min-h-[100vh]">
            <main className="flex-1">
                {/* Hero Section */}
                <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-background via-secondary to-accent">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="space-y-2">
                                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                                        Find Your Focus, Build Your Future
                                    </h1>
                                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                        Thrive Daily is your personal development companion, using AI to help you build mindfulness, achieve your goals, and live a more fulfilling life.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                    <Button asChild size="lg">
                                        <Link href="/signup">
                                            Start Your Journey
                                            <ArrowRight className="ml-2" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg">
                                        <Link href="/login">
                                            Login
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
                                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">A Smarter Way to Grow</h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Our intelligent tools provide the structure and support you need to turn aspirations into achievements.
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
                            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">A Simple Path to a Better You</h2>
                            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Our daily flow is designed to be simple, effective, and easy to integrate into your routine.
                            </p>
                        </div>
                        <div className="mx-auto w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                           <div className="flex flex-col items-center gap-2">
                               <div className="flex items-center justify-center rounded-full bg-primary text-primary-foreground h-16 w-16 text-2xl font-bold">1</div>
                               <h3 className="text-xl font-bold">Capture Your Day</h3>
                               <p className="text-sm text-muted-foreground">List your concerns, gratitudes, and daily tasks to clear your mind and set your focus.</p>
                           </div>
                           <div className="flex flex-col items-center gap-2">
                               <div className="flex items-center justify-center rounded-full bg-primary text-primary-foreground h-16 w-16 text-2xl font-bold">2</div>
                               <h3 className="text-xl font-bold">Gain Insight</h3>
                               <p className="text-sm text-muted-foreground">Use AI to analyze your journal, get suggestions for your goals, and receive a personalized quote.</p>
                           </div>
                           <div className="flex flex-col items-center gap-2">
                               <div className="flex items-center justify-center rounded-full bg-primary text-primary-foreground h-16 w-16 text-2xl font-bold">3</div>
                               <h3 className="text-xl font-bold">Reflect & Grow</h3>
                               <p className="text-sm text-muted-foreground">End your day with a guided review to celebrate wins and identify opportunities for improvement.</p>
                           </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Thrive?</h2>
                            <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                Join today and start your journey towards a more mindful and fulfilling life.
                            </p>
                            <Button asChild size="lg">
                                <Link href="/signup">
                                    Get Started for Free
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

    