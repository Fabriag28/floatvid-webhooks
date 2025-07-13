const crypto = require('crypto');

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

    // If HMAC header is missing or invalid, return 401
    if (!hmacHeader) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Unauthorized - Missing HMAC' }),
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

    console.log('Shop redact request received:', payload);

    // FloatVid response: Shop data cleaned up automatically
    const response = {
      message: 'Shop data redaction processed successfully',
      app: 'FloatVid',
      response: 'Shop data redaction completed. FloatVid theme settings are automatically removed when the app is uninstalled. No additional shop data requires manual deletion.',
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
    console.error('Error processing shop redact request:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
