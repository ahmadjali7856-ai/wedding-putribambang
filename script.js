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

    // --- UCAPAN / RSVP (Google Sheets) ---
    const rsvpForm = document.getElementById("rsvp-form");
    if (rsvpForm) {
        rsvpForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const name = document.getElementById("rsvp-name").value.trim();
            const rawStatus = document.getElementById("rsvp-status").value;
            const message = document.getElementById("rsvp-msg").value.trim();
            
            // Map status
            let attendance = "hadir";
            if (rawStatus === "Tidak Hadir") attendance = "tidak";
            else if (rawStatus === "Ragu") attendance = "ragu";
            
            if (!name || !message) {
                alert('Mohon isi nama dan ucapan Anda.');
                return;
            }

            const wish = {
                name,
                attendance,
                message: message + " #PB#",
                time: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
            };

            const submitBtn = document.getElementById("btn-submit-rsvp");
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '⏳ Mengirim...';
            submitBtn.disabled = true;

            fetch("https://script.google.com/macros/s/AKfycbzv3J1B50r85zxfjJXYXEPYkraWPlHcqt72T1Sk-NqaJDcyVq72yJOrEOHwCja8EkPKQQ/exec", {
                method: 'POST',
                body: JSON.stringify(wish)
            }).then(() => {
                alert('Terima kasih! Pesan dan konfirmasi kehadiran Anda telah berhasil dikirim.');
                rsvpForm.reset();
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                loadWishes();
            }).catch(err => {
                console.error(err);
                alert('Maaf, terjadi kesalahan saat mengirim pesan.');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            });
        });
    }

    // Load initial wishes
    loadWishes();

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

// --- LOAD WISHES ---
function loadWishes() {
    const container = document.getElementById('wish-list-container');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center; color:#888;">Memuat daftar ucapan...</p>';

    fetch("https://script.google.com/macros/s/AKfycbzv3J1B50r85zxfjJXYXEPYkraWPlHcqt72T1Sk-NqaJDcyVq72yJOrEOHwCja8EkPKQQ/exec")
    .then(res => res.json())
    .then(wishes => {
        // Filter only Putri & Bambang wishes
        const filtered = wishes.filter(w => {
            const msg  = (w.message || '').toLowerCase().trim();
            return msg.includes('#pb#');
        });

        if (filtered.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#888;">Belum ada ucapan.</p>';
            return;
        }

        container.innerHTML = filtered.reverse().map(wish => {
            let badgeColor = wish.attendance === 'hadir' ? '#28a745' : wish.attendance === 'tidak' ? '#dc3545' : '#ffc107';
            let badgeText  = wish.attendance === 'hadir' ? 'Hadir'  : wish.attendance === 'tidak' ? 'Tidak Hadir' : 'Ragu';
            
            // Remove the #PB# tag for display
            let displayMessage = wish.message.replace(/#PB#/gi, '').trim();
            
            return `
                <div style="background: rgba(255,255,255,0.8); backdrop-filter: blur(5px); padding: 15px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin-bottom: 15px; border-left: 5px solid var(--pink-dark);">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                        <h4 style="color: var(--text-dark); margin: 0; font-size: 1.1rem;">${escapeHtml(wish.name)}</h4>
                        <span style="font-size: 0.75rem; background: ${badgeColor}; color: white; padding: 3px 8px; border-radius: 10px;">${badgeText}</span>
                    </div>
                    <p style="font-size: 0.8rem; color: #888; margin-bottom: 8px; border-bottom: 1px dashed #ddd; padding-bottom: 5px;">${wish.time}</p>
                    <p style="font-size: 0.95rem; color: #444; line-height: 1.5; font-style: italic;">"${escapeHtml(displayMessage)}"</p>
                </div>
            `;
        }).join('');
    }).catch(err => {
        console.error(err);
        container.innerHTML = '<p style="text-align:center; color:red;">Gagal memuat ucapan dari server.</p>';
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
