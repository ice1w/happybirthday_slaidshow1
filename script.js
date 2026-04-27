const config = {
    photosCount: 20,
    photoFormat: ".jpg",
    messages: ["3", "2", "1", "HAPPY", "BIRTHDAY", "TO", "VERA"],
    matrixColor: "#ff007f",
    particleColor: "#ff0044",
    heartScale: 20 // Размер сердца
};

// --- МАТРИЦА ---
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;
const cols = Math.floor(w / 20);
const drops = Array(cols).fill(1);

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = config.matrixColor;
    ctx.font = '18px monospace';
    drops.forEach((y, i) => {
        const char = Math.random() > 0.5 ? "0" : "1";
        ctx.fillText(char, i * 20, y * 20);
        if (y * 20 > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    });
}
let matrixInt = setInterval(drawMatrix, 30); // Быстрая матрица

// --- СТАРТ ---
const musicBtn = document.getElementById('music-btn');
const audio = document.getElementById('bg-music');
const overlay = document.getElementById('text-overlay');

musicBtn.onclick = () => {
    audio.play();
    musicBtn.style.display = 'none';
    
    let tl = gsap.timeline();
    config.messages.forEach((msg) => {
        const isNum = !isNaN(msg); // Проверка: цифра или слово
        
        tl.to(overlay, { 
            onStart: () => { overlay.innerText = msg; },
            opacity: 1, scale: 1.3, 
            duration: isNum ? 0.3 : 0.6, // Цифры быстрее слов
            ease: "back.out(2)" 
        }).to(overlay, { 
            opacity: 0, scale: 3, 
            duration: 0.2, 
            delay: isNum ? 0.4 : 0.8 // Цифры висят меньше слов
        });
    });

    tl.to("#canvas-container", { scale: 15, opacity: 0, duration: 1.2, onComplete: startGalaxy });
};

// --- СЛАЙДШОУ ---
let photos = [];
function startGalaxy() {
    clearInterval(matrixInt);
    document.getElementById('canvas-container').style.display = 'none';
    const gs = document.getElementById('galaxy-screen');
    gs.style.display = 'block';
    gsap.to(gs, { opacity: 1, duration: 1 });

    initParticles();

    const container = document.getElementById('photo-container');
    for (let i = 1; i <= config.photosCount; i++) {
        const f = document.createElement('div');
        f.className = 'photo-frame';
        f.innerHTML = `<img src="photos/${i}${config.photoFormat}" onerror="this.src='https://via.placeholder.com/110x150?text=${i}'">`;
        container.appendChild(f);
        photos.push(f);
    }

    let current = 0;
    const nextPhoto = () => {
        if (current < photos.length) {
            if (current > 0) {
                gsap.to(photos[current - 1], { x: -window.innerWidth, rotation: -30, opacity: 0, duration: 0.7 });
            }
            gsap.fromTo(photos[current], 
                { opacity: 0, scale: 0.3, y: 400, rotation: 15 },
                { opacity: 1, scale: 2.2, y: 0, rotation: Math.random()*10-5, duration: 0.7, ease: "back.out" }
            );
            current++;
        } else {
            window.removeEventListener('click', nextPhoto);
            assembleHeart();
        }
    };

    window.addEventListener('click', nextPhoto);
    nextPhoto(); // Показываем первую сразу
}

// --- СЕРДЦЕ ---
function assembleHeart() {
    photos.forEach((p, i) => {
        const t = (i / photos.length) * 2 * Math.PI;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));

        gsap.to(p, {
            x: x * config.heartScale, y: y * config.heartScale,
            scale: 0.9, opacity: 1, rotationZ: Math.random()*10-5,
            duration: 2, delay: i * 0.05, ease: "power2.out"
        });
    });

    setTimeout(() => {
        const final = document.createElement('div');
        final.id = 'final-text';
        final.innerText = "I LOVE YOU";
        document.getElementById('galaxy-screen').appendChild(final);
        gsap.from(final, { opacity: 0, scale: 0, duration: 1.5, ease: "elastic.out(1, 0.3)" });
        gsap.to(photos, { scale: 0.95, duration: 0.8, repeat: -1, yoyo: true, stagger: 0.02 });
    }, 1500);
}

// --- ЧАСТИЦЫ ---
const pCanvas = document.getElementById('particles-canvas');
const pCtx = pCanvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null, radius: 120 };

function initParticles() {
    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;
    for (let i = 0; i < 120; i++) {
        let x = Math.random() * pCanvas.width;
        let y = Math.random() * pCanvas.height;
        particles.push({
            x: x, y: y, baseX: x, baseY: y,
            size: Math.random() * 2 + 1, density: Math.random() * 20 + 5,
            color: Math.random() > 0.8 ? config.particleColor : "#ffffff"
        });
    }
    animateParticles();
}

function animateParticles() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    particles.forEach(p => {
        let dx = mouse.x - p.x;
        let dy = mouse.y - p.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < mouse.radius) {
            p.x -= (dx/dist) * 3; p.y -= (dy/dist) * 3;
        } else {
            p.x += (p.baseX - p.x) * 0.05; p.y += (p.baseY - p.y) * 0.05;
        }
        pCtx.fillStyle = p.color;
        pCtx.beginPath(); pCtx.arc(p.x, p.y, p.size, 0, Math.PI*2); pCtx.fill();
    });
    requestAnimationFrame(animateParticles);
}

window.addEventListener('mousemove', e => { mouse.x = e.x; mouse.y = e.y; });