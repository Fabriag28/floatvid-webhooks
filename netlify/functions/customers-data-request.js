const crypto = require('crypto');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get headers
    const hmacHeader = event.headers['x-shopify-hmac-sha256'];
    const body = event.body;

    // Verify HMAC (using a dummy secret for demo - you'd use your real webhook secret)
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET || 'dummy-secret';
    
    if (hmacHeader) {
      const calculatedHmac = crypto
        .createHmac('sha256', webhookSecret)
        .update(body, 'utf8')
        .digest('base64');

      if (calculatedHmac !== hmacHeader) {
        return {
          statusCode: 401,
          body: JSON.stringify({ error: 'Unauthorized - Invalid HMAC' })
        };
      }
    }

    // Process the webhook (for FloatVid, we just log it)
    console.log('Customer data request received');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Customer data request processed successfully',
        app: 'FloatVid',
        note: 'No personal customer data is stored by FloatVid'
      })
    };

  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
