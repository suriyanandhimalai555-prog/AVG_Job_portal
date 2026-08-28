import Razorpay from 'razorpay';
import crypto from 'crypto';

const getPlanPrice = (plan, billingCycle) => {
    const prices = {
        Starter: { monthly: 299, yearly: 2868 },
        Growth: { monthly: 799, yearly: 7668 },
        Scale: { monthly: 1499, yearly: 14388 }
    };
    return prices[plan]?.[billingCycle] || 0;
};

export const createRazorpayOrder = async (req, res) => {
    try {
        const { plan, billingCycle } = req.body;
        const amount = getPlanPrice(plan, billingCycle);

        if (!amount) return res.status(400).json({ success: false, error: 'Invalid plan selected' });

        const key_id = process.env.RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        if (!key_id || !key_secret) {
            return res.status(500).json({ success: false, error: 'Razorpay keys are missing in backend .env file' });
        }

        const razorpay = new Razorpay({
            key_id: key_id.trim(),
            key_secret: key_secret.trim()
        });

        const options = {
            amount: amount * 100,
            currency: "AED",
            receipt: `receipt_order_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json({ success: true, order, key_id: key_id.trim() });

    } catch (error) {
        console.error('❌ Error creating Razorpay order:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Razorpay API rejected the request. Check your API keys.'
        });
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, billingCycle } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET.trim())
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            res.status(200).json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, error: 'Payment verification failed: Invalid signature' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ success: false, error: 'Internal server error verifying payment' });
    }
};

export const handleSubscription = async (req, res) => {
    try {
        const { plan, billingCycle } = req.body;
        res.status(200).json({ success: true, message: `Successfully subscribed to ${plan} (${billingCycle})` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process subscription' });
    }
};