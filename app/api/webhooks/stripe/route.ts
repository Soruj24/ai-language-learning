import { stripe } from "@/app/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Subscription from "@/app/lib/models/Subscription";
import User from "@/app/lib/models/User";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  await connectDB();

  if (event.type === "checkout.session.completed") {
    const subscription = (await stripe.subscriptions.retrieve(
      session.subscription as string,
    )) as any;

    if (!session?.metadata?.userId) {
      return new NextResponse("User id is required", { status: 400 });
    }

    await Subscription.findOneAndUpdate(
      { userId: session.metadata.userId },
      {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000,
        ),
        plan: session.metadata.plan || "pro",
        status: "active",
      },
      { upsert: true, new: true },
    );

    // Also ensure User has the stripeCustomerId
    await User.findByIdAndUpdate(session.metadata.userId, {
      stripeCustomerId: subscription.customer as string,
    });
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as any;
    const subscription = (await stripe.subscriptions.retrieve(
      invoice.subscription as string,
    )) as any;

    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000,
        ),
      },
    );
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as any;

    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000,
        ),
        status: "active",
      },
    );
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as any;

    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status: "canceled",
        plan: "free",
      },
    );
  }

  return new NextResponse(null, { status: 200 });
}
