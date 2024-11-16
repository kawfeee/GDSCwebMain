document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.querySelector('.preloader');
    const preloaderVideo = document.getElementById('preloader-video');
    const body = document.body;

    // Add preload class to body
    body.classList.add('preload');

    // Start playing the video
    preloaderVideo.play();

    // Listen for video end
    preloaderVideo.addEventListener('ended', () => {
        // Add fade-out class
        preloader.classList.add('fade-out');
        
        // Remove preloader and preload class after animation
        setTimeout(() => {
            preloader.style.display = 'none';
            body.classList.remove('preload');
        }, 500); // Match this with CSS transition duration
    });

    // Fallback in case video fails to load
    preloaderVideo.addEventListener('error', () => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
            body.classList.remove('preload');
        }, 500);
    });

    // Fallback timeout (in case video takes too long)
    const fallbackTimeout = setTimeout(() => {
        if (preloader.style.display !== 'none') {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
                body.classList.remove('preload');
            }, 500);
        }
    }, 5000); // 5 seconds fallback

    // Hamburger menu functionality
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-links a');

    function toggleMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    }

    function closeMenu() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }

    // Toggle menu on hamburger click
    hamburger.addEventListener('click', toggleMenu);

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            closeMenu();
        }
    });

    // Prevent menu from staying open on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });

    const teamContainer = document.querySelector('.team-container');
    const cardTrack = document.querySelector('.card-track');
    const cards = document.querySelectorAll('.card');
    let scrollInterval;
    let isCardHovered = false;
    let manualScrolling = false;
    let scrollPosition = 0;

    // Clone cards for seamless loop
    function setupInfiniteScroll() {
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            addCardListeners(card);
            addCardListeners(clone);
            cardTrack.appendChild(clone);
        });
        startScrolling();
    }

    // Add hover listeners to individual cards and track
    function addCardListeners(card) {
        card.addEventListener('mouseenter', () => {
            isCardHovered = true;
        });

        card.addEventListener('mouseleave', () => {
            // Only reset if not hovering over the track
            if (!teamContainer.matches(':hover')) {
                isCardHovered = false;
                manualScrolling = false;
            }
        });
    }

    // Add track hover listeners
    teamContainer.addEventListener('mouseenter', () => {
        isCardHovered = true;
    });

    teamContainer.addEventListener('mouseleave', () => {
        isCardHovered = false;
        manualScrolling = false;
    });

    // Handle wheel event on the container
    teamContainer.addEventListener('wheel', handleWheel);

    function startScrolling() {
        const scrollSpeed = 1.8;
        const totalWidth = cards[0].offsetWidth + parseInt(getComputedStyle(cards[0]).marginRight);
        const resetPosition = totalWidth * cards.length;

        scrollInterval = setInterval(() => {
            if (!isCardHovered && !manualScrolling) {
                scrollPosition += scrollSpeed;

                if (scrollPosition >= resetPosition) {
                    scrollPosition = 0;
                }

                cardTrack.style.transform = `translateX(-${scrollPosition}px)`;
            }
        }, 20);
    }

    function handleWheel(e) {
        if (isCardHovered) {
            e.preventDefault();
            manualScrolling = true;
            clearTimeout(window.scrollTimeout);

            const totalWidth = cards[0].offsetWidth + parseInt(getComputedStyle(cards[0]).marginRight);
            const maxScroll = totalWidth * cards.length;
            
            scrollPosition += e.deltaY * 2;

            if (scrollPosition >= maxScroll) {
                scrollPosition = 0;
            } else if (scrollPosition < 0) {
                scrollPosition = maxScroll - 1;
            }

            cardTrack.style.transform = `translateX(-${scrollPosition}px)`;

            window.scrollTimeout = setTimeout(() => {
                manualScrolling = false;
            }, 150);
        }
    }

    // Touch support
    let touchStart = 0;
    let touchScrollStart = 0;

    teamContainer.addEventListener('touchstart', (e) => {
        touchStart = e.touches[0].clientX;
        touchScrollStart = scrollPosition;
        manualScrolling = true;
        isCardHovered = true;
    });

    teamContainer.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const diff = touchStart - touch.clientX;
        scrollPosition = touchScrollStart + diff;
        
        const totalWidth = cards[0].offsetWidth + parseInt(getComputedStyle(cards[0]).marginRight);
        const maxScroll = totalWidth * cards.length;

        if (scrollPosition >= maxScroll) {
            scrollPosition = 0;
        } else if (scrollPosition < 0) {
            scrollPosition = maxScroll - 1;
        }

        cardTrack.style.transform = `translateX(-${scrollPosition}px)`;
    });

    teamContainer.addEventListener('touchend', () => {
        setTimeout(() => {
            isCardHovered = false;
            manualScrolling = false;
        }, 100);
    });

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(scrollInterval);
        } else {
            startScrolling();
        }
    });

    // Initialize
    setupInfiniteScroll();

    // Clean up
    window.addEventListener('beforeunload', () => {
        clearInterval(scrollInterval);
    });

    // Intersection Observer for events and projects sections
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Reveal title
                const title = entry.target.querySelector('.events-title');
                if (title) title.classList.add('reveal');

                // Reveal cards with stagger effect
                const cards = entry.target.querySelectorAll('.event-card, .project-card');
                cards.forEach(card => {
                    card.classList.add('reveal');
                });

                // Unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe events and projects sections
    const sections = document.querySelectorAll('#events, #Projects');
    sections.forEach(section => observer.observe(section));

    // Optional: Reset animations when scrolling back to top
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop < 100 && lastScrollTop > scrollTop) {
            // Reset animations only for events and projects
            document.querySelectorAll('#events .reveal, #Projects .reveal')
                .forEach(element => {
                    element.classList.remove('reveal');
                });
            
            // Re-observe sections
            sections.forEach(section => observer.observe(section));
        }
        
        lastScrollTop = scrollTop;
    });
});

