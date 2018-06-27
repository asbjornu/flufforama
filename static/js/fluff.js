payex.hostedView.consumer({
    container: 'checkin',
    culture: 'nb-NO',
    onConsumerIdentified: function(consumerEvent) {
        console.log(consumerEvent);

        var request = new XMLHttpRequest();
        request.addEventListener('load', function() {
            console.log(this.responseText);
        });
        request.open('POST', window.location.href, true);
        request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        request.send(JSON.stringify(consumerEvent));
    }
}).open();