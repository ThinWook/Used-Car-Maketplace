const paymentService = require('../services/paymentService');

const paymentController = {
  // Create payment intent
  createPaymentIntent: async (req, res) => {
    try {
      const { vehicleId } = req.body;
      const paymentIntent = await paymentService.createPaymentIntent(vehicleId, req.user._id);
      res.json(paymentIntent);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Handle successful payment
  handlePaymentSuccess: async (req, res) => {
    try {
      const payment = await paymentService.handlePaymentSuccess(req.body);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get user payments
  getUserPayments: async (req, res) => {
    try {
      const { role } = req.query;
      const payments = await paymentService.getPaymentsByUser(req.user._id, role);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Refund payment
  refundPayment: async (req, res) => {
    try {
      const refund = await paymentService.refundPayment(req.params.id);
      res.json(refund);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Handle Stripe webhook
  handleWebhook: async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await paymentService.handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        // Handle failed payment
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
};

module.exports = paymentController; 