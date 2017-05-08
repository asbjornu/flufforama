doctype html
html
  head
    link(rel='stylesheet', href='/css/index.css')
    script(src='https://ecom.externalintegration.payex.com/checkout/Content/js/payex-checkout.min.js')
    title Flufforama - #{title}
  body
    .header
      h1.page-title
          a(href='/') Flufforama
      h2.subtitle Instant Fluffy Gratification &mdash; Delivered!

    .main-content
      block content

    .footer
      p Copyright © 2017 PayEx