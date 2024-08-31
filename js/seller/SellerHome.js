import { getLoginInfo, getSellerInfo } from "../Utils/auth.js";
import { ShowToastNotification } from "./SellerCommon.js";

var products = [];
$(document).ready(function(event) {
    // Function to fetch daeta from API and populate table
    function fetchDataAndPopulateTable(event) {
        const sellerInfo = getSellerInfo();
        const userDetails = getLoginInfo();
        if (sellerInfo == null || userDetails == null) {
          window.localStorage.setItem("returnUrl", window.location.href);
          window.location.replace("../login.html");
          return;
        }
        const sellerID = sellerInfo.sellerID;
        const token = userDetails.token;
        $.ajax({
            url: `http://localhost:5083/api/SellerProduct/ViewAllTopSellingProducts?SellerID=${sellerID}`,
            method: 'GET',
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                Authorization: `Bearer ${token}`,
              },
            success: function(response) {
                products = response;

                populateTable(response); // Call the populateTable function with API response
            },
            error: function(xhr, status, error) {
                ShowToastNotification(event, "danger", "Something went wrong!");
                console.error('Error fetching data:', error);
                // Handle error as per your application's requirements
            }
        });
    }

    // Function to populate the table with data
    function populateTable(products) {
        var tableBody = $('#tableBody');
        tableBody.empty(); // Clear existing rows

        // Loop through products and append rows to the table
        $.each(products, function(index, product) {
            var row = '<tr>' +
                      '<td>' + product.productID + '</td>' +
                      '<td>' + product.productName + '</td>' +
                      '<td>' + product.categoryName + '</td>' +
                      '<td>' + product.quantitySold + '</td>' +
                      '<td>₹' + product.totalRevenue.toFixed(2) + '</td>' +
                      '</tr>';
            tableBody.append(row);
        });
    }

    // Initial data fetch and populate table
    fetchDataAndPopulateTable(event);

    // Function to handle pagination (dummy implementation)
    function paginateTable(pageNumber) {
        // Implement pagination logic here based on your API response
        // Example: Fetch data for specific page number from API
        // Adjust based on your API's pagination mechanism
    }

    // Function to handle search
    $('#searchInput').on('input', function() {
        var searchText = $(this).val().toLowerCase();

        // Filter products based on search text
        var filteredProducts = products.filter(function(product) {
            return product.productName.toLowerCase().includes(searchText);
        });

        populateTable(filteredProducts); // Populate table with filtered data
    });

    // Example pagination initialization (dummy implementation)
    paginateTable(1);
});
