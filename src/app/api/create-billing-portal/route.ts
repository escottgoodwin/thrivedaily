import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(req: Request) {
  const { userId } = await req.json();
  const origin = req.headers.get('origin');

  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists() || !userSnap.data().stripeCustomerId) {
    return NextResponse.json({ error: 'Stripe customer not found for this user' }, { status: 404 });
  }

  const customerId = userSnap.data().stripeCustomerId;

  try {
    const { url } = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/`,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Stripe billing portal error:', error);
    return NextResponse.json({ error: 'Failed to create billing portal session' }, { status: 500 });
  }
}
