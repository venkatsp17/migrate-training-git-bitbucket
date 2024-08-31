import { saveCustomerInfo, saveLoginInfo, saveSellerInfo } from './Utils/auth.js';
import { ShowToastNotification } from './common.js';

document.addEventListener("DOMContentLoaded", function () {
  const customerBtn = document.getElementById("customerBtn");
  const sellerBtn = document.getElementById("sellerBtn");
  const customerLogin = document.getElementById("customerLogin");
  const sellerLogin = document.getElementById("sellerLogin");

  customerBtn.addEventListener("click", function () {
    customerLogin.style.display = "block";
    sellerLogin.style.display = "none";
    customerBtn.classList.add("active");
    sellerBtn.classList.remove("active");
  });

  sellerBtn.addEventListener("click", function () {
    sellerLogin.style.display = "block";
    customerLogin.style.display = "none";
    sellerBtn.classList.add("active");
    customerBtn.classList.remove("active");
  });

  // Ensure animations are applied after content is loaded
  document.body.style.opacity = "1";
});

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

document.getElementById("customer-form").addEventListener("submit", async function (event) {
  event.preventDefault();
  const customerEmailInput = document.getElementById("customer-email").value;
  const customerPasswordInput = document.getElementById("customer-password").value;

  if (!customerEmailInput || !customerPasswordInput) {
    ShowToastNotification(event, "warning", "Please fill in all required fields.");
    return;
  }

  if (!isValidEmail(customerEmailInput)) {
    ShowToastNotification(event, "warning", "Please enter a valid email address.");
    return;
  }

  await fetch("http://localhost:5083/api/User/Customerlogin", {
    method: "POST",
    body: JSON.stringify({
      email: customerEmailInput,
      password: customerPasswordInput,
    }),
    headers: { 
      "Content-type": "application/json; charset=UTF-8"
    }
  }).then(response => response.json())
    .then(async function(result) {
      if(result.token == undefined){
        ShowToastNotification(event, "danger", result.message);
        return;
      }
      saveLoginInfo(result);
      const id = result.id;
      const token = result.token;

      const customerID = await FetchCustomerID(id, token);
      saveCustomerInfo({ CustomerID: customerID });


      ShowToastNotification(event, "success", "Login Successfull!");
      setTimeout(()=>{
        const returnUrl = localStorage.getItem('returnUrl');
        if (returnUrl) {
          localStorage.removeItem('returnUrl'); 
          window.location.replace(returnUrl);
        } else {
          window.location.replace('./index.html');
        }
     
      }, 3000);
     
    })
    .catch(error => {
      console.log(error);
      ShowToastNotification(event, "danger", error);
    });
});
















document.getElementById("seller-form").addEventListener("submit", async function (event) {
  event.preventDefault();
  const sellerEmailInput = document.getElementById("seller-email").value;
  const sellerPasswordInput = document.getElementById("seller-password").value;

  if (!sellerEmailInput || !sellerPasswordInput) {
    ShowToastNotification(event, "warning", "Please fill in all required fields.");
    return;
  }

  if (!isValidEmail(sellerEmailInput)) {
    ShowToastNotification(event, "warning", "Please enter a valid email address.");
    return;
  }

  await fetch("http://localhost:5083/api/User/Sellerlogin", {
    method: "POST",
    body: JSON.stringify({
      email: sellerEmailInput,
      password: sellerPasswordInput,
    }),
    headers: { 
      "Content-type": "application/json; charset=UTF-8"
    }
  }).then(response => response.json())
    .then(async function(result) {
      if(result.token == undefined){
        ShowToastNotification(event, "danger", result.message);
        return;
      }
      saveLoginInfo(result);

      const id = result.id;
      const token = result.token;

      const sellerInfo = await FetchSellerID(id, token);
      console.log(sellerInfo);
      saveSellerInfo(sellerInfo);

      ShowToastNotification(event, "success", "Login Successfull!");
      setTimeout(()=>{
        const returnUrl = localStorage.getItem('returnUrl');
        if (returnUrl) {
          localStorage.removeItem('returnUrl'); 
          window.location.replace(returnUrl);
        } else {
          window.location.replace('./seller/SellerHome.html');
        }
      });
    }).catch(error => {
      ShowToastNotification(event, "danger", "Something went wrong!");
    });
});

document.getElementById("customer-email-signin").addEventListener("click", function () {
  const queryString = new URLSearchParams({role:0}).toString();
  window.location.href = `./register.html?${queryString}`;
});

document.getElementById("seller-email-signin").addEventListener("click", function () {
    const queryString = new URLSearchParams({role:1}).toString();
    window.location.href = `./register.html?${queryString}`;
});





async function FetchCustomerID(id, token) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `http://localhost:5083/api/User/GetCustomerProfile?UserID=${id}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      success: function(response) {
        resolve(response.customerID);
      },
      error: function(xhr, status, error) {
        console.error('Error fetching image:', error);
        resolve(0); // or reject(error) if you want to handle the error differently
      }
    });
  });
}


async function FetchSellerID(id, token) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `http://localhost:5083/api/User/GetSellerProfile?UserID=${id}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      success: function(response) {
        resolve(response);
      },
      error: function(xhr, status, error) {
        console.error('Error fetching image:', error);
        resolve(0); // or reject(error) if you want to handle the error differently
      }
    });
  });
}

