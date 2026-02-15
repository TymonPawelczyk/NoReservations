# Bez Rezerwacji - Monetization Implementation Guide

**Purpose:** Technical guide for implementing monetization features described in MONETIZATION_STRATEGY.md

**Tech Stack:**
- Next.js 15 (App Router)
- Firebase Firestore + Authentication
- Stripe Payments
- TypeScript
- Tailwind CSS

---

## Phase 1: Stripe + Firebase Setup (Week 1-2)

### 1.1 Prerequisites

**Stripe Setup:**
```bash
# Create Stripe account at https://stripe.com
# Get test keys from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Get webhook signing secret:
# https://dashboard.stripe.com/test/webhooks
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Firebase Setup:**
```bash
# Upgrade Firebase project to Blaze plan (pay-as-you-go)
# This is required for Cloud Functions which handle Stripe webhooks

# Install packages:
npm install --save \
  @stripe/firestore-stripe-payments \
  stripe \
  firebase-admin
```

**Update .env.local:**
```env
# Existing Firebase vars
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# New Stripe vars
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 1.2 Firestore Collection Setup

**Create Collections in Firestore Console:**

1. **stripe_products** collection
   - Document ID: `premium_monthly`
   - Fields:
     ```
     {
       "name": "Bez Premium",
       "description": "Unlimited sessions + customization",
       "type": "service",
       "prices": {
         "monthly": {
           "amount": 499,
           "currency": "usd",
           "interval": "month",
           "intervalCount": 1,
           "trial_period_days": 7
         },
         "annual": {
           "amount": 3999,
           "currency": "usd",
           "interval": "year",
           "intervalCount": 1
         }
       }
     }
     ```

2. **stripe_customers** collection (auto-created)
   - Stores customer subscription data
   - One doc per user (subcollection)

3. **users** collection (update existing)
   - Add fields to track subscription status:
     ```
     subscriptionStatus: {
       isPremium: boolean,
       premiumTier: "free" | "premium" | "ultimate",
       trialEndDate: timestamp,
       renewalDate: timestamp,
       canceledAt: timestamp
     },
     purchasedItems: {
       [itemId]: count/boolean
     }
     ```

### 1.3 Initialize Stripe in App

**File: `lib/stripe-client.ts`**

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeStripe } from '@stripe/firestore-stripe-payments';
import { getFirebaseConfig } from './firebase';

const firebaseApp = initializeApp(getFirebaseConfig());
const db = getFirestore(firebaseApp);

let stripePayments: ReturnType<typeof initializeStripe>;

export async function getStripePayments() {
  if (!stripePayments) {
    stripePayments = await initializeStripe(firebaseApp, {
      productsCollection: 'stripe_products',
      customersCollection: 'stripe_customers',
    });
  }
  return stripePayments;
}

export async function createCheckoutSession(
  uid: string,
  priceId: string,
  options?: {
    returnUrl?: string;
  }
) {
  const stripe = await getStripePayments();
  return stripe.checkout({
    user: { uid },
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: options?.returnUrl || window.location.href,
    cancel_url: window.location.href,
  });
}

export async function getSubscriptions(uid: string) {
  const stripe = await getStripePayments();
  return stripe.getSubscriptions(uid);
}

export async function getCustomerData(uid: string) {
  const stripe = await getStripePayments();
  return stripe.getCustomerData(uid);
}
```

**File: `lib/stripe-admin.ts`** (Server-side for Cloud Functions)

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export async function getProductPrice(productId: string, type: 'monthly' | 'annual' = 'monthly') {
  // Query Firestore for pricing
  // This would be called during checkout
}

export async function createInvoice(
  customerId: string,
  amount: number,
  description: string
) {
  return stripe.invoices.create({
    customer: customerId,
    amount,
    description,
    auto_advance: true,
  });
}

export async function refundCharge(chargeId: string, amount?: number) {
  return stripe.refunds.create({
    charge: chargeId,
    amount,
  });
}
```

---

## Phase 2: Pricing & Product Page (Week 2-3)

### 2.1 Pricing Page Component

**File: `app/pricing/page.tsx`**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getStripePayments } from '@/lib/stripe-client';
import PricingCard from '@/components/pricing/PricingCard';
import TrialBadge from '@/components/pricing/TrialBadge';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  trialDays: number;
  cta: string;
}

export default function PricingPage() {
  const { user } = useAuth();
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeInterval, setActiveInterval] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    async function loadPricing() {
      const stripe = await getStripePayments();
      // Fetch products and prices from Firestore via Stripe client
      // Map to PricingTier format
      setTiers([
        {
          id: 'free',
          name: 'Free',
          description: 'Perfect for trying out',
          price: 0,
          currency: 'usd',
          interval: 'forever',
          features: [
            '1 session per day',
            'Basic avatars',
            'All core games',
            'Real-time sync'
          ],
          trialDays: 0,
          cta: 'Start for Free'
        },
        {
          id: 'premium_monthly',
          name: 'Bez Premium',
          description: 'For date night enthusiasts',
          price: activeInterval === 'monthly' ? 4.99 : 39.99,
          currency: 'usd',
          interval: activeInterval === 'monthly' ? 'month' : 'year',
          features: [
            'Unlimited sessions',
            'Premium avatars',
            'Save & replay dates',
            'Extra mini-games',
            'Premium questions'
          ],
          trialDays: 7,
          cta: activeInterval === 'monthly' ? 'Try Free for 7 Days' : 'Try Free for 7 Days'
        }
      ]);
      setLoading(false);
    }

    loadPricing();
  }, [activeInterval]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the plan that works for you
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <button
              onClick={() => setActiveInterval('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeInterval === 'monthly'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setActiveInterval('annual')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeInterval === 'annual'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Annual (Save 33%)
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              isCurrentUser={!!user}
              onSelect={() => {
                if (tier.id === 'free') {
                  // Show free tier info
                } else {
                  // Initiate checkout
                }
              }}
            />
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Questions? We have answers.
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes! Cancel your subscription anytime from your account settings. No hidden fees.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Do I have to pay right now?
              </h3>
              <p className="text-gray-600">
                Nope. Get 7 days free to try Premium. We only charge you after the trial ends.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, Apple Pay, and Google Pay via Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 2.2 Pricing Card Component

**File: `components/pricing/PricingCard.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { createCheckoutSession } from '@/lib/stripe-client';
import TrialBadge from './TrialBadge';

interface PricingCardProps {
  tier: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: string;
    features: string[];
    trialDays: number;
    cta: string;
  };
  isCurrentUser: boolean;
  onSelect: () => void;
}

export default function PricingCard({
  tier,
  isCurrentUser,
  onSelect,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!isCurrentUser) {
      // Redirect to auth or show login
      return;
    }

    setLoading(true);
    try {
      // Initialize checkout session
      // This would call createCheckoutSession from stripe-client.ts
      onSelect();
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPopular = tier.id === 'premium_monthly';
  const isFree = tier.id === 'free';

  return (
    <div
      className={`rounded-xl border-2 transition ${
        isPopular
          ? 'border-pink-500 bg-pink-50 shadow-xl scale-105'
          : 'border-gray-200 bg-white'
      }`}
    >
      {isPopular && (
        <div className="px-4 py-1 bg-pink-500 text-white text-sm font-semibold text-center">
          MOST POPULAR
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {tier.name}
        </h3>
        <p className="text-gray-600 text-sm mb-6">{tier.description}</p>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">
              ${tier.price}
            </span>
            {!isFree && (
              <span className="text-gray-600">
                /{tier.interval}
              </span>
            )}
          </div>
          {tier.trialDays > 0 && (
            <TrialBadge days={tier.trialDays} />
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition mb-8 ${
            isPopular
              ? 'bg-pink-500 text-white hover:bg-pink-600'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Loading...' : tier.cta}
        </button>

        {/* Features */}
        <div className="space-y-4">
          {tier.features.map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 2.3 Trial Badge Component

**File: `components/pricing/TrialBadge.tsx`**

```typescript
export default function TrialBadge({ days }: { days: number }) {
  return (
    <div className="mt-2 inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
      Free {days} days, then charge
    </div>
  );
}
```

---

## Phase 3: Subscription Management (Week 3-4)

### 3.1 User Subscription Status Hook

**File: `lib/hooks/useSubscription.ts`**

```typescript
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { getStripePayments, getCustomerData } from '@/lib/stripe-client';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SubscriptionData {
  isPremium: boolean;
  tier: 'free' | 'premium' | 'ultimate';
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  currentPeriodEnd: Date | null;
  renewalDate: Date | null;
  canceledAt: Date | null;
  trialEndDate: Date | null;
  subscriptionId: string | null;
}

export function useSubscription(): SubscriptionData & { loading: boolean } {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    isPremium: false,
    tier: 'free',
    status: 'canceled',
    currentPeriodEnd: null,
    renewalDate: null,
    canceledAt: null,
    trialEndDate: null,
    subscriptionId: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // Listen to user subscription status in Firestore
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const { subscriptionStatus } = docSnap.data();
        if (subscriptionStatus) {
          setSubscription({
            isPremium: subscriptionStatus.isPremium || false,
            tier: subscriptionStatus.tier || 'free',
            status: subscriptionStatus.status || 'canceled',
            currentPeriodEnd: subscriptionStatus.renewalDate?.toDate() || null,
            renewalDate: subscriptionStatus.renewalDate?.toDate() || null,
            canceledAt: subscriptionStatus.canceledAt?.toDate() || null,
            trialEndDate: subscriptionStatus.trialEndDate?.toDate() || null,
            subscriptionId: subscriptionStatus.subscriptionId || null,
          });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return { ...subscription, loading };
}
```

### 3.2 Feature Gate Hook

**File: `lib/hooks/useFeatureAccess.ts`**

```typescript
import { useSubscription } from './useSubscription';
import { useAuth } from './useAuth';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type FeatureType =
  | 'save_session'
  | 'premium_avatars'
  | 'extra_games'
  | 'premium_questions'
  | 'unlimited_sessions';

export function useFeatureAccess(feature: FeatureType) {
  const { user } = useAuth();
  const { isPremium, tier } = useSubscription();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const purchasedItems = userData?.purchasedItems || {};

        let access = false;

        switch (feature) {
          case 'unlimited_sessions':
            access = isPremium;
            break;
          case 'premium_avatars':
            access = tier === 'ultimate' || purchasedItems['avatar_pack_1'];
            break;
          case 'save_session':
            access = isPremium || purchasedItems['save_session'] > 0;
            break;
          case 'extra_games':
            access = isPremium || purchasedItems['bonus_games'];
            break;
          case 'premium_questions':
            access = isPremium || purchasedItems['premium_questions'];
            break;
        }

        setHasAccess(access);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [user?.uid, isPremium, tier]);

  return { hasAccess, loading };
}
```

### 3.3 Feature Gate Component

**File: `components/FeatureGate.tsx`**

```typescript
import { ReactNode } from 'react';
import { useFeatureAccess } from '@/lib/hooks/useFeatureAccess';

interface FeatureGateProps {
  feature: 'save_session' | 'premium_avatars' | 'extra_games' | 'premium_questions' | 'unlimited_sessions';
  children: ReactNode;
  fallback?: ReactNode;
  onLocked?: () => void;
}

export default function FeatureGate({
  feature,
  children,
  fallback,
  onLocked,
}: FeatureGateProps) {
  const { hasAccess, loading } = useFeatureAccess(feature);

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!hasAccess) {
    if (onLocked) onLocked();
    return fallback || <LockedFeature feature={feature} />;
  }

  return <>{children}</>;
}

function LockedFeature({ feature }: { feature: string }) {
  return (
    <div className="p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg border-2 border-pink-300 text-center">
      <p className="font-semibold text-gray-800 mb-2">
        Premium Feature Locked
      </p>
      <p className="text-sm text-gray-600 mb-4">
        Unlock this feature with Bez Premium
      </p>
      <button className="px-4 py-2 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600">
        Upgrade Now
      </button>
    </div>
  );
}
```

---

## Phase 4: Paywall Modals (Week 4-5)

### 4.1 Save Session Paywall

**File: `components/paywalls/SaveSessionPaywall.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { useFeatureAccess } from '@/lib/hooks/useFeatureAccess';
import Modal from '@/components/Modal';

interface SaveSessionPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  sessionCode: string;
  onSave: () => Promise<void>;
}

export default function SaveSessionPaywall({
  isOpen,
  onClose,
  sessionCode,
  onSave,
}: SaveSessionPaywallProps) {
  const { hasAccess } = useFeatureAccess('save_session');
  const [loading, setLoading] = useState(false);

  if (hasAccess) {
    // User can save, show simple confirmation
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="bg-white rounded-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Save this moment?</h2>
          <p className="text-gray-600 mb-6">
            Replay your favorite date nights anytime.
          </p>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 rounded-lg font-semibold"
            >
              Not now
            </button>
            <button
              onClick={async () => {
                setLoading(true);
                await onSave();
                setLoading(false);
                onClose();
              }}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // User needs to purchase
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-gradient-to-b from-pink-50 to-white rounded-xl p-8 max-w-md">
        <h2 className="text-2xl font-bold mb-2">Save & Replay Dates</h2>
        <p className="text-gray-600 mb-6">
          Keep your favorite date nights forever with Bez Premium.
        </p>

        {/* Feature List */}
        <div className="space-y-3 mb-8 bg-white p-4 rounded-lg border border-pink-200">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Unlimited saves</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Replay anytime</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>+ 4 more features</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-pink-100 rounded-lg p-4 mb-8 text-center">
          <p className="text-sm text-gray-600 mb-1">Bez Premium</p>
          <p className="text-3xl font-bold text-pink-600">
            $4.99<span className="text-lg">/month</span>
          </p>
          <p className="text-xs text-gray-600 mt-2">7 days free, then auto-renews</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button className="w-full py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600">
            Start Free Trial
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-600 font-semibold hover:text-gray-800"
          >
            Maybe later
          </button>
        </div>
      </div>
    </Modal>
  );
}
```

---

## Phase 5: Email Integration (Week 5-6)

### 5.1 Subscription Email Triggers

**File: `functions/src/stripe-webhooks.ts`** (Firebase Cloud Functions)

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { sendEmail } from './email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const db = admin.firestore();

// Webhook handler for Stripe events
export const stripeWebhookHandler = functions
  .https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err}`);
      return;
    }

    try {
      switch (event.type) {
        // User purchases subscription
        case 'customer.subscription.created':
          await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        // Billing issues
        case 'invoice.payment_failed':
          await handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_succeeded':
          await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).send('Webhook processing failed');
    }
  });

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  // Get user from Firebase
  const customerId = subscription.customer as string;
  const userSnap = await db
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (userSnap.empty) return;

  const userId = userSnap.docs[0].id;
  const user = userSnap.docs[0].data();

  // Update Firestore
  await db.collection('users').doc(userId).update({
    subscriptionStatus: {
      isPremium: true,
      tier: 'premium',
      status: subscription.status,
      subscriptionId: subscription.id,
      trialEndDate: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      renewalDate: new Date((subscription.current_period_end || 0) * 1000),
      canceledAt: null,
    },
  });

  // Send welcome email
  await sendEmail({
    to: user.email,
    template: 'subscription_welcome',
    data: {
      name: user.name,
      trialEndDate: new Date((subscription.trial_end || 0) * 1000).toLocaleDateString(),
      price: '$4.99',
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const userSnap = await db
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (userSnap.empty) return;

  const userId = userSnap.docs[0].id;
  const user = userSnap.docs[0].data();

  // Update Firestore
  await db.collection('users').doc(userId).update({
    subscriptionStatus: {
      isPremium: false,
      tier: 'free',
      status: 'canceled',
      canceledAt: new Date(),
      renewalDate: null,
      subscriptionId: null,
    },
  });

  // Send cancellation email
  await sendEmail({
    to: user.email,
    template: 'subscription_canceled',
    data: {
      name: user.name,
      reactivateUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const userSnap = await db
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (userSnap.empty) return;

  const user = userSnap.docs[0].data();

  // Send payment failed email
  await sendEmail({
    to: user.email,
    template: 'payment_failed',
    data: {
      name: user.name,
      amount: (invoice.amount_due / 100).toFixed(2),
      updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing`,
    },
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Optional: Send payment confirmation email
}
```

### 5.2 Email Service

**File: `functions/src/email.ts`**

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  template: string;
  data: Record<string, any>;
}

export async function sendEmail({ to, template, data }: EmailOptions) {
  const templates: Record<string, string> = {
    subscription_welcome: `
      <h1>Welcome to Bez Premium!</h1>
      <p>Hi {{name}},</p>
      <p>Your 7-day free trial is now active.</p>
      <p>Your trial ends on {{trialEndDate}}, then you'll be charged {{price}}/month.</p>
      <p>Enjoy unlimited date nights!</p>
    `,
    subscription_canceled: `
      <h1>We'll miss you!</h1>
      <p>Hi {{name}},</p>
      <p>Your subscription has been canceled.</p>
      <p>Your free account is still active - create dates anytime!</p>
      <p><a href="{{reactivateUrl}}">Ready to resubscribe?</a></p>
    `,
    payment_failed: `
      <h1>Payment Issue</h1>
      <p>Hi {{name}},</p>
      <p>We couldn't process your payment of ${{amount}}.</p>
      <p><a href="{{updatePaymentUrl}}">Update your payment method</a></p>
    `,
  };

  const html = Object.entries(data).reduce((acc, [key, value]) => {
    return acc.replace(`{{${key}}}`, value);
  }, templates[template] || '');

  return resend.emails.send({
    from: 'Bez Rezerwacji <noreply@bezbez.app>',
    to,
    subject: getEmailSubject(template),
    html,
  });
}

function getEmailSubject(template: string): string {
  const subjects: Record<string, string> = {
    subscription_welcome: 'Welcome to Bez Premium!',
    subscription_canceled: 'We miss you - Come back anytime',
    payment_failed: 'Payment Issue - Update Needed',
  };
  return subjects[template] || 'Bez Rezerwacji';
}
```

---

## Phase 6: Analytics & Monitoring (Week 6)

### 6.1 Monetization Metrics Collection

**File: `lib/analytics/monetization.ts`**

```typescript
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

export function trackSubscriptionEvent(event: string, details: any) {
  logEvent(analytics, 'subscription_event', {
    event_type: event,
    ...details,
    timestamp: new Date().toISOString(),
  });
}

export function trackPaymentStart(priceId: string, tierId: string) {
  logEvent(analytics, 'payment_start', {
    price_id: priceId,
    tier_id: tierId,
  });
}

export function trackPaymentSuccess(priceId: string, amount: number) {
  logEvent(analytics, 'payment_success', {
    price_id: priceId,
    amount,
    currency: 'usd',
  });
}

export function trackPaymentFailed(priceId: string, error: string) {
  logEvent(analytics, 'payment_failed', {
    price_id: priceId,
    error,
  });
}

export function trackIAPPurchase(itemId: string, price: number) {
  logEvent(analytics, 'iap_purchase', {
    item_id: itemId,
    price,
    currency: 'usd',
  });
}

export function trackPaywallViewed(paywall: string, trigger: string) {
  logEvent(analytics, 'paywall_viewed', {
    paywall_type: paywall,
    trigger,
  });
}

export function trackPaywallClosed(paywall: string, action: 'purchased' | 'canceled') {
  logEvent(analytics, 'paywall_closed', {
    paywall_type: paywall,
    action,
  });
}
```

### 6.2 Create Monetization Dashboard (Google Data Studio)

**Setup Steps:**
1. Connect Firebase Analytics to Google Data Studio
2. Create custom dashboards for:
   - Daily revenue
   - Conversion funnel
   - Customer acquisition cost
   - Churn rate
   - ARPU trends

**Key Queries:**
```sql
-- Daily revenue
SELECT
  DATE(event_timestamp) as date,
  SUM(CAST(event_params[0].value.int_value AS INT64)) as revenue
FROM `project.analytics_events`
WHERE event_name = 'payment_success'
GROUP BY date
ORDER BY date DESC

-- Conversion funnel
SELECT
  'Session Created' as stage,
  COUNT(DISTINCT user_id) as count
FROM `project.analytics_events`
WHERE event_name = 'session_created'
UNION ALL
SELECT
  'Paywall Viewed' as stage,
  COUNT(DISTINCT user_id) as count
FROM `project.analytics_events`
WHERE event_name = 'paywall_viewed'
UNION ALL
SELECT
  'Subscription Purchased' as stage,
  COUNT(DISTINCT user_id) as count
FROM `project.analytics_events`
WHERE event_name = 'payment_success'
```

---

## Testing Checklist

### Stripe Integration Tests

```typescript
describe('Stripe Integration', () => {
  test('should create subscription with trial', async () => {
    // Test creating checkout session
  });

  test('should handle subscription webhook', async () => {
    // Test webhook processing
  });

  test('should update user subscription status', async () => {
    // Test Firestore update
  });

  test('should send confirmation email', async () => {
    // Test email delivery
  });

  test('should handle payment failure gracefully', async () => {
    // Test error handling
  });
});
```

### Paywall Tests

```typescript
describe('Paywalls', () => {
  test('should show paywall for non-premium users', () => {
    // Test feature gate
  });

  test('should hide paywall for premium users', () => {
    // Test premium access
  });

  test('should track paywall metrics', () => {
    // Test analytics
  });
});
```

---

## Deployment Checklist

- [ ] Stripe secret key in production env variables
- [ ] Firebase Blaze plan enabled
- [ ] Cloud Functions deployed
- [ ] Webhook endpoints configured in Stripe dashboard
- [ ] Email service (Resend) set up
- [ ] Analytics dashboard created
- [ ] Error monitoring (Sentry) configured
- [ ] Pricing page live and tested
- [ ] Payment flow tested with real cards
- [ ] Customer support email created
- [ ] Documentation updated
- [ ] Monitoring alerts set up

---

## Quick Reference: Common Tasks

### Add New IAP Item
1. Create document in Firestore
2. Update UI to show in-app store
3. Create purchase handler
4. Add feature gate if needed

### Change Pricing
1. Update Stripe product in dashboard
2. Update pricing page component
3. Update marketing materials
4. Announce change to users

### Handle Subscription Cancellation
1. Webhook triggers automatically
2. Firestore updated via Cloud Function
3. Email sent to user
4. Feature gates automatically restrict access

### Refund a Charge
```typescript
// In Cloud Function
await stripe.refunds.create({
  charge: chargeId,
  amount: refundAmount, // in cents
});
```

---

**Next Steps:**
1. Set up Stripe account with test keys
2. Create Firestore collections
3. Deploy basic pricing page
4. Test end-to-end payment flow
5. Gather user feedback on pricing
6. Adjust and iterate based on metrics
