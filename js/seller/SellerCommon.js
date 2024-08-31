// window.onbeforeunload = function() {
//   // Clear local storage
//   localStorage.clear();
// };

$(".logoutbtn").on("click", function () {
  window.localStorage.clear();
  window.location.replace('../login.html');
});

async function LoadContent() {
  try {
    const headerResponse = await fetch("../seller/SellerHeader.html");
    if (!headerResponse.ok) {
      throw new Error("Failed to fetch header");
    }
    const headerHtml = await headerResponse.text();
    document.getElementsByClassName("header")[0].innerHTML = headerHtml;
  } catch (error) {
    console.error("Error fetching header:", error);
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  await LoadContent();
});
window.addEventListener("load", () => {
  document.querySelector("body").classList.add("fade-in");
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
