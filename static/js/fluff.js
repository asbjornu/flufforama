payex.hostedView.consumer({
    container: 'checkin',
    culture: 'nb-NO',
    onConsumerIdentified: function(consumerEvent) {
        console.log(consumerEvent);

        var request = new XMLHttpRequest();
        request.addEventListener('load', function(response) {
            console.log(response);
            console.log(this.responseText);
        });
        request.open('POST', window.location.href);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(consumerEvent));
    }
}).open();