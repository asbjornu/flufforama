payex.hostedView.consumer({
    container: "checkin",
    onConsumerIdentified: function(e) {
        console.log(e);        
    }
}).open();