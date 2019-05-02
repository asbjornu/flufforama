payex.hostedView.consumer({
    container: 'checkin',
    culture: 'nb-NO',
    onConsumerIdentified: function(consumerIdentifiedEvent) {
        var request = new XMLHttpRequest();
        request.addEventListener('load', function () {
            response = JSON.parse(this.responseText);
            var paymentOrder = response.id;

            var script = document.createElement('script');
            script.setAttribute('src', response.operation.href);
            script.onload = function () {
                payex.hostedView.paymentMenu({
                    container: 'payment-menu',
                    culture: 'nb-NO',
                    onPaymentCompleted: function (paymentCompletedEvent) {
                        window.location.href = '/receipt?po=' + paymentOrder + '&state=' + paymentCompletedEvent.state;
                    }
                }).open();
            };
            var head = document.getElementsByTagName('head')[0];
            head.appendChild(script);
        });
        request.open('POST', window.location.href, true);
        request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        request.send(JSON.stringify(consumerIdentifiedEvent));
    }
}).open();
