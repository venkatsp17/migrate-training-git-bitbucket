import { getLoginInfo, getSellerInfo} from "../Utils/auth.js";
import { ShowToastNotification } from "./SellerCommon.js";

$(document).ready(async function () {

    async function loadSellerInfo() {
        var userDetails = getLoginInfo();
        var sellerInfo1 = getSellerInfo();
        if (sellerInfo1 == null || userDetails == null) {
            window.localStorage.setItem("returnUrl", window.location.href);
            window.location.replace("../login.html");
            return;
        }
        const id = userDetails.id;
        const token = userDetails.token;
        const sellerInfo = await FetchSellerID(id, token);
        console.log(sellerInfo);

        // Update greeting
        $('#greeting').text(`Good Evening! ${sellerInfo.name}`);
        const imageUrl = await fetchImage(sellerInfo.profile_Picture_URL);
        // Update profile picture
        $('#profile-picture').attr('src', imageUrl);

        // Update profile info
        $('#name').text(sellerInfo.name);
        $('#address').text(sellerInfo.address);
        $('#email').text(sellerInfo.email);
        $('#phone-number').text(sellerInfo.phone_Number);
        // Assuming birthdate and gender are also part of sellerInfo
        $('#birthdate').text(sellerInfo.birthdate || 'N/A');
        $('#gender').text(sellerInfo.gender || 'N/A');
    }

    await loadSellerInfo();

    // Function to fetch image
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

    // Function to make fields editable
    function makeFieldsEditable() {
        $('.profile-values').each(function () {
            const value = $(this).text();
            const input = $('<input>', {
                type: 'text',
                value: value,
                class: 'editable-input'
            });
            $(this).replaceWith(input);
        });
        $('#edit-icon').hide();
        $('<button>', {
            text: 'Save',
            id: 'save-btn',
            click: function(e) {
                saveChanges(e);
            }
        }).insertAfter('#edit-icon');
    }

    // Function to validate input fields
    function validateInputs() {
        let isValid = true;
        $('.editable-input').each(function () {
            if ($(this).val().trim() === '') {
                isValid = false;
                $(this).css('border-color', 'red');
            } else {
                $(this).css('border-color', '');
            }
        });
        return isValid;
    }

    // Function to save changes
    async function saveChanges(e) {
        if (!validateInputs()) {
            alert('Please fill in all fields.');
            return;
        }
        var userDetails = getLoginInfo();
        var sellerInfo = getSellerInfo();
        if (sellerInfo == null || userDetails == null) {
            window.localStorage.setItem("returnUrl", window.location.href);
            window.location.replace("../login.html");
            return;
        }

        const updatedInfo = {
            sellerID: sellerInfo.sellerID,  // Replace with actual seller ID if dynamic
            name: $('input:eq(0)').val(),
            address: $('input:eq(1)').val(),
            email: $('input:eq(2)').val(),
            phone_Number: $('input:eq(3)').val(),
            birthdate: $('input:eq(4)').val(),
            gender: $('input:eq(5)').val(),
            profile_Picture_URL: 'seller1.jpg'  // Replace with actual value if needed
        };

        try {
            const token = userDetails.token;
            const response = await $.ajax({
                url: 'http://localhost:5083/api/User/UpdateSellerProfile',
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(updatedInfo),
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            ShowToastNotification(e, "success", "Profile Updated!");
            location.reload(); 
        } catch (error) {
            ShowToastNotification(e, "danger", "Something went wrong!");
        }
    }

    // Add event listener to the edit icon
    $('#edit-icon').click(makeFieldsEditable);
});



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