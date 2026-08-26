# Paystack Payment Error Handling Guide

This document outlines how Novr Academy handles payment errors and failures throughout the Paystack integration.

## Error Handling Architecture

### 1. Payment Initialization Errors

**Location**: `routes/enrollments.ts` → `/courses/:courseId/enroll/checkout`

When a user initiates checkout, the system may encounter several errors:

#### Configuration Errors (503 Service Unavailable)
```
Error: "Paystack is not configured"
Cause: PAYSTACK_SECRET_KEY not set in environment
Solution: Configure Paystack credentials in .env
```

#### Network Errors (503 Service Unavailable)
```
Error: "Paystack payment initialization failed"
Cause: Network timeout, API unreachable, or Paystack service down
Solution: User is asked to retry; payment marked as FAILED in DB
Action: Logs include full error context for debugging
```

#### Validation Errors (400 Bad Request)
```
Error: "Invalid request parameters"
Cause: Missing or invalid provider parameter
Solution: Frontend validation prevents this
```

#### Course Errors (404 Not Found)
```
Error: "Course not found"
Cause: Course ID doesn't exist or has been deleted
Solution: User redirected to course list
```

#### Pricing Errors (400 Bad Request)
```
Error: "This course is free — use /enroll/free instead"
Cause: Attempted paid checkout on free course
Solution: Frontend prevents this; if it happens, user is redirected
```

### 2. Webhook Processing Errors

**Location**: `routes/webhooks.ts` → `POST /webhooks/paystack`

When Paystack sends a payment webhook:

#### Signature Verification Failures (401 Unauthorized)
```
Cause: Invalid X-Paystack-Signature header
  - Missing header
  - Wrong secret key
  - Tampered payload
Solution: Request rejected; Paystack will retry
Logging: Detailed logs explain exact reason for rejection
```

#### Payment Not Found Errors (Logged but acknowledged)
```
Cause: Webhook received before payment record was created in DB
  - Network latency
  - Race condition
Solution: Webhook acknowledged (200 OK); payment still exists in Paystack
  - Paystack will retry webhook if needed
  - Payment manually marked as FAILED after investigation
```

#### Enrollment Activation Errors (Logged and handled)
```
Causes:
  - User already enrolled in course
  - Database connection issue
  - Email queue failure
  
Action Taken:
  1. Payment status updated to SUCCEEDED (payment was confirmed by Paystack)
  2. Enrollment activation attempt made
  3. If enrollment fails, payment marked as FAILED
  4. Error details logged for manual investigation
  5. Request still returns 200 OK to acknowledge receipt
```

## Error Recovery Procedures

### Scenario 1: "Paystack transaction initialization failed"

**When This Happens**:
- User clicks "Pay with Paystack"
- Paystack API returns error (e.g., invalid email, rate limited, service down)
- Payment marked as FAILED in database

**What Happens Next**:
1. User sees error message with instruction to retry
2. Payment record exists with `status: FAILED`
3. User can retry checkout again
4. New payment record created on retry attempt

**For Developers**:
```sql
-- Find failed payment attempts
SELECT id, userId, courseId, amountCents, provider, status, createdAt
FROM "Payment"
WHERE status = 'FAILED'
  AND provider = 'PAYSTACK'
ORDER BY createdAt DESC
LIMIT 20;
```

### Scenario 2: "Webhook signature verification failed"

**When This Happens**:
- Paystack sends webhook with invalid signature
- Could indicate:
  - Wrong secret key configured
  - Payload tampering (extremely rare)
  - Misconfiguration

**What Happens Next**:
1. Webhook rejected (401 response)
2. Paystack retries webhook delivery
3. Logs contain detailed error information
4. Payment remains in PENDING status until valid webhook received

**For Developers**:
Check logs for:
```
[Paystack] Webhook signature verification failed: [reason]
```

Verify configuration:
```bash
# Check that PAYSTACK_SECRET_KEY is set correctly
echo $PAYSTACK_SECRET_KEY  # Should start with sk_test_ or sk_live_
```

### Scenario 3: "Enrollment activated but failed"

**When This Happens**:
- Payment confirmed by Paystack (charge.success received)
- Webhook signature verified ✓
- Payment status changed to SUCCEEDED ✓
- But enrollment creation fails

**What Happens Next**:
1. Payment status marked as FAILED (to track the issue)
2. Error details logged with full context
3. Webhook returns 200 OK (acknowledges receipt)
4. Payment appears in FAILED list for admin review
5. User sees success page but may not be enrolled

**Recovery**:
1. Admin reviews failed payment in database:
   ```sql
   SELECT id, userId, courseId, status, createdAt 
   FROM "Payment"
   WHERE status = 'FAILED' AND provider = 'PAYSTACK';
   ```

2. Manually create enrollment if payment was confirmed:
   ```sql
   INSERT INTO "Enrollment" 
   (id, userId, courseId, source, status, enrolledAt, paymentId)
   VALUES (
     'enrollment_id',
     'user_id',
     'course_id',
     'SELF_PAID',
     'ACTIVE',
     NOW(),
     'payment_id'
   );
   ```

3. Or use enrollment API:
   ```bash
   POST /courses/:courseId/enroll/assign
   {
     "email": "user@example.com",
     "validityDays": 365
   }
   ```

## Error Logging

All payment-related errors are logged with the prefix `[Paystack]` or `[Enrollment]` for easy filtering.

### View Logs in Development

```bash
# Watch real-time logs
npm run dev 2>&1 | grep "\[Paystack\]\|\[Enrollment\]"

# Find specific errors
npm run dev 2>&1 | grep "error\|Error\|failed\|Failed"
```

### Log Entry Format

Each log includes:
- Timestamp
- Component (`[Paystack]`, `[Enrollment]`, etc.)
- Action
- Context (IDs, amounts, providers)
- Error details (if applicable)

**Example**:
```
[Paystack] Initializing transaction for user@example.com - 5000 NGN
[Paystack] Transaction initialized successfully
{ reference: 'payment_12345', accessCode: 'aaaa1111' }
```

**Error Example**:
```
[Paystack] Network error initializing transaction: ECONNREFUSED
PaystackError: Network error: ECONNREFUSED
code: PAYSTACK_NETWORK_ERROR
statusCode: 503
```

## Monitoring Checklist

### Daily Checks
- [ ] Review failed payments: `Payment.status = 'FAILED'`
- [ ] Check pending payments older than 1 hour: investigate if no webhook received
- [ ] Verify webhook delivery status in Paystack Dashboard

### Weekly Checks
- [ ] Payment success rate (succeeded / total)
- [ ] Average time from payment to enrollment
- [ ] Error frequency by type (network, config, validation)

### Deployment Checks
Before deploying to production:
- [ ] `PAYSTACK_SECRET_KEY` uses live key (sk_live_)
- [ ] `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` uses live key (pk_live_)
- [ ] Webhook URL registered in Paystack Dashboard points to production
- [ ] Error monitoring (Sentry, DataDog, etc.) configured
- [ ] Notification system alerts on failed payments

## Handling Payment Disputes

If a user reports non-receipt of enrollment after successful payment:

1. **Find the payment**:
   ```sql
   SELECT p.*, e.id as enrollmentId
   FROM "Payment" p
   LEFT JOIN "Enrollment" e ON p.id = e.paymentId
   WHERE p.userId = 'user_id'
   ORDER BY p.createdAt DESC
   LIMIT 5;
   ```

2. **Check payment status**:
   - `SUCCEEDED`: Payment confirmed by Paystack but enrollment missing
   - `PENDING`: Payment not confirmed; check Paystack Dashboard
   - `FAILED`: Payment failed; offer refund or retry

3. **Check Paystack Dashboard**:
   - Go to Transactions
   - Search by reference (payment ID)
   - Verify charge status and payout status

4. **Create enrollment manually if needed**:
   ```sql
   INSERT INTO "Enrollment" (...)
   VALUES (...);
   ```

5. **Notify user**:
   - Send enrollment confirmation email
   - Provide course access link

## Production Debugging

### Enable Verbose Logging

Set environment variable:
```bash
DEBUG=*  # For all logs
DEBUG=*paystack*  # For Paystack logs only
```

### Monitor Webhook Delivery

In Paystack Dashboard:
1. Go to **Settings > API Keys & Webhooks**
2. Scroll to **Webhook Test History**
3. Review recent deliveries
4. Check response codes and payloads

### Check Database Consistency

```sql
-- Find orphaned payments (no matching user)
SELECT * FROM "Payment"
WHERE userId NOT IN (SELECT id FROM "User");

-- Find orphaned enrollments (no matching payment)
SELECT * FROM "Enrollment"
WHERE paymentId IS NOT NULL
  AND paymentId NOT IN (SELECT id FROM "Payment");

-- Find pending payments older than 1 hour
SELECT * FROM "Payment"
WHERE status = 'PENDING'
  AND createdAt < NOW() - INTERVAL '1 hour'
ORDER BY createdAt ASC;
```

## Support Resources

- **Paystack Webhook Docs**: https://paystack.com/docs/payments/webhooks/
- **Paystack API Errors**: https://paystack.com/docs/api/
- **Paystack Support**: https://support.paystack.com

## Contact

For issues with Paystack integration:
1. Check this guide and logs
2. Review Paystack Dashboard webhook status
3. Contact your development team
4. If production issue, escalate to Paystack support with reference ID
