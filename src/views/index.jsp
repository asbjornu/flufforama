<%! layout %>

<p>
  Enjoy our wide selection of fluffy animals. Gaze at them and take them home
  by clicking "Buy now" and completing a few simple steps! Get your personal
  flufforama delivered today!
</p>

<%| paymentSessions paymentSession %>
	<form method="post">
		<input type="hidden" name="paymentSession" value="<%= paymentSession.id %>">
		<button type="submit" data-payex-checkout="<%= paymentSession.id %>">
			<span>
				Buy now for only <br>
				<%= paymentSession.currency %>
				<%= parseFloat(Math.round(paymentSession.amount * 100) / 100).toFixed(2) %>
			</span>
		</button>
	</form>
<%|%>
