import { getSellerInfo, getLoginInfo } from "../Utils/auth.js";
import { ShowToastNotification } from "./SellerCommon.js";


// function DispatchOrder(event, id) {
//     var userDetails = getLoginInfo();
//     var sellerInfo = getSellerInfo();
//     if (userDetails == null || sellerInfo == null) {
//       window.location.href = "./login.html";
//     }
//     const token = userDetails.token;
//   $.ajax({
//     url: `http://localhost:5083/api/SellerOrder/UpdateOrderStatus?orderStatus=2&OrderID=${id}`,
//     type: "PUT",
//     headers: { 
//         "Content-type": "application/json; charset=UTF-8",
//         Authorization: `Bearer ${token}`,
//     },
//     success: function (response) {
//         ShowToastNotification(event, "success", "Order Dispatched!")
//     //   console.log("Order status updated successfully", response);
//     },
//     error: function (xhr, status, error) {
//         ShowToastNotification(event, "danger", "Something went wrong!")
//     //   console.error("Error updating order status:", error);
//     },
//   });
// }

window.DispatchOrder = function(event, id) {
    var userDetails = getLoginInfo();
    var sellerInfo = getSellerInfo();
    if (userDetails == null || sellerInfo == null) {
      window.localStorage.setItem('returnUrl', window.location.href);
      window.location.replace('./login.html');
      return;
    }
    const token = userDetails.token;
    $.ajax({
        url: `http://localhost:5083/api/SellerOrder/UpdateOrderStatus?orderStatus=2&OrderID=${id}`,
        type: "PUT",
        headers: { 
            "Content-type": "application/json; charset=UTF-8",
            Authorization: `Bearer ${token}`,
        },
        success: function(response) {
            ShowToastNotification(event, "success", "Order Dispatched!");
            setTimeout(()=>{
                location.reload();
              }, 3000);
            
        },
        error: function(xhr, status, error) {
            ShowToastNotification(event, "danger", "Something went wrong!");
        },
    });
}


$(document).ready(function (event) {
  const sellerInfo = getSellerInfo();
  const userDetails = getLoginInfo();
  if (sellerInfo == null || userDetails == null) {
    window.localStorage.setItem("returnUrl", window.location.href);
    window.location.replace("../login.html");
    return;
  }
  const sellerID = sellerInfo.sellerID;
  const token = userDetails.token;
  let currentPage = 1;
  let rowsPerPage = parseInt($("#rowsPerPage").val());
  let currentOrders = [];
  var searchquery = "";

  // Initial fetch
  fetchOrders(sellerID, token, currentPage, rowsPerPage, event, searchquery);

  // Event listeners for pagination controls
  $("#rowsPerPage").change(function () {
    rowsPerPage = parseInt($(this).val());
    currentPage = 1;
    fetchOrders(sellerID, token, currentPage, rowsPerPage, event, searchquery);
  });

  $("#prevPage").click(function () {
    if (currentPage > 1) {
      currentPage--;
      fetchOrders(sellerID, token, currentPage, rowsPerPage, event, searchquery);
    }
  });

  $("#nextPage").click(function () {
    currentPage++;
    fetchOrders(sellerID, token, currentPage, rowsPerPage, event, searchquery);
  });

  // Function to fetch orders and update the table
  function fetchOrders(sellerID, token, page, rowsPerPage, event, searchquery) {

  
    var offset = (page - 1) * rowsPerPage;
    if(searchquery==""){
      // console.log("searchquery");
      searchquery="null";
    }
    else{
      offset=0;
    }
    $.ajax({
      url: `http://localhost:5083/api/SellerOrder/ViewAllActiveOrders?SellerID=${sellerID}&offset=${offset}&limit=${rowsPerPage}&searchQuery=${searchquery}`,
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
      success: function (response) {
        // console.log(response);
        if (!response || response.items.length === 0) {
          showEmptyMessage();
        } else {
          currentOrders = response.items; // Store current orders
          updateOrdersTable(
            currentOrders,
            response.totalCount,
            page,
            rowsPerPage
          );
        }
      },
      error: function (xhr, status, error) {
        console.error("Failed to fetch orders:", error);
        showEmptyMessage();
        ShowToastNotification(event, "danger", "Something went wrong!");
      },
    });
  }

  // Function to update the orders table
  function updateOrdersTable(orders, totalCount, page, rowsPerPage) {
    const tableBody = $(".table tbody");
    tableBody.empty(); // Clear existing rows

    orders.forEach((order) => {
      const orderRow = `
            <tr>
                <td><b>${order.orderID}</b></td>
                <td>${formatDate(order.order_Date)}</td>
                <td><span class="status active">${statusConversion(
                  order.status
                )}</span></td>
                <td>₹${order.total_Amount.toFixed(2)}</td>
                <td><span>${order.shipping_Method}</span></td>
                <td><i class="fa-solid fa-eye table-button" data-orderid="${
                  order.orderID
                }"></i></td>
                <td><button class="checkout-button table-button" onclick="DispatchOrder(event, ${order.orderID})" data-orderid="${
                  order.orderID
                }">Dispatch</button></td>
            </tr>
        `;
      tableBody.append(orderRow);
    });

    const totalPages = Math.ceil(totalCount / rowsPerPage);
    $("#currentRange").text(
      `${(page - 1) * rowsPerPage + 1}-${Math.min(
        page * rowsPerPage,
        totalCount
      )}`
    );
    $("#totalCount").text(totalCount);
    $("#pageNumber").text(page);
    $("#totalPages").text(totalPages);

    $("#prevPage").prop("disabled", page <= 1);
    $("#nextPage").prop("disabled", page >= totalPages);

    // Add event listener for the eye icon
    $(".fa-eye").click(function () {
      const orderId = $(this).data("orderid");
      const order = currentOrders.find((o) => o.orderID === orderId);
      openOrderModal(order);
    });
  }

  // Function to format date
  function formatDate(dateString) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  // Function to show empty message
  function showEmptyMessage() {
    document.getElementById("emptyMessage").style.display = "block";
    $(".table tbody").empty(); // Clear any existing rows in the table
  }

  // Function to open order modal
  function openOrderModal(order) {
    populateOrderModal(order);
    $("#orderModal").show();
  }

  // Function to populate order modal
  function populateOrderModal(order) {
    $("#orderModal .order-details").html(`
        <table>
            <tr>
                <th>Order Number</th>
                <td>#${order.orderID}</td>
            </tr>
            <tr>
                <th>Date</th>
                <td>${formatDate(order.order_Date)}</td>
            </tr>
             <tr>
                <th>Address</th>
                <td>${order.address}</td>
            </tr>
            <tr>
                <th>Items</th>
                <td>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Price</th>
                                  <th>Quantity</th>
                                  <th>Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.orderDetails
                              .map(
                                (item) => `
                                <tr>
                                    <td>${item.product.name}</td>
                                    <td>₹${item.price.toFixed(2)}</td>
                                     <td>${item.quantity}</td>
                                      <td>${item.size}</td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                </td>
            </tr>
               <tr>
                <th>Shipping Method</th>
                <td>${order.shipping_Method}</td>
            </tr>
            <tr>
                <th>Total</th>
                <td>₹${order.total_Amount.toFixed(2)}</td>
            </tr>
        </table>
    `);
  }

  // Close modal when the close button is clicked
  $(".close-btn").click(function () {
    $("#orderModal").hide();
  });


  $('#searchInput').on('input', function() {
    searchquery = $(this).val();
    // console.log(searchquery);
    fetchOrders(sellerID, token, currentPage, rowsPerPage, event, searchquery)
});


});

// Function to convert status
function statusConversion(status) {
  switch (status) {
    case 0:
      return "Pending";
    case 1:
      return "Processing";
    case 2:
      return "Shipped";
    case 3:
      return "Delivered";
    case 4:
      return "Canceled";
    case 5:
      return "Refunded";
    case 6:
      return "Failed";
    default:
      return "Unknown";
  }
}


