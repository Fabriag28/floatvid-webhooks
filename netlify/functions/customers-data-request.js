const crypto = require('crypto');

// You'll need to set this in Netlify environment variables
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

function verifyShopifyWebhook(data, hmacHeader) {
  if (!SHOPIFY_WEBHOOK_SECRET) {
    console.error('SHOPIFY_WEBHOOK_SECRET not configured');
    return false;
  }
  
  if (!hmacHeader) {
    return false;
  }

  const calculatedHmac = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(data, 'utf8')
    .digest('base64');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(calculatedHmac),
      Buffer.from(hmacHeader)
    );
  } catch (error) {
    console.error('HMAC comparison failed:', error);
    return false;
  }
}

exports.handler = async (event, context) => {
  // Only allow POST requests for webhooks
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get headers
    const hmacHeader = event.headers['x-shopify-hmac-sha256'];
    const contentType = event.headers['content-type'];

    // Verify Content-Type is application/json
    if (!contentType || !contentType.includes('application/json')) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid content type' }),
      };
    }

    // Verify HMAC signature - RETURN 401 if invalid
    const isValidHmac = verifyShopifyWebhook(event.body, hmacHeader);
    
    if (!isValidHmac) {
      console.log('Invalid HMAC signature - returning 401');
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Unauthorized - Invalid HMAC signature' }),
      };
    }

    // Parse the webhook payload
    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid JSON payload' }),
      };
    }

    console.log('Valid customer data request received:', payload);

    // FloatVid response: We don't store customer data
    const response = {
      message: 'Customer data request processed successfully',
      app: 'FloatVid',
      response: 'No personal customer data is stored by FloatVid. FloatVid only stores theme customization settings (video URLs, colors, fonts, positioning) which contain no personal information.',
      shop_id: payload.shop_id,
      shop_domain: payload.shop_domain,
      timestamp: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    };

  } catch (error) {
    console.error('Error processing customer data request:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
