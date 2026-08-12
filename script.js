const sections = document.querySelectorAll(".content-section");
const introSpacer = document.querySelector(".intro-spacer");
const page = document.querySelector('.page');
const leftPanel = document.querySelector('.left-panel');

const heroCopy = document.querySelector(".hero-copy");
const topicCopies = document.querySelectorAll(".topic-copy");

let activeSection = null;
let lastScrollY = window.scrollY;
let scrollDirection = "down";
let introModeActive = false;

const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

const easeInOut = (t) =>
    t < 0.5
        ? 2 * t * t
        : -1 + (4 - 2 * t) * t;


/* =================================
   SHOW HERO
================================= */

function showHero() {
    heroCopy.classList.add("active");
    topicCopies.forEach(topic => {
        topic.classList.remove("active");
    });
}


/* =================================
   SHOW TOPIC
================================= */

function showTopicForSection(section) {
    const sectionId =
        section.dataset.section ||
        section.id.replace("-image", "");

    heroCopy.classList.remove("active");

    topicCopies.forEach(topic => {
        topic.classList.toggle(
            "active",
            topic.dataset.section === sectionId
        );
    });
}


/* =================================
   UPDATE TEXT
================================= */

function updateText(section, progress) {
    const wrapper = section.querySelector(".text-wrapper");
    if (!wrapper) return;

    const paragraphs = wrapper.querySelectorAll("p");

    const eased = easeInOut(clamp(progress / 0.35, 0, 1));
    const y = 20 * (1 - eased);
    const scale = 0.97 + (0.03 * eased);
    const opacity = 0.35 + (0.65 * eased);

    wrapper.style.transform = `translateY(${y}px) scale(${scale})`;
    wrapper.style.opacity = opacity;

    const paragraphCount = paragraphs.length;
    if (!paragraphCount) return;

    const activeIndex = Math.min(
        paragraphCount - 1,
        Math.floor(progress * paragraphCount)
    );

    paragraphs.forEach((paragraph, index) => {
        paragraph.classList.toggle(
            "highlight",
            progress > 0.05 && index === activeIndex
        );
    });
}


/* =================================
   UPDATE IMAGE
================================= */

function resetImage(section) {
    const image = section.querySelector(".image-wrapper img");
    if (!image) return;

    image.style.transformOrigin =
        section.dataset.imageOrigin || "center center";
}


/* =================================
   DESKTOP SCROLL PROGRESS
================================= */

function updateDesktopSection(section) {
    const rect = section.getBoundingClientRect();
    const progress = clamp(
        (window.innerHeight - rect.top) /
        (window.innerHeight + rect.height),
        0,
        1
    );

    if (section.classList.contains("text-section")) {
        updateText(section, progress);
    }

    if (section.classList.contains("image-section")) {
        resetImage(section);
    }
}


/* =================================
   FIND CLOSEST SECTION
================================= */

function findClosestSection() {
    const viewportCenter = window.innerHeight / 2;
    let closest = null;
    let closestDistance = Infinity;

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();

        if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
            return;
        }

        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - viewportCenter);

        if (distance < closestDistance) {
            closest = section;
            closestDistance = distance;
        }
    });

    return closest;
}


/* =================================
   ACTIVATE DESKTOP SECTION
================================= */

function activateDesktopSection(section) {
    if (!section) return;
    if (activeSection === section) return;

    sections.forEach(item => {
        if (item !== section) {
            item.classList.remove("active");
        }
    });

    if (
        activeSection &&
        activeSection.classList.contains("image-section") &&
        scrollDirection === "up"
    ) {
        activeSection.classList.add("zooming-out");
        const oldSection = activeSection;

        setTimeout(() => {
            oldSection.classList.remove("zooming-out");
        }, 1000);
    }

    activeSection = section;
    section.classList.add("active");

    showTopicForSection(section);

    if (section.classList.contains("image-section")) {
        resetImage(section);
        section.classList.remove("zooming-out");
    }
}


/* =================================
   MAIN SCROLL UPDATE
================================= */

function update() {
    const currentY = window.scrollY;

    if (currentY > lastScrollY) {
        scrollDirection = "down";
    } else if (currentY < lastScrollY) {
        scrollDirection = "up";
    }
    lastScrollY = currentY;

    const isMobile = window.innerWidth <= 800;

    // ====================================
    //  MOBILE
    // ====================================
    if (isMobile) {
    // If we are at the very top → show intro mode
    if (currentY <= 10) {
        if (!page.classList.contains('intro-mode')) {
            page.classList.add('intro-mode');
            showHero();
            sections.forEach(section => {
                section.classList.remove('active');
            });
            activeSection = null;
        }
        return;
    }

    // If we have scrolled down → remove intro mode (if still present)
    if (page.classList.contains('intro-mode')) {
        page.classList.remove('intro-mode');
        // Give the CSS transition a moment to finish before normal scrolling logic
        setTimeout(() => requestUpdate(), 850);
        return;
    }

    // Normal sticky behaviour below (same as before)
    const closest = findClosestSection();
    if (!closest) {
        showHero();
        if (activeSection) {
            activeSection.classList.remove('active');
            activeSection = null;
        }
        return;
    }

    if (activeSection !== closest) {
        activateDesktopSection(closest);
    }

    updateDesktopSection(closest);
    return;
}

    // ====================================
    //  DESKTOP (unchanged)
    // ====================================
    if (introSpacer) {
        const introRect = introSpacer.getBoundingClientRect();
        if (introRect.bottom > window.innerHeight * 0.55) {
            showHero();
            sections.forEach(section => {
                section.classList.remove("active");
            });
            activeSection = null;
            return;
        }
    }

    const closest = findClosestSection();
    if (!closest) return;

    activateDesktopSection(closest);
    updateDesktopSection(closest);
}


/* =================================
   SCROLL
================================= */

let ticking = false;

function requestUpdate() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
        update();
        ticking = false;
    });
}

window.addEventListener("scroll", requestUpdate, { passive: true });
window.addEventListener("resize", requestUpdate);


/* =================================
   INITIALIZE
================================= */

function initMobileIntro() {
    const isMobile = window.innerWidth <= 800;

    if (isMobile) {
        page.classList.add('intro-mode');
        introModeActive = true;
    } else {
        page.classList.remove('intro-mode');
        introModeActive = false;
    }
}

// Initialize sections
// Initialize sections
sections.forEach(section => {
    section.classList.remove("active");
    section.classList.remove("zooming-out");
    resetImage(section);
});

// Show intro on mobile initially
if (window.innerWidth <= 800) {
    page.classList.add('intro-mode');
    showHero();
} else {
    page.classList.remove('intro-mode');
}

// Handle resize
window.addEventListener('resize', () => {
    if (window.innerWidth <= 800 && window.scrollY <= 10) {
        page.classList.add('intro-mode');
        showHero();
    } else {
        page.classList.remove('intro-mode');
    }
});

requestUpdate();