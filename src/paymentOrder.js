/**
  * The Payment Session module, used to create PaymentOrder objects.
  *
  * @module paymentOrder
  *
  */

/**
  * Initializes and returns 8 PaymentOrder objects.
  *
  * @export initialize
  * @return 8 PaymentOrder objects
  */
module.exports.initialize = () => {
	return new Array(8)
		.fill()
		.map((_, i) => i + 1)
		.map(initializePaymentOrder)
};

/**
  * Initializes a PaymentOrder object.
  *
  * @private
  * @param item The item number to create.
  * @return A PaymentOrder object.
  */
function initializePaymentOrder(item) {
    var amounts = getRandomAmounts(item);

	return {
		amount: amounts.amount,
		vatAmount: amounts.vatAmount,
		currency: "NOK",
		callbackUrl: "https://merchant.api/callback",
		reference: `fluffy-${item}`,
		culture: "en-US",
		fees: {
			invoice: {
				amount: 19.50,
				vatAmount: 3.90,
				description: "Invoice fee"
			}
		}
	}
};

/**
  * Gets an object containing a random amount and VAT amount.
  *
  * @private
  * @param item The item number to use in the calculation of amounts.
  * @return An object containing a random amount and VAT amount.
  */
function getRandomAmounts(item) {
    var r = parseFloat(Math.round(Math.random() * 100) / 100).toFixed(2);
	var a = Math.random() * item * 223;
	var grossAmount = parseFloat(Math.round(a * 100) / 100).toFixed(1);
	var vatRate = 25;
	var vatFactor = 1 + (vatRate / 100);
	var netAmount = grossAmount / vatFactor;
	var v = grossAmount - netAmount;
	var vatAmount = parseFloat(Math.round(v * 100) / 100).toFixed(2);

    return {
        amount: grossAmount,
        vatAmount: vatAmount
    };
}
