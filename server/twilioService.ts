import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  throw new Error('Missing Twilio configuration. Please ensure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are set.');
}

const client = twilio(accountSid, authToken);

export interface SMSNotification {
  customerName: string;
  email: string;
  phone?: string;
  message: string;
  puppyInterest?: string;
}

export async function sendInquiryNotification(inquiry: SMSNotification): Promise<void> {
  try {
    const messageBody = formatInquiryMessage(inquiry);
    
    await client.messages.create({
      body: messageBody,
      from: twilioPhoneNumber,
      to: '+61498114541', // Sally's phone number
    });
    
    console.log('SMS notification sent successfully to Sally');
  } catch (error) {
    console.error('Failed to send SMS notification:', error);
    // Don't throw error - we don't want inquiry submission to fail if SMS fails
  }
}

function formatInquiryMessage(inquiry: SMSNotification): string {
  let message = `🐩 New Puppy Inquiry!\n\n`;
  message += `Name: ${inquiry.customerName}\n`;
  message += `Email: ${inquiry.email}\n`;
  
  if (inquiry.phone) {
    message += `Phone: ${inquiry.phone}\n`;
  }
  
  if (inquiry.puppyInterest) {
    message += `Interested in: ${inquiry.puppyInterest}\n`;
  }
  
  message += `\nMessage: ${inquiry.message.substring(0, 200)}${inquiry.message.length > 200 ? '...' : ''}`;
  
  return message;
}