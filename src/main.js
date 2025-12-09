/* =========================================
   1. Lenis Smooth Scroll
   ========================================= */
   const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

/* =========================================
   2. DOM Logic & UI
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {

    // --- Icons ---
    lucide.createIcons();

    // --- Mobile Menu ---
    const burger = document.querySelector('.header__burger');
    const nav = document.querySelector('.header__nav');
    const links = document.querySelectorAll('.header__link');

    if (burger && nav) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('is-active');
            const isActive = nav.classList.contains('is-active');

            const iTag = burger.querySelector('i');
            iTag.setAttribute('data-lucide', isActive ? 'x' : 'menu');
            lucide.createIcons();

            if (isActive) {
                lenis.stop();
                document.body.style.overflow = 'hidden';
            } else {
                lenis.start();
                document.body.style.overflow = '';
            }
        });

        links.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('is-active');
                lenis.start();
                document.body.style.overflow = '';
                burger.querySelector('i').setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            });
        });
    }

    // --- Init Animations ---
    initHeroAnimation();
    initMarquee();
    initFormLogic();
    initCookiePopup();
    initScrollAnimations();
});

/* =========================================
   3. Three.js Hero Animation
   ========================================= */
function initHeroAnimation() {
    const container = document.getElementById('hero-canvas');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 120;
    camera.position.y = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const particleCount = 2500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const rows = 50, cols = 50, sep = 8;
    let i = 0;

    for (let x = 0; x < rows; x++) {
        for (let z = 0; z < cols; z++) {
            positions[i] = (x - rows / 2) * sep;
            positions[i + 1] = 0;
            positions[i + 2] = (z - cols / 2) * sep;
            i += 3;
        }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0x8A2BE2,
        size: 2.0,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.03;
        const pos = particles.geometry.attributes.position.array;
        let idx = 0;
        for (let x = 0; x < rows; x++) {
            for (let z = 0; z < cols; z++) {
                pos[idx + 1] = (Math.sin((x * 0.5) + time) * 5) + (Math.sin((z * 0.3) + time) * 5);
                idx += 3;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.rotation.y += 0.001;
        particles.rotation.x += (mouseY * 0.1 - particles.rotation.x) * 0.05;
        particles.rotation.z += (mouseX * 0.1 - particles.rotation.z) * 0.05;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

/* =========================================
   4. Marquee Animation (GSAP)
   ========================================= */
function initMarquee() {
    gsap.registerPlugin(ScrollTrigger);

    // Simple infinite loop with CSS is easiest,
    // but here is a GSAP tweak if needed for control
    const marqueeContent = document.querySelector('.marquee-wrapper');
    if(marqueeContent) {
        gsap.to(marqueeContent, {
            x: "-50%",
            duration: 20,
            ease: "none",
            repeat: -1
        });
    }
}

/* =========================================
   5. Scroll Animations (GSAP)
   ========================================= */
function initScrollAnimations() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => {
        gsap.fromTo(sec.children,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: sec,
                    start: "top 80%",
                }
            }
        );
    });
}

/* =========================================
   6. Contact Form Logic
   ========================================= */
function initFormLogic() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // --- Math Captcha Generation ---
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const sum = num1 + num2;
    const captchaLabel = document.getElementById('captchaLabel');
    const captchaInput = document.getElementById('captcha');

    captchaLabel.textContent = `Решите пример: ${num1} + ${num2} = ?`;

    // --- Input Validation ---
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', (e) => {
        // Allow only digits
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    // --- Submission ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const msgBlock = document.getElementById('formMessage');
        msgBlock.textContent = '';
        msgBlock.className = 'form-message';

        // Check Captcha
        if (parseInt(captchaInput.value) !== sum) {
            msgBlock.textContent = 'Ошибка в математическом примере.';
            msgBlock.classList.add('error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        // Simulate AJAX
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
            msgBlock.textContent = 'Спасибо! Ваша заявка успешно отправлена.';
            msgBlock.classList.add('success');
            form.reset();

            // Generate new captcha
            const n1 = Math.floor(Math.random() * 10);
            const n2 = Math.floor(Math.random() * 10);
            captchaLabel.textContent = `Решите пример: ${n1} + ${n2} = ?`;
        }, 1500);
    });
}

/* =========================================
   7. Cookie Popup
   ========================================= */
function initCookiePopup() {
    const popup = document.getElementById('cookiePopup');
    const acceptBtn = document.getElementById('acceptCookies');

    if (!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => {
            popup.classList.add('is-visible');
        }, 2000);
    }

    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        popup.classList.remove('is-visible');
    });
}