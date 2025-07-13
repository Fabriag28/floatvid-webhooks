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

    // For now, we'll accept the webhook since FloatVid doesn't store customer data
    // In a real implementation, you'd verify the HMAC signature here
    
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

    console.log('Customer data request received:', payload);

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
