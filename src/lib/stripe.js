import Stripe from "stripe";

let stripeInstance;

export const getStripe = () => {
	if (!stripeInstance) {
		if (!process.env.STRIPE_SECRET_KEY) {
			throw new Error("STRIPE_SECRET_KEY is not set");
		}
		stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
	}
	return stripeInstance;
};
