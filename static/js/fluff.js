payex.hostedView.consumer({
    container: 'checkout',
    culture: 'nb-NO',
    onConsumerIdentified: function(consumerIdentifiedEvent) {
        var request = new XMLHttpRequest();
        request.addEventListener('load', function() {
            response = JSON.parse(this.responseText);

            var script = document.createElement('script');
            script.setAttribute('src', response.operation.href);        
            script.onload = function() {
                payex.hostedView.paymentMenu({
                    container: 'checkout',
                    culture: 'nb-NO',
                    onPaymentCompleted: function(e) {
                        
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