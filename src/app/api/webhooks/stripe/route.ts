import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature!, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const firebaseUID = session.metadata?.firebaseUID;
  
  if (!firebaseUID) {
    console.error("No firebaseUID in webhook metadata");
    return NextResponse.json({ received: true });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      const subscriptionData = {
          id: subscription.id,
          userId: firebaseUID,
          status: subscription.status,
          priceId: subscription.items.data[0].price.id,
          current_period_end: new Date(subscription.current_period_end * 1000),
      };

      const subscriptionRef = doc(db, 'users', firebaseUID, 'subscriptions', subscription.id);
      await setDoc(subscriptionRef, subscriptionData);
      
      break;
    
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const updatedSubscription = event.data.object as Stripe.Subscription;
      const updatedData = {
          id: updatedSubscription.id,
          userId: firebaseUID,
          status: updatedSubscription.status,
          priceId: updatedSubscription.items.data[0].price.id,
          current_period_end: new Date(updatedSubscription.current_period_end * 1000),
      };

      const updatedSubscriptionRef = doc(db, 'users', firebaseUID, 'subscriptions', updatedSubscription.id);
      await setDoc(updatedSubscriptionRef, updatedData, { merge: true });
      break;

    default:
      // console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
