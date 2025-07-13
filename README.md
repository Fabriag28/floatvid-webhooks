# floatvid-webhooks
This repository contains the webhook endpoints for the FloatVid Shopify app.

## Endpoints

### Compliance Webhooks
- `/api/webhooks/customers-data-request` - Handle customer data requests
- `/api/webhooks/customers-redact` - Handle customer data deletion
- `/api/webhooks/shop-redact` - Handle shop data deletion

### App Lifecycle Webhooks  
- `/api/webhooks/app-uninstalled` - Handle app uninstallation
- `/api/webhooks/scopes-update` - Handle scope updates

## Features

- ✅ Proper HMAC validation
- ✅ Correct HTTP status codes
- ✅ JSON responses
- ✅ Error handling
- ✅ Environment variable support

## Deployment

This project is designed to deploy to Netlify with automatic function deployment.

## Environment Variables

Set `SHOPIFY_WEBHOOK_SECRET` in your Netlify environment variables.
