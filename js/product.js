import { getLoginInfo } from "./Utils/auth.js";

function productOnClick(product) {
    window.localStorage.setItem('ProductInfo', JSON.stringify(product));
    window.location.href = "./productview.html";
}

var pageSize = 5;
let currentPage = 1;
let isFetching = false;
let hasMoreProducts = true; // Flag to track if there are more products to fetch

async function fetchProducts(page) {
    var query = localStorage.getItem('query');
    if (query == null) {
        query = "null";
    } else {
        localStorage.setItem('query', null);
    }
    try {
        const response = await fetch(`http://localhost:5083/api/CustomerProduct/GetAllProducts?page=${page}&pageSize=${pageSize}&query=${query}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.length < pageSize) {
            hasMoreProducts = false; // No more products if the returned data is less than the page size
        }
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

async function fetchImage(imageId) {
    const response = await fetch(
        `http://localhost:5083/api/ImageAPI/${imageId}`,
        {
            method: "GET",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        }
    );
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

async function renderProducts(products) {
    const productsContainer = document.querySelector('.products');
    if (currentPage === 1) {
        productsContainer.innerHTML = ""; // Clear only for the first page
    }
    if (products.length == 0 && currentPage === 1) {
        productsContainer.innerHTML = "<h1>No item available!</h1>";
        return;
    }
    for (const product of products) {
        const imageUrl = await fetchImage(product.image_URL);
        const productElement = document.createElement('div');
        productElement.classList.add('product');
        productElement.innerHTML = `
            <img src="${imageUrl}" alt="${product.name}">
            <h2>${product.name}</h2>
            <div class="price">
                <span><b>Brand:</b> ${product.brand}</span>
                <span class="discounted-price">${product.stock == 0 ? "Out of Stock" : "₹" + product.price}</span>
            </div>`;
        if (product.stock != 0) {
            productElement.addEventListener('click', () => productOnClick(product));
        }
        productsContainer.appendChild(productElement);
    }
}

function handleScroll() {
    const footer = document.querySelector('.footer');
    const footerHeight = footer ? footer.offsetHeight : 0;

    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - footerHeight) && !isFetching && hasMoreProducts) {
        isFetching = true;
        currentPage++;
        fetchProducts(currentPage)
            .then(products => {
                renderProducts(products);
                isFetching = false;
            })
            .catch(error => {
                console.error('Error fetching more products:', error);
                isFetching = false;
            });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const initialProducts = await fetchProducts(currentPage);
    renderProducts(initialProducts);
    window.addEventListener('scroll', handleScroll);
});
