var productPrices = {};
var stockinfo = {};

$(function () {
    // JSON data by API call for order table
    $.get(productListApiUrl, function (response) {
        productPrices = {};
        stockinfo = {};
        if (response) {
            var options = '<option value="">--Select--</option>';
            $.each(response, function (index, product) {
                options += '<option value="' + product.product_id + '">' + product.name + '</option>';
                productPrices[product.product_id] = product.price_per_unit;
                // Retrieve the remaining stock_info from local storage or initialize to the default value
                stockinfo[product.product_id] = parseInt(localStorage.getItem('stock_info_' + product.product_id)) || product.stock_info;
            });
            $(".product-box").find("select").empty().html(options);
        }
    });
});

$("#addMoreButton").click(function () {
    var row = $(".product-box").html();
    $(".product-box-extra").append(row);
    $(".product-box-extra .remove-row").last().removeClass('hideit');
    $(".product-box-extra .product-price").last().text('0.0');
    $(".product-box-extra .stock-info").last().text('0.0');
    $(".product-box-extra .product-qty").last().val('1');
    $(".product-box-extra .product-total").last().text('0.0');
});

$(document).on("click", ".remove-row", function () {
    $(this).closest('.row').remove();
    calculateValue();
});

$(document).on("change", ".cart-product", function () {
    var product_id = $(this).val();
    var price = productPrices[product_id];
    var stockinfovalue = stockinfo[product_id];
    $(this).closest('.row').find('#product_price').val(price);
    $(this).closest('.row').find('#stock_info').val(stockinfovalue);
    calculateValue();
});

$(document).on("change", ".product-qty", function (e) {
    calculateValue();
});
// Event handler for saving the order
$("#saveOrder").on("click", function () {
    var formData = $("form").serializeArray();
    var requestPayload = {
        customer_name: null,
        grand_total: null,
        order_details: []
    };

    var isOrderValid = true; // Flag to check if the order is valid

    for (var i = 0; i < formData.length; ++i) {
        var element = formData[i];
        var lastElement = null;

        switch (element.name) {
            case 'customerName':
                requestPayload.customer_name = element.value;
                break;
            case 'product_grand_total':
                requestPayload.grand_total = element.value;
                break;
            case 'product':
                requestPayload.order_details.push({
                    product_id: element.value,
                    quantity: null,
                    total_price: null
                });
                break;
            case 'qty':
                lastElement = requestPayload.order_details[requestPayload.order_details.length - 1];
                lastElement.quantity = element.value;
                break;
            case 'item_total':
                lastElement = requestPayload.order_details[requestPayload.order_details.length - 1];
                lastElement.total_price = element.value;
                break;
        }
    }

    // Check if the order quantity exceeds available stock or if it's invalid
    for (var i = 0; i < requestPayload.order_details.length; i++) {
        var orderDetail = requestPayload.order_details[i];
        var product_id = orderDetail.product_id;
        var quantity = orderDetail.quantity;
        var stockinfoValue = stockinfo[product_id];

        if (quantity > stockinfoValue) {
            showCustomAlert("Not enough stock available for Product ID " + product_id + ". Please reduce the quantity.");
            isOrderValid = false;
            break; // Stop further processing
        }
        else {
            // Deduct the selected quantity from stock_info
            stockinfo[product_id] -= quantity;
            if (stockinfo[product_id] === 0) {
                // Display a message indicating that the stock needs to be updated
                alert('Please update your stock for this product your stock is 0 product_id: ' + product_id);
            }
            // Show a message indicating successful order save
            showCustomAlert("Order saved successfully!");


        }
    }

    function showCustomAlert(message) {
        var customAlert = document.getElementById('customAlert');
        var customAlertMessage = document.getElementById('customAlertMessage');

        customAlertMessage.textContent = message;
        customAlert.style.display = 'block';



        var customAlertClose = document.getElementById('customAlertClose');
        customAlertClose.addEventListener('click', function () {
            customAlert.style.display = 'none';
        });
    }

    // Update stock_info in the form elements
    updateStockInfoInForm();

    if (isOrderValid) {
        callApi("POST", orderSaveApiUrl, {
            'data': JSON.stringify(requestPayload)
        });
    }
});
function updateStockInfoInForm() {
    $(".product-qty").each(function () {
        // Get the product_id from the form element
        var product_id = $(this).closest('.row').find('.cart-product').val();

        // Get the stock_info value associated with the product_id
        var stock_info = stockinfo[product_id];

        // If stock_info is null or undefined, set it to 0
        stock_info = (stock_info !== null && stock_info !== undefined) ? stock_info : 0;

        // Update the form element with the stock_info value
        $(this).closest('.row').find('.stock-info').val(stock_info);

        // Save the updated stock_info to local storage with a unique key
        localStorage.setItem('stock_info_' + product_id, stock_info);
    });
}




