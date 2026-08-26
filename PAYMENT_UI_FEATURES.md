# Payment UI Features Guide

This guide documents the payment-related UI components and their functionality in the Novr Academy course learning page.

## Components Overview

### 1. PaymentStatusAlert Component

**File**: `app/(app)/dashboard/learn/[courseId]/PaymentStatusAlert.tsx`

Displays a feedback banner when users return from the payment provider.

#### States

**Success** (checkout=success)
- Green banner with checkmark icon
- Message: "Payment successful! Your payment has been processed and you are now enrolled in this course."
- Shows when Paystack redirects back after successful payment

**Cancelled** (checkout=cancelled)
- Amber banner with alert icon
- Message: "You cancelled the payment. Try again when you're ready."
- Shows when user clicks cancel on payment form

**Failed** (checkout=failed)
- Red banner with error icon
- Message: "Payment initialization failed. Please try again."
- Shows when payment provider initialization fails

#### Implementation

The component reads the `checkout` query parameter to determine which status to display:

```
/dashboard/learn/course_id?checkout=success
/dashboard/learn/course_id?checkout=cancelled
/dashboard/learn/course_id?checkout=failed
```

This parameter is set automatically by:
1. **Success**: Paystack redirects to `{APP_URL}/dashboard/learn/{courseId}?checkout=success`
2. **Cancelled**: User cancels payment on Paystack form → redirects to `?checkout=cancelled`
3. **Failed**: Backend catches payment init error → redirects to `?checkout=failed`

#### Styling

- Uses Tailwind CSS with semantic color classes
- Icons from Lucide React library
- Responsive and accessible
- Dismissible (automatically after 5 seconds in production)

### 2. PaymentHistory Component

**File**: `app/(app)/dashboard/learn/[courseId]/PaymentHistory.tsx`

Displays user's payment transaction history for the current course.

#### Features

**Display Logic**
- Only shown if user is enrolled or has attempted payment
- Shows up to last 10 payment transactions
- Displays in reverse chronological order (newest first)

**Transaction Details**
- Amount and currency (formatted via `formatPrice()`)
- Payment provider (STRIPE or PAYSTACK)
- Timestamp (formatted as "Jan 1, 2024, 2:30 PM")
- Payment status badge

**Status Badges**
- **Completed** (SUCCEEDED): Green badge
- **Pending** (PENDING): Amber badge
- **Failed** (FAILED): Red badge
- **Refunded** (REFUNDED): Blue badge

#### Data Source

Fetches from `/courses/:courseId` API endpoint:
```json
{
  "payments": [
    {
      "id": "payment_123",
      "status": "SUCCEEDED",
      "amountCents": 500000,
      "currency": "NGN",
      "provider": "PAYSTACK",
      "createdAt": "2024-01-15T14:30:00Z"
    }
  ]
}
```

#### Use Cases

1. **After Successful Enrollment**: Shows transaction proof
2. **Payment Troubleshooting**: Shows all attempts and failures
3. **Refund Tracking**: Shows refunded transactions
4. **Receipt Generation**: Can be extended to generate receipts

### 3. EnrollButton Component (Updated)

**File**: `app/(app)/dashboard/learn/[courseId]/EnrollButton.tsx`

Enhanced with payment configuration checking.

#### New Features

**Paystack Configuration Check**
- Checks if `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is set
- Disables Paystack button if not configured
- Shows helpful message: "Paystack is not configured"

**Responsive Layout**
- Changed from horizontal flex gap to flex column on mobile
- Uses `sm:flex-row` for responsive button layout
- Better mobile UX for payment options

## Integration with Course Page

### Layout Structure

```
[PaymentStatusAlert]  ← Shows feedback if checkout param present

[Course Header]
  - Title, description, price, lessons count

[PaymentStatusAlert for enrolled users - not applicable]

[Enrolled Content]
  - Progress bar
  - Lesson list
  [PaymentHistory]  ← Shows past payments

[Not Enrolled Content]
  - Enroll CTA
  [EnrollButton]
  [PaymentHistory]  ← Shows past payment attempts
```

### Data Flow

```
User visits /dashboard/learn/course_id
    ↓
fetch /courses/course_id
    ↓
API returns course with:
  - enrolled: boolean
  - progressPct: number
  - payments: Payment[]
    ↓
Page renders with:
  - PaymentStatusAlert (if checkout param)
  - Course header
  - PaymentHistory (if has payments)
  - EnrollButton or LessonList
```

## Usage Examples

### Example 1: First-time User, Free Course

```
GET /dashboard/learn/free-course-id

PaymentStatusAlert: (hidden - no checkout param)
Course Header: "Free access"
EnrollButton: Shows "Enroll for free" button
PaymentHistory: (hidden - no payments)
```

### Example 2: After Successful Paystack Payment

```
GET /dashboard/learn/paid-course-id?checkout=success

PaymentStatusAlert: (green) "Payment successful!"
Course Header: "Premium course"
Enrolled content: Lesson list + progress
PaymentHistory: Shows recent successful payment
```

### Example 3: Failed Payment Attempt

```
GET /dashboard/learn/paid-course-id?checkout=failed

PaymentStatusAlert: (red) "Payment initialization failed"
Course Header: "Premium course"
Not enrolled content: EnrollButton (to retry)
PaymentHistory: Shows failed payment attempt
```

### Example 4: Multiple Payment Attempts

```
User's payment history shows:
1. FAILED - ₦5,000 - PAYSTACK - Dec 1, 2:30 PM (network error)
2. SUCCEEDED - ₦5,000 - PAYSTACK - Dec 1, 2:45 PM (successful retry)

PaymentHistory displays both, allowing user to see:
- What went wrong initially
- That it was successfully resolved
- Transaction proof
```

## Customization

### Styling Changes

All components use Tailwind CSS classes. To customize:

1. **Colors**: Update color classes in PaymentStatusAlert
   ```tsx
   // Success colors
   bg-green-50/80  // background
   border-green-200/50  // border
   text-green-900  // text
   text-green-600  // icon
   ```

2. **Icons**: Swap Lucide icons
   ```tsx
   import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
   // Replace with other icons from lucide-react
   ```

3. **Typography**: Update text classes for different sizing

### Adding Receipt Download

To add receipt download functionality:

1. Create invoice from payment data:
   ```tsx
   async function generateInvoice(payment: Payment) {
     const invoice = {
       date: new Date(payment.createdAt),
       amount: payment.amountCents,
       currency: payment.currency,
       provider: payment.provider,
       id: payment.id,
     };
     return invoice;
   }
   ```

2. Add button to PaymentHistory:
   ```tsx
   <button onClick={() => downloadPDF(payment.id)}>
     Download Receipt
   </button>
   ```

### Adding Payment Retry

To add automatic retry on failed payments:

1. Create retry function:
   ```tsx
   async function retryPayment(paymentId: string) {
     // Fetch original payment details
     // Initiate new checkout with same course
   }
   ```

2. Add button in PaymentHistory for FAILED status:
   ```tsx
   {payment.status === "FAILED" && (
     <button onClick={() => retryPayment(payment.id)}>
       Retry Payment
     </button>
   )}
   ```

## Testing

### Manual Test Cases

**Test 1: Successful Payment Flow**
1. Go to paid course page
2. Click "Pay with Paystack"
3. Complete payment with test card
4. Verify green alert appears
5. Verify PaymentHistory shows transaction

**Test 2: Cancelled Payment**
1. Go to paid course page
2. Click "Pay with Paystack"
3. Cancel payment on Paystack form
4. Verify amber alert appears
5. Verify PaymentHistory shows PENDING transaction

**Test 3: Failed Payment**
1. Go to paid course page
2. Temporarily disable Paystack key in env
3. Click "Pay with Paystack"
4. Verify red alert appears
5. Verify PaymentHistory shows FAILED transaction

**Test 4: Multiple Attempts**
1. Attempt payment multiple times
2. Some succeed, some fail
3. Verify all attempts shown in PaymentHistory
4. Verify correct status for each

### Automated Test Example

```typescript
describe("PaymentStatusAlert", () => {
  test("shows success message when checkout=success", () => {
    const { getByText } = render(
      <PaymentStatusAlert searchParams={new URLSearchParams("checkout=success")} />
    );
    expect(getByText("Payment successful!")).toBeInTheDocument();
  });

  test("shows cancelled message when checkout=cancelled", () => {
    const { getByText } = render(
      <PaymentStatusAlert searchParams={new URLSearchParams("checkout=cancelled")} />
    );
    expect(getByText("Payment cancelled")).toBeInTheDocument();
  });
});
```

## API Changes

### Course Endpoint Enhancement

The `/courses/:id` endpoint now includes payment history:

**Request**:
```
GET /courses/course_123
Authorization: Bearer token
```

**Response**:
```json
{
  "id": "course_123",
  "title": "Advanced TypeScript",
  "priceCents": 500000,
  "currency": "NGN",
  "enrolled": true,
  "progressPct": 35,
  "payments": [
    {
      "id": "payment_123",
      "status": "SUCCEEDED",
      "amountCents": 500000,
      "currency": "NGN",
      "provider": "PAYSTACK",
      "createdAt": "2024-01-15T14:30:00Z"
    }
  ]
}
```

### Backwards Compatibility

- `payments` field is optional (empty array if not enrolled)
- Existing clients ignore unknown fields
- No breaking changes to existing response structure

## Performance Considerations

1. **Payment History Limit**: Limited to last 10 transactions to prevent large payloads
2. **Conditional Fetching**: Only fetches payments for enrolled users
3. **Client-side Rendering**: PaymentStatusAlert uses searchParams (no API call)
4. **Image Optimization**: Uses Lucide icons (no external image requests)

## Accessibility

- Semantic HTML structure
- ARIA labels on icons
- Color not the only differentiator (uses icons + text)
- Keyboard navigable buttons
- Screen reader friendly status messages

## Future Enhancements

1. **Receipt Export**: Generate PDF invoices
2. **Refund Management**: UI for processing refunds
3. **Payment Analytics**: Dashboard showing payment trends
4. **Subscription Support**: Recurring payment tracking
5. **Invoice History**: Downloadable invoice list
6. **Payment Methods**: Save payment methods for faster checkout
