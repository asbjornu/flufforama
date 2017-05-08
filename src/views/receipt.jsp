extend default

block content
    h3 Payment #{state}!
    p
        | The&nbsp;
        a(href=paymentSession) payment
        | of #{amount} is&nbsp;
        strong #{state}.
