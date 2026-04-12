import { getStripe } from "../lib/stripe.js";


import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";




export const handleStripeWebhook = async (req, res) => {
	const stripe = getStripe();
	const sig = req.headers["stripe-signature"];

	let event;
	try {
		event = stripe.webhooks.constructEvent(
			req.body,
			sig,
			process.env.STRIPE_WEBHOOK_SECRET
		);
	} catch (err) {
		console.error("Webhook signature verification failed:", err.message);
		return res.status(400).send(`Webhook Error: ${err.message}`);
	}

	try {
		if (event.type === "checkout.session.completed") {
			const session = event.data.object;

			// prevent duplicates (idempotent)
			const existingOrder = await Order.findOne({
				stripeSessionId: session.id,
			});
			if (existingOrder) {
				return res.json({ received: true });
			}

			const products = JSON.parse(session.metadata.products);

			const order = await Order.create({
				user: session.metadata.userId,
				products: products.map((p) => ({
					product: p.id,
					quantity: p.quantity,
					price: p.price,
				})),
				totalAmount: session.amount_total / 100,
				stripeSessionId: session.id,
			});

			if (session.metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{
						code: session.metadata.couponCode,
						userId: session.metadata.userId,
					},
					{ isActive: false }
				);
			}

			console.log("Order created via webhook:", order._id);
		}

		res.json({ received: true });
	} catch (error) {
		console.error("Webhook handler error:", error);
		res.status(500).json({ error: "Webhook handler failed" });
	}
};
