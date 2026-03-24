const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const emailService = require('../services/email');
const { auth } = require('../middleware/auth');

// POST /api/subscriptions/create-checkout - Create Stripe Checkout session
router.post('/create-checkout', auth, async (req, res) => {
  try {
    const { plan } = req.body; // 'monthly' or 'yearly'

    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan. Must be monthly or yearly.' });
    }

    // Get or create Stripe customer
    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: { userId: req.user._id.toString() }
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(req.user._id, { stripeCustomerId: customerId });
    }

    const priceId = plan === 'monthly'
      ? process.env.STRIPE_PRICE_MONTHLY
      : process.env.STRIPE_PRICE_YEARLY;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?subscription=cancelled`,
      metadata: {
        userId: req.user._id.toString(),
        plan
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/subscriptions/webhook - Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const plan = session.metadata.plan;

        // Get subscription details from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);

        // Create/update subscription record
        const subscription = new Subscription({
          user: userId,
          plan,
          status: 'active',
          stripeSubscriptionId: stripeSubscription.id,
          stripePriceId: stripeSubscription.items.data[0].price.id,
          amount: stripeSubscription.items.data[0].price.unit_amount,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
        });

        // Calculate charity contribution
        const user = await User.findById(userId);
        if (user) {
          subscription.charityContribution = Math.round(subscription.amount * (user.charityPercentage / 100));
          subscription.prizePoolContribution = Math.round(subscription.amount * 0.3);
          
          user.subscriptionStatus = 'active';
          await user.save();

          emailService.sendSubscriptionConfirmed(user, plan).catch(console.error);
        }

        await subscription.save();
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const subscription = await Subscription.findOne({ stripeSubscriptionId: sub.id });
        if (subscription) {
          subscription.status = sub.status === 'active' ? 'active' : sub.status;
          subscription.currentPeriodStart = new Date(sub.current_period_start * 1000);
          subscription.currentPeriodEnd = new Date(sub.current_period_end * 1000);
          await subscription.save();

          // Update user status
          await User.findByIdAndUpdate(subscription.user, {
            subscriptionStatus: subscription.status
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const subscription = await Subscription.findOne({ stripeSubscriptionId: sub.id });
        if (subscription) {
          subscription.status = 'cancelled';
          subscription.cancelledAt = new Date();
          await subscription.save();

          await User.findByIdAndUpdate(subscription.user, {
            subscriptionStatus: 'cancelled'
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const sub = await Subscription.findOne({ stripeSubscriptionId: invoice.subscription });
        if (sub) {
          sub.status = 'past_due';
          await sub.save();
          await User.findByIdAndUpdate(sub.user, { subscriptionStatus: 'past_due' });
        }
        break;
      }
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
  }

  res.json({ received: true });
});

// GET /api/subscriptions/status - Get current subscription
router.get('/status', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: { $in: ['active', 'past_due', 'trialing'] }
    });

    res.json({
      hasSubscription: !!subscription,
      subscription: subscription || null,
      subscriptionStatus: req.user.subscriptionStatus
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/subscriptions/cancel - Cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel at period end in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    await User.findByIdAndUpdate(req.user._id, { subscriptionStatus: 'cancelled' });

    res.json({ message: 'Subscription cancelled', subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
