document.addEventListener("DOMContentLoaded",async function() {
    //Carousel 
    const carouselWrapper = document.querySelector(".carousel-wrapper");
    const slides = document.querySelectorAll(".carousel-slide");
    const prevButton = document.querySelector(".prev");
    const nextButton = document.querySelector(".next");
    let currentIndex = 0;
    const totalSlides = slides.length;

    function updateCarousel() {
        const offset = -currentIndex * 100;
        carouselWrapper.style.transform = `translateX(${offset}%)`;
    }

    prevButton.addEventListener("click", function() {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : totalSlides - 1;
        updateCarousel();
    });

    nextButton.addEventListener("click", function() {
        currentIndex = (currentIndex < totalSlides - 1) ? currentIndex + 1 : 0;
        updateCarousel();
    });

    setInterval(() => {
        currentIndex = (currentIndex < totalSlides - 1) ? currentIndex + 1 : 0;
        updateCarousel();
    }, 4000);
});
