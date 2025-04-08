const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Vehicle = require('../models/Vehicle');

class PaymentService {
  async createPaymentIntent(vehicleId, userId) {
    try {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: vehicle.price * 100, // Convert to cents
        currency: 'usd',
        metadata: {
          vehicleId,
          userId,
          vehicleOwnerId: vehicle.user.toString()
        }
      });

      return paymentIntent;
    } catch (error) {
      throw error;
    }
  }

  async handlePaymentSuccess(paymentIntent) {
    try {
      const { vehicleId, userId, vehicleOwnerId } = paymentIntent.metadata;

      const payment = new Payment({
        buyer: userId,
        user: vehicleOwnerId,
        vehicle: vehicleId,
        amount: paymentIntent.amount / 100,
        status: 'completed',
        paymentMethod: paymentIntent.payment_method_types[0],
        transactionId: paymentIntent.id
      });

      await payment.save();

      // Update vehicle status
      await Vehicle.findByIdAndUpdate(vehicleId, { status: 'sold' });

      return payment;
    } catch (error) {
      throw error;
    }
  }

  async getPaymentsByUser(userId, role) {
    try {
      const query = userId ? (role === 'buyer' ? { buyer: userId } : { user: userId }) : {};
      return await Payment.find(query)
        .populate('vehicle', 'make model price')
        .populate(['buyer', 'user'], 'full_name email phone_number avatar_url')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  async refundPayment(paymentId) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      const refund = await stripe.refunds.create({
        payment_intent: payment.transactionId
      });

      payment.status = 'refunded';
      await payment.save();

      // Update vehicle status back to available
      await Vehicle.findByIdAndUpdate(payment.vehicle, { status: 'available' });

      return refund;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PaymentService(); 