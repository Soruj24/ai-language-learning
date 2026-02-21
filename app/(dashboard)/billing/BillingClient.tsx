"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { useLanguage } from "@/app/lib/i18n/LanguageContext";

interface BillingClientProps {
  subscription: {
    plan: string;
    status: string;
    stripeCurrentPeriodEnd?: string;
  } | null;
}

export default function BillingClient({
  subscription,
}: BillingClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage(); // Assuming useLanguage hook exists

  const onSubscribe = async (plan: "pro" | "premium") => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId:
            plan === "pro"
              ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO
              : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM,
          plan: plan,
        }),
      });

      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onManageSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // For managing subscription, we assume the backend handles the redirect to portal
          // when it detects an existing subscription.
          // But checking the backend code, it expects priceId/plan if creating a new one.
          // If existing subscription, it ignores priceId/plan and redirects to portal.
          // So we can send dummy data or just reuse 'pro'.
          priceId: "manage",
          plan: "manage",
        }),
      });

      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const currentPlan = subscription?.plan || "free";
  const isPro = currentPlan === "pro";
  const isPremium = currentPlan === "premium";
  const isFree = currentPlan === "free";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>
            You are currently on the{" "}
            <span className="font-bold capitalize">{currentPlan}</span> plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              Status:{" "}
              <Badge
                variant={
                  subscription?.status === "active" ? "default" : "destructive"
                }
                className="capitalize"
              >
                {subscription?.status || "Active"}
              </Badge>
            </div>
            {subscription?.stripeCurrentPeriodEnd && (
              <div className="text-sm text-muted-foreground">
                Renews on: {formatDate(subscription.stripeCurrentPeriodEnd)}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          {isFree ? (
            <p className="text-sm text-muted-foreground">
              Upgrade to Pro or Premium to unlock more features.
            </p>
          ) : (
            <Button onClick={onManageSubscription} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Manage Subscription
            </Button>
          )}
        </CardFooter>
      </Card>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <Card
          className={`relative ${isFree ? "border-primary shadow-md" : ""}`}
        >
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>For casual learners</CardDescription>
            <div className="text-3xl font-bold mt-2">
              $0
              <span className="text-sm font-normal text-muted-foreground">
                /mo
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> Daily Lessons
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> Basic Vocabulary
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> Community Access
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" disabled={isFree}>
              {isFree ? "Current Plan" : "Downgrade"}
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className={`relative ${isPro ? "border-primary shadow-md" : ""}`}>
          {isPro && (
            <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              Current
            </div>
          )}
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>For serious students</CardDescription>
            <div className="text-3xl font-bold mt-2">
              $9
              <span className="text-sm font-normal text-muted-foreground">
                /mo
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> Everything in Free
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> Unlimited Hearts
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> Pronunciation
                Analysis
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> No Ads
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={isPro ? "outline" : "default"}
              disabled={isPro || isLoading}
              onClick={() => onSubscribe("pro")}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPro ? "Current Plan" : "Upgrade to Pro"}
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card
          className={`relative ${isPremium ? "border-primary shadow-md" : ""}`}
        >
          {isPremium && (
            <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              Current
            </div>
          )}
          <CardHeader>
            <CardTitle>Premium</CardTitle>
            <CardDescription>For mastery seekers</CardDescription>
            <div className="text-3xl font-bold mt-2">
              $19
              <span className="text-sm font-normal text-muted-foreground">
                /mo
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> Everything in Pro
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> 1-on-1 AI Tutor
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> Certification
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> Offline Mode
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> Priority Support
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white border-0"
              disabled={isPremium || isLoading}
              onClick={() => onSubscribe("premium")}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPremium ? "Current Plan" : "Get Premium"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
