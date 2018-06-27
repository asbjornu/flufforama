payex.hostedView.consumer({
    container: 'checkin',
    culture: 'nb-NO',
    onConsumerIdentified: function(consumerEvent) {
        console.log(consumerEvent);

        var request = new XMLHttpRequest();
        request.addEventListener('load', function() {
            response = JSON.parse(this.responseText);
            console.log(response);

            var script = document.createElement('script');
            script.setAttribute('src', response.operation.href);        
            script.onload = function() {
                payex.hostedView.paymentMenu({
                    container: 'checkin',
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
        request.send(JSON.stringify(consumerEvent));
    }
}).open();