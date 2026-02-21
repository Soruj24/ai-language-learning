import { auth } from "@/app/lib/auth";
import { stripe } from "@/app/lib/stripe";
import User from "@/app/lib/models/User";
import Subscription from "@/app/lib/models/Subscription";
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";

const settingsUrl = process.env.NEXT_PUBLIC_APP_URL + "/billing";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { priceId, plan } = await req.json();

    if (!session?.user || !session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Admin bypass
    if (session.user.email === 'sorujmahmudb2h@gmail.com') {
      return NextResponse.json({ url: settingsUrl });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const subscription = await Subscription.findOne({ userId: user._id });

    // If user has an active subscription, redirect to billing portal
    if (
      subscription &&
      subscription.stripeCustomerId &&
      subscription.status === "active"
    ) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: settingsUrl,
      });

      return NextResponse.json({ url: stripeSession.url });
    }

    // If user has stripeCustomerId but no active subscription (e.g. cancelled), reuse the customer ID
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user._id.toString(),
        },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user._id.toString(),
        plan: plan, // 'pro' or 'premium'
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.log("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
