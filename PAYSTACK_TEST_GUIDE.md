# Paystack Integration Testing Guide

This guide walks you through setting up and testing the Paystack payment integration for paid courses.

## Prerequisites

1. Paystack Account: Create one at [https://paystack.com](https://paystack.com)
2. Test Keys: Get your test API keys from Paystack Dashboard > Settings > API Keys
3. Novr Academy Admin Access: You need admin credentials to create courses

## Step 1: Configure Environment Variables

### Getting Your Paystack Keys

1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to **Settings > API Keys & Webhooks**
3. Copy the following keys in **Test mode**:
   - **Secret Key** (starts with `sk_test_`)
   - **Public Key** (starts with `pk_test_`)

### Update .env File

Update your `.env` file in the project root:

```env
# Backend API (used for payment processing)
PAYSTACK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Frontend (client-side public key)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_YOUR_PUBLIC_KEY_HERE
```

> **Note:** Replace `YOUR_SECRET_KEY_HERE` and `YOUR_PUBLIC_KEY_HERE` with your actual keys from Paystack.

### Verify Configuration

After updating `.env`, restart your development server:

```bash
npm run dev  # Or yarn dev
```

You should see no warnings about Paystack not being configured.

## Step 2: Create a Test Course with Paid Pricing

### Via Admin Dashboard

1. Go to **Admin Dashboard** → **Courses**
2. Click **New Course**
3. Fill in the course details:
   - **Title**: `Paystack Test Course` (or any name)
   - **Description**: `Test course for Paystack payment integration`
   - **Price**: Enter `5000` (₦5,000 in test mode)
   - **Currency**: Select `NGN`
   - **Pass Mark %**: `70` (default)
   - **Default Validity**: `365` (optional, or leave blank for lifetime)
4. Click **Create course**
5. On the course detail page, click the **Status** dropdown and change from `DRAFT` to `PUBLISHED`

### Via API (Alternative)

```bash
curl -X POST http://localhost:4000/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Paystack Test Course",
    "description": "Test course for Paystack payment integration",
    "priceCents": 500000,
    "currency": "NGN",
    "passMarkPct": 70,
    "status": "PUBLISHED"
  }'
```

## Step 3: Test the Paystack Checkout Flow

### Step 3a: Navigate to Course

1. Go to your learner dashboard: `http://localhost:3000/dashboard/learn`
2. Find your "Paystack Test Course"
3. Click on the course title to open course details
4. You should see the **Enroll** section with two payment options:
   - Pay with card (Stripe)
   - Pay with Paystack

### Step 3b: Initiate Paystack Checkout

1. Click **Pay with Paystack** button
2. You should be redirected to Paystack's payment form (in test mode)
3. The page should show a Paystack checkout interface

### Step 3c: Complete Test Payment

Use one of Paystack's test card credentials:

**Test Card Details:**
- **Card Number**: `4111 1111 1111 1111`
- **Expiry**: Any future date (e.g., `12/25`)
- **CVV**: Any 3 digits (e.g., `123`)
- **OTP**: `123456` (if prompted)

After entering the card details:
1. Click **Pay** to complete the transaction
2. You'll see a success message
3. Paystack will redirect you back to: `http://localhost:3000/dashboard/learn/{courseId}?checkout=success`

### Step 3d: Verify Enrollment

After successful payment:
1. You should be automatically enrolled in the course
2. Check your course progress page - it should show enrolled status
3. You should receive an enrollment confirmation email

## Step 4: Verify Payment Data in Database

Check that the payment was recorded correctly:

```sql
-- View payment records
SELECT id, userId, courseId, amountCents, currency, provider, status, providerRef, createdAt
FROM "Payment"
ORDER BY createdAt DESC
LIMIT 5;

-- View enrollment records
SELECT id, userId, courseId, source, status, enrolledAt, expiresAt
FROM "Enrollment"
WHERE source = 'SELF_PAID'
ORDER BY enrolledAt DESC
LIMIT 5;
```

## Step 5: Test Webhook Handling

The webhook handler is automatically invoked by Paystack when payment succeeds.

### Monitor Webhook in Logs

Watch your terminal output for webhook events:

```
POST /webhooks/paystack 200 - 45.2ms
Paystack webhook received: charge.success
```

### Test Webhook Manually (Optional)

If the webhook doesn't trigger automatically, you can test it from Paystack Dashboard:

1. Go to **Settings > API Keys & Webhooks**
2. Scroll to **Test Webhooks**
3. Select event: `charge.success`
4. Click **Send Test Event**

Your backend should log: `Webhook verified successfully`

## Step 6: Test Edge Cases

### Test 1: Free Course vs Paid Course

1. Create another course with price: `0`
2. Go to the course - it should show **Enroll for free** button instead of payment options
3. Click the button - you should be enrolled immediately without payment

### Test 2: Already Enrolled

1. Go back to the paid course you just paid for
2. Instead of enroll button, you should see the **lesson list** and progress tracker
3. Verify you're listed in the course enrollments

### Test 3: Checkout Cancellation

1. Click **Pay with Paystack** on a different test course
2. On the Paystack payment form, click **Cancel** or close the page
3. You should be redirected to: `http://localhost:3000/dashboard/learn/{courseId}?checkout=cancelled`
4. The payment should still exist in the database with status `PENDING`
5. Your enrollment should NOT be created

### Test 4: Invalid Configuration

1. Temporarily set `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` to an empty string or remove it
2. Go to a paid course
3. The **Pay with Paystack** button should be disabled with message: "Paystack is not configured"

## Step 7: Production Deployment

### Before Going Live

1. **Switch to Live Keys**: Replace test keys with live keys from Paystack
   - `sk_live_xxxxx` (Secret Key)
   - `pk_live_xxxxx` (Public Key)

2. **Update Environment Variables**:
   ```env
   PAYSTACK_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_YOUR_LIVE_PUBLIC_KEY
   ```

3. **Update Webhook URL**: Add your production webhook URL to Paystack Dashboard
   ```
   https://yourdomain.com/api/webhooks/paystack
   ```

4. **Set Production Callback URL**: In your deployment environment, update:
   ```env
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

5. **Test with Live Payment**: Make a small test payment (₦1-10) to verify the entire flow

## Troubleshooting

### Issue: Paystack button is disabled

**Solution**: Check that `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is set in `.env` and restart your dev server.

### Issue: Redirect to Paystack fails

**Cause**: `PAYSTACK_SECRET_KEY` might be incorrect or missing from the backend.

**Solution**: 
- Verify the key in `.env`
- Check that the key starts with `sk_test_` (test mode) or `sk_live_` (production)
- Restart your backend API server

### Issue: Payment succeeded but enrollment not created

**Cause**: Webhook signature verification failed or webhook didn't fire.

**Solution**:
1. Check backend logs for webhook errors
2. Manually verify the payment in Paystack Dashboard
3. Contact Paystack support if webhook isn't being delivered

### Issue: "Invalid redirect_uri" error

**Cause**: Your callback URL doesn't match what's registered in Paystack.

**Solution**:
- Verify `NEXT_PUBLIC_APP_URL` matches the domain you're testing on
- Make sure Paystack settings have the correct webhook URL registered

## API Endpoints Reference

### Enrollment Endpoints

```bash
# Create free enrollment
POST /courses/:courseId/enroll/free

# Start paid checkout
POST /courses/:courseId/enroll/checkout
{
  "provider": "PAYSTACK"
}

# Response
{
  "checkoutUrl": "https://checkout.paystack.com/xxx"
}
```

### Webhook Endpoints

```bash
# Paystack webhook (POST)
POST /api/webhooks/paystack
X-Paystack-Signature: {hmac-sha512-hash}

# Expected payload
{
  "event": "charge.success",
  "data": {
    "reference": "{paymentId}",
    "status": "success"
  }
}
```

## Next Steps

- [Paystack API Documentation](https://paystack.com/docs/api/)
- [Configure Platnova Integration](./PLATNOVA_INTEGRATION.md) (when ready)
- [Payment Troubleshooting Guide](./docs/PAYMENT_TROUBLESHOOTING.md)

## Support

For Paystack-specific issues: [Paystack Support](https://support.paystack.com)

For Novr Academy issues: Contact your development team
