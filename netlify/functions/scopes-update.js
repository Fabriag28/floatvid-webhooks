const crypto = require('crypto');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const hmacHeader = event.headers['x-shopify-hmac-sha256'];
    const body = event.body;
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

    console.log('Scopes update webhook received');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Scopes update processed successfully',
        app: 'FloatVid'
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
