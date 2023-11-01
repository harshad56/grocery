$(function () {
    // Json data by api call for order table
    $.get(orderListApiUrl, function (response) {
        if (response) {
            var table = '';
            var totalCost = 0;
            $.each(response, function (index, order) {
                totalCost += parseFloat(order.total);
                table += '<tr>' +
                    '<td>' + order.datetime + '</td>' +
                    '<td>' + order.order_id + '</td>' +
                    '<td>' + order.customer_name + '</td>' +
                    '<td>' + order.total.toFixed(2) + ' Rs</td>' +
                    '<td><span class="button-62 bill_generate">bill_generate</span></td></tr>';
            });
            table += '<tr><td colspan="3" style="text-align: end"><b>Total</b></td><td><b>' + totalCost.toFixed(2) + ' Rs</b></td></tr>';
            $("table").find('tbody').empty().html(table);
        }
    });

    // Attach a click event handler to the "Print" button in the bill modal
    $(document).on("click", ".bill_generate", function () {
        // Get the parent row of the clicked button.
        var row = $(this).closest('tr');

        // Check if the row exists.
        if (row.length > 0) {
            // Get the data from the row using jQuery.
            const date = row.find('td:eq(0)').text();
            const orderNumber = row.find('td:eq(1)').text();
            const customerName = row.find('td:eq(2)').text();
            const totalCost = row.find('td:eq(3)').text();

            // Populate the modal with the data.
            $('#bill-date').text(date);
            $('#bill-order-number').text(orderNumber);
            $('#bill-customer-name').text(customerName);
            $('#bill-total-cost').text(totalCost);

            // Display the bill modal.
            $('#billModal').modal('show');
        } else {
            // The row is not a DOM element or it has been removed from the DOM.
        }

    });

    $(function () {
        // ... Your existing code ...

        // Attach a click event handler to the "Print" button in the bill modal
        $('#printBillButton').on('click', function () {
            // Open the browser's print dialog
            window.print();
        });
    });

});
