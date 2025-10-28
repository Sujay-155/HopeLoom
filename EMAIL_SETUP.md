# Email Notification Setup Guide for HopeLoom

This guide explains how to set up email notifications for doctors when patients book appointments.

## Overview

HopeLoom uses **EmailJS** to send email notifications to doctors when:
- A patient books an appointment
- The appointment details are saved to Firestore
- The doctor receives an email with patient information and appointment details

## Setup Instructions

### Step 1: Create an EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/)
2. Sign up for a free account (allows 200 emails/month)
3. Verify your email address

### Step 2: Add an Email Service

1. In EmailJS Dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. For Gmail:
   - Click **Connect Account**
   - Sign in with the Gmail account that will send emails
   - Allow EmailJS to access your account
5. Note down the **Service ID** (e.g., `service_xxxxxxx`)

### Step 3: Create an Email Template

1. Go to **Email Templates** in EmailJS Dashboard
2. Click **Create New Template**
3. Use this template content:

```
Subject: New Appointment Request from {{patient_name}}

Hello {{to_name}},

You have a new appointment request from HopeLoom.

Patient Details:
- Name: {{patient_name}}
- Email: {{patient_email}}
- Phone: {{patient_phone}}

Appointment Details:
- Date: {{appointment_date}}
- Time: {{appointment_time}}
- Reason: {{reason}}

Please log in to your HopeLoom dashboard to confirm or reschedule this appointment.

Best regards,
HopeLoom Team
```

4. Note down the **Template ID** (e.g., `template_xxxxxxx`)

### Step 4: Get Your Public Key

1. Go to **Account** > **General** in EmailJS Dashboard
2. Find your **Public Key** (e.g., `YOUR_PUBLIC_KEY`)
3. Copy this key

### Step 5: Update App.jsx

Open `App.jsx` and find the `handleSubmit` function in `BookAppointmentPage` component (around line 2678).

Replace these placeholders:

```javascript
// Replace these three values:
emailjs.init('YOUR_PUBLIC_KEY');  // Step 4

await emailjs.send(
  'YOUR_SERVICE_ID',   // Step 2 - Service ID
  'YOUR_TEMPLATE_ID',  // Step 3 - Template ID
  templateParams
);
```

**Example:**
```javascript
emailjs.init('8xK9vLmP2nQ3rT4u');

await emailjs.send(
  'service_abc123',
  'template_xyz789',
  templateParams
);
```

### Step 6: Update Doctor Emails

In `App.jsx`, update the `PROFESSIONALS_DATA` array with actual doctor email addresses:

```javascript
const PROFESSIONALS_DATA = [
  {
    id: 1,
    name: "Dr. Somesh",
    email: "somesh@example.com",  // Replace with real email
    // ... other fields
  },
  // ... other doctors
];
```

## Testing

1. Start your development server: `npm run dev`
2. Sign in to the app
3. Book an appointment with a doctor
4. Check:
   - ✅ Appointment saved to Firestore
   - ✅ Email sent to doctor's email
   - ✅ Success message displayed to user

## Troubleshooting

### Email Not Sending

1. **Check EmailJS Dashboard**: Go to **History** to see if emails were attempted
2. **Verify Service Connection**: Make sure your email service is connected properly
3. **Check Template Parameters**: Ensure template variable names match (e.g., `{{patient_name}}`)
4. **Console Errors**: Check browser console for error messages

### Email Going to Spam

1. Use a verified email service (Gmail, Outlook)
2. Add your sending domain to SPF/DKIM records (advanced)
3. Ask doctors to whitelist `noreply@emailjs.com`

### Rate Limits

- **Free Plan**: 200 emails/month
- **Paid Plans**: Start at $7/month for 1,000 emails
- Consider upgrading if you have high appointment volume

## Database Structure

### Assessments Collection

Each assessment document contains:
```javascript
{
  userId: "user-firebase-uid",
  userName: "John Doe",
  userEmail: "john@example.com",
  type: "anxiety",
  assessmentType: "anxiety",
  score: 18,
  maxScore: 27,
  severity: "moderate",
  responses: { 1: 2, 2: 3, ... },
  createdAt: Timestamp,
  completedAt: Timestamp
}
```

### Appointments Collection

Each appointment document contains:
```javascript
{
  userId: "user-firebase-uid",
  userName: "John Doe",
  userEmail: "john@example.com",
  userPhone: "+1234567890",
  professionalId: 1,
  professionalName: "Dr. Somesh",
  professionalEmail: "dr.somesh@hopeloom.com",
  preferredDate: "2025-11-01",
  preferredTime: "10:00 AM",
  reason: "Initial consultation",
  status: "pending",
  createdAt: Timestamp
}
```

## Future Enhancements

Consider adding:
- ✨ Confirmation emails to patients
- ✨ Reminder emails (24 hours before appointment)
- ✨ Email when appointment status changes
- ✨ Doctor dashboard to view all appointments
- ✨ SMS notifications via Twilio
- ✨ Calendar integration (Google Calendar, Outlook)

## Security Notes

⚠️ **Never commit EmailJS keys to public repositories!**

Instead, use environment variables:
1. Create `.env` file:
   ```
   VITE_EMAILJS_PUBLIC_KEY=your_key
   VITE_EMAILJS_SERVICE_ID=your_service
   VITE_EMAILJS_TEMPLATE_ID=your_template
   ```

2. Update code:
   ```javascript
   emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
   await emailjs.send(
     import.meta.env.VITE_EMAILJS_SERVICE_ID,
     import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
     templateParams
   );
   ```

3. Add `.env` to `.gitignore`

## Support

- EmailJS Docs: https://www.emailjs.com/docs/
- HopeLoom Issues: Contact the development team

---

**Last Updated**: October 28, 2025
