import { getCustomerInfo, getLoginInfo } from "./Utils/auth.js";

// window.onbeforeunload = function() {
//   // Clear local storage
//   localStorage.clear();
// };

async function LoadContent() {
  try {
    const headerResponse = await fetch("../pages/header.html");
    if (!headerResponse.ok) {
      throw new Error("Failed to fetch header");
    }
    const headerHtml = await headerResponse.text();
    document.getElementsByClassName("header")[0].innerHTML = headerHtml;
  } catch (error) {
    console.error("Error fetching header:", error);
  }

  try {
    const footerResponse = await fetch("../pages/footer.html");
    if (!footerResponse.ok) {
      throw new Error("Failed to fetch footer");
    }
    const footerHtml = await footerResponse.text();
    document.getElementsByClassName("footer")[0].innerHTML = footerHtml;
  } catch (error) {
    console.error("Error fetching footer:", error);
  }
}

function addCloseCartListener() {
  const closeCartBtn = document.querySelector(".close-cart");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartElement = cartOverlay.querySelector(".cart");

  closeCartBtn.addEventListener("click", function () {
    cartElement.classList.remove("active");
    setTimeout(() => {
      cartOverlay.classList.remove("active");
    }, 300);
  });
}

document.addEventListener("DOMContentLoaded", async function (event) {
  await LoadContent();
  $('#searchInput').hide();
  $('.cancel-btn').hide();
  $('#HeaderSearch1').hide();

  $('#HeaderSearch').click(function(event) {
    event.preventDefault();
    $('.nav-bar').addClass('search-bar');
    $('.menu, .nav-icons').hide();
    $('.logo').hide();
    $('#searchInput').show();
    $('#HeaderSearch1').show();
    $('.cancel-btn').show();
    $('#searchInput').focus(); // Automatically focus on the search input
  });

  $('.cancel-btn').click(function() {
    $('.cancel-btn').hide();
    $('.nav-bar').removeClass('search-bar');
    $('.menu, .nav-icons').show();
    $('.logo').show();
    $('#HeaderSearch1').hide();
    $('#searchInput').hide();

    $('#searchInput').val(''); // Clear the search input field if needed
  });

  $('#HeaderSearch1').click(function(event) {
    event.preventDefault();
    const value = $('#searchInput').val();
    console.log(value);
    localStorage.setItem('query', value);
    window.location.href = './product.html';
  });

  const sideMenu = document.querySelector(".side-menu");
  const menuToggle = document.querySelector(".menu-toggle");
  const closeBtn = document.querySelector(".close-btn");

  // Menu Toggle Open Close
  menuToggle.addEventListener("click", function () {
    sideMenu.classList.add("open");
  });

  closeBtn.addEventListener("click", function () {
    sideMenu.classList.remove("open");
  });

  const cartOverlay = document.getElementById("cartOverlay");
  const cartElement = cartOverlay.querySelector(".cart");
  const cartToggleBtn = document.querySelector(".cart-btn");
  const profileBtn = document.querySelector(".profile-btn");
  const logo = document.querySelector(".logo");

  //Check cart Login

  logo.addEventListener("click", function () {
    window.location = "./index.html";
  });

  cartToggleBtn.addEventListener("click", async function (event) {
    cartOverlay.classList.add("active");
    cartElement.classList.add("active");
    // setTimeout(() => {
    //   cartElement.classList.add("active");
    // }, 0);
    await GetCartItems(event);
  });

  profileBtn.addEventListener("click", function () {
    var userDetails = getLoginInfo();
    // console.log(userDetails);
    if (userDetails == null) {
      window.location.href = "./login.html";
    } else {
      window.location.href = "./profile.html";
    }
  });

  const headers = document.querySelectorAll(".footer-header");

  headers.forEach((header) => {
    header.addEventListener("click", () => {
      const parentSection = header.parentElement;
      parentSection.classList.toggle("active");
      const content = header.nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    });
  });

  const widthMatch = window.matchMedia("(min-width: 768px)");
  function handleWidthChange(mm) {
    if (mm.matches) {
      headers.forEach((header) => {
        const parentSection = header.parentElement;
        parentSection.classList.add("active");
        const content = header.nextElementSibling;
        content.style.display = "block";
        header.disabled = true;
      });
    } else {
      headers.forEach((header) => {
        const parentSection = header.parentElement;
        parentSection.classList.remove("active");
        const content = header.nextElementSibling;
        content.style.display = "none";
        header.disabled = false;
      });
    }
  }

  handleWidthChange(widthMatch);

  widthMatch.addEventListener("change", handleWidthChange);

  await fetch("../pages/modal.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("modalContainer").innerHTML = html;
    });
});

//Toast

let icon = {
  success: '<span class="material-symbols-outlined">✓</span>',
  danger: '<span class="material-symbols-outlined">error</span>',
  warning: '<span class="material-symbols-outlined">warning</span>',
  info: '<span class="material-symbols-outlined">info</span>',
};

const showToast = (
  message = "Sample Message",
  toastType = "info",
  duration = 5000
) => {
  if (!Object.keys(icon).includes(toastType)) toastType = "info";

  let box = document.createElement("div");
  box.classList.add("toast", `toast-${toastType}`);
  box.innerHTML = ` <div class="toast-content-wrapper"> 
                    <div class="toast-icon"> 
                    ${icon[toastType]} 
                    </div> 
                    <div class="toast-message">${message}</div> 
                    <div class="toast-progress"></div> 
                    </div>`;
  duration = duration || 5000;
  box.querySelector(".toast-progress").style.animationDuration = `${
    duration / 1000
  }s`;

  let toastAlready = document.body.querySelector(".toast");
  if (toastAlready) {
    toastAlready.remove();
  }

  document.body.appendChild(box);
};

export function ShowToastNotification(event, type, message) {
  event.preventDefault();
  showToast(message, type, 3000);
}

var cartData;

async function GetCartItems(event) {
  const userDetails = getLoginInfo();
  const customerInfo = getCustomerInfo();
  const cartOverlay = document.getElementById("cartOverlay");
  const cartElement = cartOverlay.querySelector(".cart");

  if (userDetails == null || customerInfo == null) {
    cartElement.innerHTML = `
      <div class="cart-header">
        <h2>Bag</h2>
        <button class="close-cart">X</button>
      </div>
      <div class="cart-body">
        <h3><a href='./login.html'>Login / SignUp </a></h3>
      </div>`;
    addCloseCartListener();
    return;
  }

  const customerID = customerInfo.CustomerID;
  const token = userDetails.token;

  $.ajax({
    url: `http://localhost:5083/api/CustomerCart/GetCart?customerID=${customerID}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: async function (response) {
      // console.log(response.code);
      cartData = response;
      const cartItemsHtml = await Promise.all(
        cartData.cartItems.map(async (item) => {
          const imageUrl = await fetchImage(item.product.image_URL);
          return `
          <div class="cart-item">
            <img src="${imageUrl}" alt="Product Image">
            <div class="item-details">
              <p>${item.product.name}</p>
              <p>Size: ${item.size}</p>
              <div class="quantity">
                <button class="quantity-btn" data-action="decrease" data-id="${item.cartItemID}">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" data-action="increase" data-id="${item.cartItemID}">+</button>
              </div>
              <p class="price">INR ${item.price}</p>
            </div>
          </div>`;
        })
      );

      const subtotal = cartData.cartItems.reduce(
        (sum, item) => sum + item.price,
        0
      );

      cartElement.innerHTML = `
        <div class="cart-header">
          <h2>Bag</h2>
          <button class="close-cart">X</button>
        </div>
          ${cartItemsHtml}
        <div class="cart-summary">
          <h3 class="price">Subtotal: INR ${subtotal}</h3>
          <p>Shipping, taxes, and discount codes calculated at checkout.</p>
          <button id="checkoutButton" class="checkout-button">Proceed to Checkout</button>
        </div>`;
      addCloseCartListener();
      // Add event listeners for quantity buttons
      $(".quantity-btn").click(function (event) {
        const action = $(this).data("action");
        const id = $(this).data("id");
        updateQuantity(id, action, event);
      });

      initModal(); // Initialize the modal functionality after loading it
    },
    error: function (xhr, status, error) {
      if (xhr.responseJSON.message === "Cart with given ID Not Found!") {
        cartElement.innerHTML = `
        <div class="cart-header">
          <h2>Bag</h2>
          <button class="close-cart">X</button>
        </div>
        <div class="cart-body">
           <h4>No items in cart!</h4>
           <h3><a href='./product.html'>Add Items</a></h3>
        </div>`;
        addCloseCartListener();
        return;
      }
      ShowToastNotification(event, "danger", "Something went wrong!");
    },
  });
}

function updateQuantity(id, action, event) {
  var userDetails = getLoginInfo();
  const item = cartData.cartItems.find((item) => item.cartItemID === id);
  if (!item) {
    console.error("Item not found in cart");
    return;
  }

  let newQuantity = item.quantity;
  if (action === "increase") {
    newQuantity += 1;
  } else if (action === "decrease" && newQuantity > 0) {
    newQuantity -= 1;
  }

  if (newQuantity < 0) {
    newQuantity = 0;
  }

  $.ajax({
    url: `http://localhost:5083/api/CustomerCart/UpdateCartItemQuantity?CartItemID=${id}&Quantity=${newQuantity}`,
    method: "PUT",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${userDetails.token}`,
    },
    success: function (response) {
      // Update the cart HTML
      GetCartItems();
    },
    error: function (xhr, status, error) {
      console.error("Failed to update item quantity:", error);
      ShowToastNotification(event, "danger", "Failed to update item quantity!");
    },
  });
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

function initModal() {
  const checkoutButton = document.getElementById("checkoutButton");
  const modal = document.getElementById("modal");
  const modalContent = modal.querySelector(".modal-content");
  const steps = modal.querySelectorAll(".step");
  const stepContents = modal.querySelectorAll(".step-content");
  const continueButtons = modal.querySelectorAll(".continue-button");
  const addressForm = document.getElementById("address-form");

  const cartOverlay = document.getElementById("cartOverlay");
  const cartElement = cartOverlay.querySelector(".cart");

  checkoutButton.addEventListener("click", function (event) {
    modal.classList.add("show");
    setTimeout(() => {
      modalContent.classList.add("show");
    }, 10); // Slight delay to ensure the modal is visible before the content slides in
    cartElement.classList.remove("active");
    setTimeout(() => {
      cartOverlay.classList.remove("active");
    }, 300);

    GetCartItemsForCheckout(event);
  });

  steps.forEach((step) => {
    step.addEventListener("click", function (event) {
      if (validateForm(addressForm)) {
        const targetStep = step.dataset.step;
        showStep(targetStep);
      } else {
        ShowToastNotification(
          event,
          "warning",
          "Please fill all required fields!"
        );
      }
    });
  });

  continueButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      if (validateForm(addressForm)) {
        const nextStep = button.dataset.next;
        showStep(nextStep);
      } else {
        ShowToastNotification(
          event,
          "warning",
          "Please fill all required fields!"
        );
      }
    });
  });

  function showStep(step) {
    steps.forEach((s) => s.classList.remove("active"));
    stepContents.forEach((sc) => sc.classList.remove("active"));
    document
      .querySelector(`.step[data-step="${step}"]`)
      .classList.add("active");
    document.getElementById(step).classList.add("active");
  }

  function validateForm(form) {
    const requiredFields = form.querySelectorAll("[required]");
    for (let field of requiredFields) {
      if (!field.value.trim()) {
        field.focus();
        return false;
      }
    }
    return true;
  }

  // Optional: Close the modal when clicking outside of it
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modalContent.classList.remove("show");
      setTimeout(() => {
        modal.classList.remove("show");
      }, 300); // Slight delay to match the transition duration
    }
  });

  var shippingMethod = document.getElementById("shipping-method");

  shippingMethod.addEventListener("change", function (event) {
    if (shippingMethod.value === "express") {
      document.getElementById("ship-cost").innerHTML = "Shipping: ₹100";
    } else {
      document.getElementById("ship-cost").innerHTML = "Shipping: Free";
    }
  });

  const PaymentButton1 = document.querySelector("#payment-btn");
  const PaymentButton2 = document.querySelector("#payment-btn1");
  const OrderButton = document.querySelector("#order-btn");

  PaymentButton1.addEventListener("click", async function (event) {
    try {
      const result = await PlaceOrder(event);
      if (result && result.orderID) {
        await MakePayment(event, result.orderID, "UPI");
      } else {
        console.error("Invalid orderID returned from PlaceOrder:", result);
      }

      modalContent.classList.remove("show");
      setTimeout(() => {
        modal.classList.remove("show");
      }, 300);
    } catch (error) {
      console.error("Error placing order or making payment:", error);
    }
  });

  PaymentButton2.addEventListener("click", async function (event) {
    try {
      const result = await PlaceOrder(event);
      if (result && result.orderID) {
        await MakePayment(event, result.orderID, "Card");
      } else {
        console.error("Invalid orderID returned from PlaceOrder:", result);
      }

      modalContent.classList.remove("show");
      setTimeout(() => {
        modal.classList.remove("show");
      }, 300);
    } catch (error) {
      console.error("Error placing order or making payment:", error);
    }
  });

  OrderButton.addEventListener("click", async function (event) {
    try {
      const result = await PlaceOrder(event);
      modalContent.classList.remove("show");
      setTimeout(() => {
        modal.classList.remove("show");
      }, 300);
    } catch (error) {
      console.error("Error placing order or making payment:", error);
    }
  });
}

async function GetCartItemsForCheckout(event) {
  const userDetails = getLoginInfo();
  const customerInfo = getCustomerInfo();

  if (userDetails == null || customerInfo == null) {
    return;
  }

  const customerID = customerInfo.CustomerID;
  const token = userDetails.token;

  $.ajax({
    url: `http://localhost:5083/api/CustomerCart/GetCart?customerID=${customerID}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: async function (response) {
      cartData = response;
      // console.log(response);
      const rightSection = document.querySelector(".right-section");
      const cartItemsHtml = await Promise.all(
        cartData.cartItems.map(async (item) => {
          const imageUrl = await fetchImage(item.product.image_URL);
          return `
            <div class="item">
                    <img src="${imageUrl}" alt="Item image">
                    <div class="details">
                        <p>${item.product.name}</p>
                        <p>Price: ₹${item.price}</p>
                        <p>Size: ${item.quantity}</p>
                        <p>Quantity: ${item.size}</p>
                    </div>
                </div>`;
        })
      );

      const subtotal = cartData.cartItems.reduce(
        (sum, item) => sum + item.price,
        0
      );

      const paybtns = document.querySelectorAll(".payment-button");
      const options = [
        `Pay via UPI ₹${subtotal}`,
        `Pay via Card ₹${subtotal}`,
        `Cash on Delivery ₹${subtotal}`,
      ];
      var i = 0;
      paybtns.forEach((element) => {
        element.innerHTML = options[i];
        i++;
      });

      rightSection.innerHTML = `
       <div class="order-summary">
                <h3>Order Summary</h3>
                ${cartItemsHtml}
                <div class="totals">
                    <p>Subtotal: ₹${subtotal}</p>
                    <p id="ship-cost">Shipping: Free</p>
                    <p>Total: ₹${subtotal}</p>
                </div>
            </div>`;
    },
    error: function (xhr, status, error) {
      ShowToastNotification(event, "danger", "Something went wrong!");
    },
  });
}

async function PlaceOrder(event) {
  const userDetails = getLoginInfo();
  const customerInfo = getCustomerInfo();

  if (userDetails == null || customerInfo == null) {
    ShowToastNotification(event, "danger", "User or customer info missing!");
    throw new Error("User or customer info missing");
  }

  const customerID = customerInfo.CustomerID;
  const token = userDetails.token;
  const address = document.getElementById("address-field");
  const shippingMethod = document.getElementById("shipping-method");
  let shippingCost = shippingMethod.value === "express" ? 100 : 0;

  return new Promise((resolve, reject) => {
    $.ajax({
      url: `http://localhost:5083/api/CustomerOrder/PlaceOrder`,
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
      data: JSON.stringify({
        customerID: customerID,
        address: address.value,
        shipping_Method: shippingMethod.value,
        shipping_Cost: shippingCost,
      }),
      success: function (response) {
        console.log(response);
        ShowToastNotification(event, "success", "Order Placed!");
        resolve(response);
      },
      error: function (xhr, status, error) {
        ShowToastNotification(event, "danger", "Something went wrong!");
        reject(error);
      },
    });
  });
}

async function MakePayment(event, OrderID, paymentMethod) {
  const userDetails = getLoginInfo();
  const customerInfo = getCustomerInfo();

  if (userDetails == null || customerInfo == null) {
    ShowToastNotification(event, "danger", "User or customer info missing!");
    throw new Error("User or customer info missing");
  }

  const customerID = customerInfo.CustomerID;
  const token = userDetails.token;

  return new Promise((resolve, reject) => {
    $.ajax({
      url: `http://localhost:5083/api/CustomerPayment/MakePayment`,
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
      data: JSON.stringify({
        orderID: OrderID,
        payment_Method: paymentMethod,
      }),
      success: function (response) {
        console.log(response);
        ShowToastNotification(event, "success", "Payment Successful!");
        resolve(response);
      },
      error: function (xhr, status, error) {
        ShowToastNotification(event, "danger", "Something went wrong!");
        reject(error);
      },
    });
  });
}
