<%! layout %>

<p>
  Enjoy our wide selection of fluffy animals. Gaze at them and take them home
  by clicking "Buy now" and completing a few simple steps! Get your personal
  flufforama delivered today!
</p>

<%| paymentOrders paymentOrder %>
	<form method="post">
		<input type="hidden" name="paymentOrder" value="<%= paymentOrder.id %>">
		<button type="submit" data-payex-checkout="<%= paymentOrder.id %>" disabled>
			<span>
				Buy now for only <br>
				<%= paymentOrder.currency %>
				<%= parseFloat(Math.round(paymentOrder.amount * 100) / 100).toFixed(2) %>
			</span>
		</button>
	</form>
<%|%>
