document.addEventListener("DOMContentLoaded", () => {
    
    // --- QUERY PARAMETER FOR GUEST NAME ---
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    if (guestName) {
        const formattedGuestName = decodeURIComponent(guestName.replace(/\+/g, ' '));
        const guestNameElement = document.querySelector(".guest-name");
        if (guestNameElement) {
            guestNameElement.innerText = formattedGuestName;
        }
        
        // Pre-fill RSVP name input
        const rsvpNameInput = document.getElementById("rsvp-name");
        if (rsvpNameInput) {
            rsvpNameInput.value = formattedGuestName;
        }
    }

    // --- BUKA UNDANGAN & AUDIO ---
    const btnOpen = document.getElementById("btn-open");
    const coverScreen = document.getElementById("cover-screen");
    const mainContent = document.getElementById("main-content");
    const bgMusic = document.getElementById("bg-music");
    const btnMusic = document.getElementById("btn-music");
    const spinIcon = btnMusic.querySelector(".spin-icon");
    let isPlaying = false;

    btnOpen.addEventListener("click", () => {
        coverScreen.style.transform = "translateY(-100vh)";
        coverScreen.style.opacity = "0";
        
        setTimeout(() => {
            coverScreen.style.display = "none";
            mainContent.classList.remove("hidden");
            
            bgMusic.play().then(() => {
                isPlaying = true;
            }).catch(e => {
                console.log("Auto-play was prevented by the browser.");
            });
            
            checkFadeIn();
        }, 800);
    });

    // --- TOGGLE MUSIC ---
    btnMusic.addEventListener("click", () => {
        if (isPlaying) {
            bgMusic.pause();
            spinIcon.style.animationPlayState = "paused";
            spinIcon.classList.replace("fa-compact-disc", "fa-music");
        } else {
            bgMusic.play();
            spinIcon.style.animationPlayState = "running";
            spinIcon.classList.replace("fa-music", "fa-compact-disc");
        }
        isPlaying = !isPlaying;
    });

    // --- SCROLL ANIMATION (FADE IN) ---
    const fadeElements = document.querySelectorAll(".fade-in");

    function checkFadeIn() {
        const triggerBottom = window.innerHeight * 0.85;

        fadeElements.forEach(el => {
            const boxTop = el.getBoundingClientRect().top;
            if (boxTop < triggerBottom) {
                el.classList.add("visible");
            }
        });
    }

    window.addEventListener("scroll", checkFadeIn);

    // --- COUNTDOWN TIMER ---
    const countdownDate = new Date("July 25, 2026 08:00:00").getTime();

    const timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = countdownDate - now;

        if (distance < 0) {
            clearInterval(timerInterval);
            document.getElementById("days").innerText = "00";
            document.getElementById("hours").innerText = "00";
            document.getElementById("minutes").innerText = "00";
            document.getElementById("seconds").innerText = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").innerText = days < 10 ? "0" + days : days;
        document.getElementById("hours").innerText = hours < 10 ? "0" + hours : hours;
        document.getElementById("minutes").innerText = minutes < 10 ? "0" + minutes : minutes;
        document.getElementById("seconds").innerText = seconds < 10 ? "0" + seconds : seconds;
    }, 1000);

    // --- RSVP FORM TO WHATSAPP ---
    const rsvpForm = document.getElementById("rsvp-form");
    
    rsvpForm.addEventListener("submit", function(e) {
        e.preventDefault(); // Mencegah reload halaman
        
        const name = document.getElementById("rsvp-name").value;
        const amount = document.getElementById("rsvp-amount").value;
        const status = document.getElementById("rsvp-status").value;
        
        // Nomor WhatsApp tujuan (Format: 628xxxx) - Silakan diganti nanti
        const waNumber = "6281234567890"; 
        
        let message = `Halo, saya *${name}* ingin mengkonfirmasi undangan pernikahan Putri & Bambang.%0A%0A`;
        message += `Kehadiran: *${status}*%0A`;
        if (status === "Hadir") {
            message += `Jumlah: *${amount} Orang*%0A%0A`;
            message += `Terima kasih dan sampai jumpa di hari bahagia!`;
        } else {
            message += `Mohon maaf tidak bisa hadir, semoga acaranya lancar ya!`;
        }
        
        const waLink = `https://wa.me/${waNumber}?text=${message}`;
        window.open(waLink, '_blank');
        
        // Reset form
        rsvpForm.reset();
    });

    // --- PAUSE MUSIC WHEN TAB IS HIDDEN ---
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            bgMusic.pause();
        } else {
            // Only auto-resume if the music was actively playing before switching tabs
            if (isPlaying) {
                bgMusic.play().catch(e => console.log("Failed to resume music:", e));
            }
        }
    });

});

// --- COPY TO CLIPBOARD ---
function copyRekening(elementId) {
    const textToCopy = document.getElementById(elementId).innerText;
    
    const tempInput = document.createElement("input");
    tempInput.value = textToCopy;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    
    alert("Nomor Rekening berhasil disalin: " + textToCopy);
}
