import { getCustomerInfo, getLoginInfo } from "./Utils/auth.js";
import { ShowToastNotification } from './common.js';

var CustomerID = "";
var size=0;

// On Page Loaded
$(document).ready(async function () {
  // Getting productData stored in local storage from previous page
  const productData = JSON.parse(localStorage.getItem("ProductInfo"));
  console.log(productData);
  // Change Sizes if it is Shoes
  ChangeSizes(productData);
  // Load Product Content
  if (productData) {
    LoadContent(productData);
  }
  // Button Click Functionality
  const buttons = $('.sizes button');
  buttons.on('click', function() {
     size = $(this).text();
     $('.sizes button').removeClass('active');

     $(this).addClass('active');
  });

 
// Add to Cart Click funtionality
  $(".add-to-cart").click(async function(event){
    const CustomerInfo = getCustomerInfo();
    const userDetails = getLoginInfo();
    if(CustomerInfo == null || userDetails == null){
      window.localStorage.setItem('returnUrl', window.location.href);
      window.location.replace('./login.html');
      return;
   }
   if(size==0){
    ShowToastNotification(event, "warning", "Select a size");
    return;
  }
    const token = userDetails.token;
    CustomerID = CustomerInfo.CustomerID;
    await addToCart(productData, token, event);
    $(".cart-btn").click();
  });
  

});



async function addToCart(product, token, event) {
   await $.ajax({
        url: `http://localhost:5083/api/CustomerCart/AddItemToCart?CustomerID=${CustomerID}`, 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        data: JSON.stringify({
            productID: product.productID,
            quantity: 1,
            size: size
        }),
        success: function(response, status, xhr) {
            // response = JSON.parse(response);
            console.log('Product added to cart:', response);
            ShowToastNotification(event, "success", "Item added!");
        },
        error: function(xhr, status, error) {
          ShowToastNotification(event, "danger", "Something went wrong!");
            console.error('Error adding product to cart:', error);
        }
    });
}

async function LoadContent(productData){
    const imageUrl = await fetchImage(productData.image_URL);
    $("#product-img").attr("src", `${imageUrl}`); // Update the image URL to your actual endpoint
    $("#product-title").text(productData.name);
    $("#product-brand").text(productData.brand);
    $("#product-price").text(`INR ${productData.price}`);
    $(".product-description").text(productData.description);
}

async function fetchImage(imageId) {
  const response = await fetch(
    `http://localhost:5083/api/ImageAPI/${imageId}`,
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        // Authorization: `Bearer ${token}`,
      },
    }
  );
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}


function ChangeSizes(productData){
      const buttons = $('.sizes button');
      if(productData.categoryID == 4){
        var i=8;
        buttons.each(function() {
            $(this).text(i);
            i++;
      });
      }
      else{
        var i=0;
        const sizes = ['S','M','L','XL','XXL'];
        buttons.each(function() {
          $(this).text(sizes[i]);
          i++;
    });
  }
}