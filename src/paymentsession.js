module.exports = {
    initialize: () => {
        return new Array(8)
            .fill()
            .map((_, i) => i + 1)
            .map(initializePaymentSession)
    }
};

function initializePaymentSession(item) {
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
        vatAmount: vatAmount,
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
}
