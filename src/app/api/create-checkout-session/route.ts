import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(req: Request) {
  const { userId } = await req.json();
  const origin = req.headers.get('origin');

  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  let customerId;

  if (userSnap.exists() && userSnap.data().stripeCustomerId) {
    customerId = userSnap.data().stripeCustomerId;
  } else {
    const customer = await stripe.customers.create({
      metadata: {
        firebaseUID: userId,
      },
    });
    customerId = customer.id;
    await setDoc(userRef, { stripeCustomerId: customerId }, { merge: true });
  }

  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: 'Stripe Price ID not configured' }, { status: 500 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/upgrade`,
      metadata: {
        firebaseUID: userId,
      }
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
