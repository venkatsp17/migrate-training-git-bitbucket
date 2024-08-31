import { getLoginInfo, getSellerInfo } from "../Utils/auth.js";
import { ShowToastNotification } from "./SellerCommon.js";

$(document).ready(async function () {
  let products = [];
  let currentPage = 1;
  let rowsPerPage = 10;
  var searchQuery = "";

  function fetchProducts(page, limit, searchQuery) {
    var userDetails = getLoginInfo();
    var sellerInfo = getSellerInfo();
    if (userDetails == null || sellerInfo == null) {
      window.location.href = "../login.html";
      return;
    }
    const token = userDetails.token;
    var offset =  (page - 1) * limit;
    if(searchQuery==""){
      // console.log("searchquery");
      searchQuery="null";
    }
    else{
      offset=0;
    }
    $.ajax({
      url: `http://localhost:5083/api/SellerProduct/ViewAllProducts?SellerID=1&offset=${offset}&limit=${limit}&searchQuery=${searchQuery}`,
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
      success:async function (response) {
        products = response.items;
        await displayProducts(products);
        updatePagination(response.totalCount);
      },
    }); 
  }

  async function displayProducts(products) {
    const tbody = $("#productTableBody");
    tbody.empty();
    const imageUrls = await Promise.all(products.map(product => fetchImage(product.image_URL)));
    products.forEach((product, index) => {
      const imageUrl = imageUrls[index];
      const row = `
                <tr>
                    <td><b>${product.productID}</b></td>
                    <td><img src="${imageUrl}" alt="${
        product.name
      }" height="50" width="50"></td>
                    <td>${product.name}</td>
                    <td><span class="status active">Active</span></td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td>${product.stock_Quantity}</td>
                    <td><i class="fa-solid fa-eye table-button view-btn" data-id="${
                      product.productID
                    }"></i></td>
                    <td><i class="fa-solid fa-pen-to-square table-button edit-btn" data-id="${
                      product.productID
                    }"></i></td>
                </tr>
            `;
      tbody.append(row);
    });
  }

  function updatePagination(totalCount) {
    const totalPages = Math.ceil(totalCount / rowsPerPage);
    $("#pageNumber").text(`${currentPage}/${totalPages}`);
    $(".text-gray").text(
      `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
        currentPage * rowsPerPage,
        totalCount
      )} of ${totalCount}`
    );

    $("#prevPage").prop("disabled", currentPage <= 1);
    $("#nextPage").prop("disabled", currentPage >= totalPages);
  }

  $("#rowsPerPage").on("change", function () {
    rowsPerPage = $(this).val();
    currentPage = 1;
    fetchProducts(currentPage, rowsPerPage, searchQuery);
  });

  $("#prevPage").on("click", function () {
    if (currentPage > 1) {
      currentPage--;
      fetchProducts(currentPage, rowsPerPage, searchQuery);
    }
  });

  $("#nextPage").on("click", function () {
    currentPage++;
    fetchProducts(currentPage, rowsPerPage, searchQuery);
  });

  $(document).on("click", ".view-btn", function () {
    const productID = $(this).data("id");
    const product = products.find((p) => p.productID === productID);
    if (product) {
      $("#viewProductID").text(product.productID);
      $("#viewProductName").text(product.name);
      $("#viewProductDescription").text(product.description);
      $("#viewProductPrice").text(`$${product.price.toFixed(2)}`);
      $("#viewProductBrand").text(product.brand);
      $("#viewProductCategory").text(product.categoryID);
      $("#viewProductStock").text(product.stock_Quantity);
      $("#productViewModal").show();
    }
  });

  $(document).on("click", ".edit-btn", function () {
    const productID = $(this).data("id");
    const product = products.find((p) => p.productID === productID);
    if (product) {
      $("#editProductID").val(product.productID);
      $("#editProductName").val(product.name);
      $("#editProductPrice").val(product.price);
      $("#editProductStock").val(product.stock_Quantity);
      $("#productEditModal").show();
    }
  });

  $("#editProductForm").on("submit", async function (e) {
    e.preventDefault();
    var userDetails = getLoginInfo();
    var sellerInfo = getSellerInfo();
    if (sellerInfo == null || userDetails == null) {
      window.localStorage.setItem("returnUrl", window.location.href);
      window.location.replace("./login.html");
      return;
    }
    const token = userDetails.token;

    const productID = $("#editProductID").val();
    const updatedProduct = {
      productID: productID,
      price: parseFloat($("#editProductPrice").val()),
      stock_Quantity: parseInt($("#editProductStock").val()),
    };

    var valid = 0;

    await $.ajax({
      url: `http://localhost:5083/api/SellerProduct/UpdateProductPrice?NewPrice=${updatedProduct.price}&ProductID=${updatedProduct.productID}`,
      method: "PUT",
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      success: function () {
        valid++;
      },
      error: function (error) {
        console.error("Error updating product:", error);
      },
    });

    await $.ajax({
      url: `http://localhost:5083/api/SellerProduct/UpdateProductStock?stock=${updatedProduct.stock_Quantity}&ProductID=${updatedProduct.productID}`,
      method: "PUT",
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      success: function () {
        valid++;
      },
      error: function (error) {
        console.error("Error updating product:", error);
      },
    });

    if (valid == 2) {
      $("#productEditModal").hide();
      fetchProducts(currentPage, rowsPerPage, searchQuery);
      ShowToastNotification(e, "success", "Product Updated!");
    } else {
      ShowToastNotification(e, "danger", "Something went wrong!");
    }
  });

  $(".product-close-btn").on("click", function () {
    $(this).closest(".product-modal").hide();
  });

  $(".add-button").on("click", function () {});

  fetchProducts(currentPage, rowsPerPage, searchQuery);

  await AddProductModal();

  $('#searchInput').on('input', function() {
    searchQuery = $(this).val();
    // console.log(searchquery);
    fetchProducts(currentPage, rowsPerPage, searchQuery);
});
});

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

async function AddProductModal() {
  // Open modal
  $("#openModal").click(function () {
    $("#productModal").addClass("show");
  });

  // Close modal
  $(".close").click(function () {
    $("#productModal").removeClass("show");
    setTimeout(() => {
      $("#productModal").css("display", "none");
    }, 300);
  });

  // Close modal when clicking outside of modal content
  $(window).click(function (event) {
    if (event.target.id === "productModal") {
      $("#productModal").removeClass("show");
      setTimeout(() => {
        $("#productModal").css("display", "none");
      }, 300);
    }
  });


  const categories = [
    { id: 1, name: "Men's Clothing" },
    { id: 2, name: "Women's Clothing" },
    { id: 3, name: "Kids' Clothing" },
    { id: 4, name: "Footwear" },
    { id: 7, name: "Watches" },
    { id: 12, name: "Accessories" }
];
  categories.forEach((category) => {
    $("#category").append(new Option(category.name, category.id));
  });

  // Handle form submission
  $("#productForm").submit(async function (event) {
    event.preventDefault();
    let isValid = true;

    const sellerInfo = getSellerInfo();
    const userDetails = getLoginInfo();
    if (sellerInfo == null || userDetails == null) {
      window.localStorage.setItem("returnUrl", window.location.href);
      window.location.replace("../login.html");
      return;
    }
    const sellerID = sellerInfo.sellerID;
    const token = userDetails.token;

    // Clear previous error messages
    $(".error").text("");

    // Validate form fields
    if ($("#name").val().trim() === "") {
      $("#nameError").text("Product name is required.");
      isValid = false;
    }
    if ($("#description").val().trim() === "") {
      $("#descriptionError").text("Description is required.");
      isValid = false;
    }
    if ($("#price").val().trim() === "" || parseFloat($("#price").val()) < 0) {
      $("#priceError").text("Price must be a positive number.");
      isValid = false;
    }
    if ($("#category").val() === null) {
      $("#categoryError").text("Category is required.");
      isValid = false;
    }
    if ($("#brand").val().trim() === "") {
      $("#brandError").text("Brand is required.");
      isValid = false;
    }
    if (
      $("#stock_Quantity").val().trim() === "" ||
      parseInt($("#stock_Quantity").val()) < 0
    ) {
      $("#stockQuantityError").text(
        "Stock quantity must be a positive number."
      );
      isValid = false;
    }

    var data;

    if ($('#profile_picture_url')[0].files.length != 0) {
        const formData = new FormData();
        formData.append('file', profile_picture_url.files[0]);

        try {
            const response = await fetch('http://localhost:5083/api/ImageAPI/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
              ShowToastNotification(event, "danger", "Something went wrong!");
            }

            data = await response.json();
            ShowToastNotification(event, "success", "Image Upload Successfull!");
        } catch (error) {
            ShowToastNotification(event, "danger", "Something went wrong!");
        }
    }


      setTimeout(()=>{
      }, 3000);

    if (isValid) {
      const formData = {
        sellerID: sellerID,
        name: $("#name").val(),
        description: $("#description").val(),
        price: $("#price").val(),
        categoryID: $("#category").val(),
        brand: $("#brand").val(),
        stock_Quantity: $("#stock_Quantity").val(),
        image_URL:(data.imageId).toString() || ""
      };
      $.ajax({
        url: "http://localhost:5083/api/SellerProduct/AddProduct",
        type: "POST",
        data: JSON.stringify(formData),
        contentType: "application/json",
        headers: {
            "Authorization": `Bearer ${token}`, 
         
        },
        success: function (response) {
            ShowToastNotification(event, "success", "Product added!");
            $("#productModal").removeClass("show");
            setTimeout(() => {
                $("#productModal").css("display", "none");
            }, 3000);
        },
        error: function () {
            ShowToastNotification(event, "danger", "Something went wrong!");
        }
    });
    }
  });
}



document
  .getElementById("profile_picture_url")
  .addEventListener("change", function () {
    const fileLabel = this.nextElementSibling;
    const fileName = this.files.length > 0 ? this.files[0].name : "Choose File";
    fileLabel.textContent = fileName;

    const thumbnailContainer = document.getElementById("thumbnail-container");
    thumbnailContainer.innerHTML = ""; // Clear previous thumbnail

    if (this.files.length > 0) {
      const file = this.files[0];
      const reader = new FileReader();

      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        thumbnailContainer.appendChild(img);
      };

      reader.readAsDataURL(file);
    }
  });