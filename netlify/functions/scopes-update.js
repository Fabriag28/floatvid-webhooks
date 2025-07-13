const crypto = require('crypto');

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
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const hmacHeader = event.headers['x-shopify-hmac-sha256'];
    const contentType = event.headers['content-type'];

    if (!contentType || !contentType.includes('application/json')) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid content type' }),
      };
    }

    // Verify HMAC - return 401 if invalid
    const isValidHmac = verifyShopifyWebhook(event.body, hmacHeader);
    
    if (!isValidHmac) {
      console.log('Invalid HMAC signature - returning 401');
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized - Invalid HMAC signature' }),
      };
    }

    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid JSON payload' }),
      };
    }

    console.log('Valid scopes update webhook received:', payload);

    const response = {
      message: 'Scopes update notification processed successfully',
      app: 'FloatVid',
      response: 'App permissions have been updated successfully. FloatVid will continue to function with the new scope configuration.',
      shop_id: payload.id,
      shop_domain: payload.domain,
      timestamp: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    };

  } catch (error) {
    console.error('Error processing scopes update notification:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
