// ===== LEGACY SCRIPT COMPATIBILITY =====

// Slider functionality for legacy pages
document.addEventListener("DOMContentLoaded", function () {
  const slides = document.querySelectorAll(".slide");
  if (slides.length > 0) {
    let currentIndex = 0;

    setInterval(() => {
      slides[currentIndex].classList.remove("active");
      currentIndex = (currentIndex + 1) % slides.length;
      slides[currentIndex].classList.add("active");
    }, 3000);
  }
});

// Legacy menu toggle function for backward compatibility
function toggleMenu() {
  const navMenu = document.getElementById("navbar-menu");
  const hamburger = document.querySelector(".hamburger");
  
  if (navMenu && hamburger) {
    const isOpen = navMenu.classList.contains("show");
    
    if (isOpen) {
      navMenu.classList.remove("show");
      hamburger.classList.remove("active");
      document.body.style.overflow = "";
    } else {
      navMenu.classList.add("show");
      hamburger.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }
}

// Legacy back to top function
function topFunction() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// Legacy scroll function
function scrollFunction() {
  const mybutton = document.getElementById("myBtn");
  if (mybutton) {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      mybutton.style.display = "block";
    } else {
      mybutton.style.display = "none";
    }
  }
}

// Add scroll event listener for legacy back to top button
window.addEventListener("scroll", scrollFunction);

// Console log for debugging
console.log("Legacy script loaded for backward compatibility");
