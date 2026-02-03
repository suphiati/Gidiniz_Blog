// ===== MAIN JAVASCRIPT FILE =====

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Window Load Event - Sayfa tamamen yüklendiğinde
window.addEventListener('load', function() {
    // Sayfa yükleme tamamlandığında tarayıcı yüklenme çubuğunu gizle
    document.documentElement.style.setProperty('--scrollbar-width', '0px');
    
    // Sayfa yükleme durumunu kontrol et
    if (document.readyState === 'complete') {
        // Sayfa yükleme göstergesini gizle
        const pageLoader = document.getElementById('pageLoader');
        if (pageLoader) {
            pageLoader.classList.add('hidden');
            setTimeout(() => {
                pageLoader.style.display = 'none';
            }, 500);
        }
        
        // Body'ye yüklendi sınıfı ekle
        document.body.classList.add('page-loaded');
        
        // Tarayıcı yüklenme çubuğunu gizle
        if (navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Edge')) {
            // Chrome/Edge için özel optimizasyon
            document.documentElement.style.setProperty('--scrollbar-width', '0px');
        }
    }
});

// ===== APP INITIALIZATION =====
function initializeApp() {
    initializeMobileMenu();
    initializeBackToTop();
    initializeSmoothScrolling();
    initializeLazyLoading();
    initializeAnimations();
    initializeAccessibility();
}

// ===== MOBILE MENU =====
function initializeMobileMenu() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navMenu = document.getElementById('navMenu');
    
    if (!hamburgerMenu || !navMenu) return;
    
    // Toggle menu function
    function toggleMenu() {
        const isOpen = navMenu.classList.contains('show');
        
        if (isOpen) {
            navMenu.classList.remove('show');
            hamburgerMenu.classList.remove('active');
            document.body.style.overflow = '';
            // Tüm dropdown'ları kapat
            closeAllDropdowns();
        } else {
            navMenu.classList.add('show');
            hamburgerMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        console.log('Menu toggled:', !isOpen);
    }
    
    // Mobil dropdown toggle fonksiyonu
    function initializeMobileDropdowns() {
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const dropdown = this.closest('.dropdown');
                const dropdownMenu = dropdown.querySelector('.dropdown-menu');
                
                // Diğer tüm dropdown'ları kapat
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    if (menu !== dropdownMenu) {
                        menu.classList.remove('show');
                    }
                });
                
                // Bu dropdown'ı aç/kapat
                dropdownMenu.classList.toggle('show');
                
                console.log('Mobile dropdown toggled');
            });
        });
        
        // Sub-dropdown toggle fonksiyonu
        const subDropdownToggles = document.querySelectorAll('.sub-dropdown .dropdown-link');
        
        subDropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const subDropdown = this.closest('.sub-dropdown');
                const subDropdownMenu = subDropdown.querySelector('.sub-dropdown-menu');
                
                // Diğer tüm sub-dropdown'ları kapat
                document.querySelectorAll('.sub-dropdown-menu.show').forEach(menu => {
                    if (menu !== subDropdownMenu) {
                        menu.classList.remove('show');
                    }
                });
                
                // Bu sub-dropdown'ı aç/kapat
                subDropdownMenu.classList.toggle('show');
                
                console.log('Mobile sub-dropdown toggled');
            });
        });
    }
    
    // Tüm dropdown'ları kapat
    function closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu.show, .sub-dropdown-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    }
    
    // Event listeners
    hamburgerMenu.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = navMenu.contains(event.target);
        const isClickOnHamburger = hamburgerMenu.contains(event.target);
        
        if (!isClickInsideMenu && !isClickOnHamburger && navMenu.classList.contains('show')) {
            toggleMenu();
        }
    });
    
    // Close menu on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navMenu.classList.contains('show')) {
            toggleMenu();
        }
    });
    
    // Mobil dropdown'ları başlat
    initializeMobileDropdowns();
}

// ===== BACK TO TOP BUTTON =====
function initializeBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    if (!backToTopButton) return;
    
    // Show/hide button based on scroll position
    function toggleBackToTop() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    }
    
    // Smooth scroll to top
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Event listeners
    window.addEventListener('scroll', toggleBackToTop);
    backToTopButton.addEventListener('click', scrollToTop);
}

// ===== SMOOTH SCROLLING =====
function initializeSmoothScrolling() {
    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== LAZY LOADING =====
function initializeLazyLoading() {
    // Intersection Observer for lazy loading images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        // Observe all images with lazy class
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ===== ANIMATIONS =====
function initializeAnimations() {
    // Intersection Observer for scroll animations
    if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe elements for animation
        document.querySelectorAll('.article-card, .sidebar-widget').forEach(el => {
            animationObserver.observe(el);
        });
    }
}

// ===== ACCESSIBILITY =====
function initializeAccessibility() {
    // Keyboard navigation for dropdowns
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (!toggle || !menu) return;
        
        // Handle keyboard events
        toggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleDropdown(dropdown);
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target)) {
                closeDropdown(dropdown);
            }
        });
    });
    
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Ana içeriğe geç';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #95d5db;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// ===== DROPDOWN FUNCTIONS =====
function toggleDropdown(dropdown) {
    const menu = dropdown.querySelector('.dropdown-menu');
    const isOpen = menu.classList.contains('show');
    
    // Close all other dropdowns
    document.querySelectorAll('.dropdown-menu.show').forEach(openMenu => {
        if (openMenu !== menu) {
            openMenu.classList.remove('show');
        }
    });
    
    // Toggle current dropdown
    if (isOpen) {
        closeDropdown(dropdown);
    } else {
        openDropdown(dropdown);
    }
}

function openDropdown(dropdown) {
    const menu = dropdown.querySelector('.dropdown-menu');
    menu.classList.add('show');
}

function closeDropdown(dropdown) {
    const menu = dropdown.querySelector('.dropdown-menu');
    menu.classList.remove('show');
}



// ===== UTILITY FUNCTIONS =====

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== PERFORMANCE OPTIMIZATIONS =====

// Optimize scroll events
const optimizedScrollHandler = throttle(function() {
    // Any scroll-based functionality can be added here
}, 16); // ~60fps

window.addEventListener('scroll', optimizedScrollHandler);

// Optimize resize events
const optimizedResizeHandler = debounce(function() {
    // Any resize-based functionality can be added here
}, 250);

window.addEventListener('resize', optimizedResizeHandler);

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    // You can add error reporting here
});

// ===== SERVICE WORKER REGISTRATION (Optional) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// ===== EXPORT FUNCTIONS FOR GLOBAL USE =====
window.toggleMenu = function() {
    const navMenu = document.getElementById('navMenu');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    
    if (navMenu && hamburgerMenu) {
        const isOpen = navMenu.classList.contains('show');
        
        if (isOpen) {
            navMenu.classList.remove('show');
            hamburgerMenu.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            navMenu.classList.add('show');
            hamburgerMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        console.log('Global toggleMenu called:', !isOpen);
    } else {
        console.error('Menu elements not found:', { navMenu: !!navMenu, hamburgerMenu: !!hamburgerMenu });
    }
};

// ===== CONSOLE LOG FOR DEBUGGING =====
console.log('Gidiniz Blog - JavaScript loaded successfully!'); 