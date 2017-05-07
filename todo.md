# Integration todo

Here's what needs to be done to integrate this `barebones` webshop with
PayEx Checkout:

## Client-side (front-end)

1. Manually retrieve an **Access Token** from [PayEx Admin][pxadmin] that can
   perform Invoice, Credit Card and Checkout payment operations.
     1. Store the Access Token in an `.env` file alongside `server.js` with
        the key `ACCESS_TOKEN` and the value as copied from PayEx Admin.
2. Add the [JavaScript][js] to the `<head>` of the HTML page that displays
   the purchasable items.
3. In the *Buy* `<button>` elements for each purchasable item, add a `disabled`
   attribute; PayEx Checkout will enable the button when it is initialized.

## Server-side (back-end)

1. Fetch the `paymentSession` URL from the [PayEx Checkout API][api].
2. Perform an HTTP `POST` request to create one Payment Session per purchasable
   item.
3. Return the URL from the posted Payment Session to the front-end code and
   stuff it into a `data-payex-checkout` attribute on the `<button>`
   corresponding to the purchasable item.
4. Perform a Capture of the payment when PayEx Checkout is complete and the
   `<form>` is submitted.

Et voilà!

[pxadmin]: 	https://admin.externalintegration.payex.com/psp/login
[js]: 		https://ecom.externalintegration.payex.com/checkout/Content/js/payex-checkout.min.js
[api]:      https://api.externalintegration.payex.com/psp/checkout
