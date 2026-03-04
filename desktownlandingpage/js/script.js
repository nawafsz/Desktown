document.addEventListener('DOMContentLoaded', () => {
    // Form handling
    const form = document.getElementById('signupForm');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = form.querySelector('button');
            const originalText = btn.innerText;
            
            btn.innerText = 'جاري الإرسال...';
            btn.style.opacity = '0.8';
            btn.disabled = true;

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                // Point this to your DeskTwon backend URL
                // Using temporary tunnel URL for external access
                const response = await fetch('https://fast-meals-brake.loca.lt/api/landing/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Bypass-Tunnel-Reminder': 'true'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    alert('تم التسجيل بنجاح! سنتواصل معك قريباً.');
                    form.reset();
                } else {
                    const result = await response.json();
                    alert('حدث خطأ أثناء الإرسال: ' + (result.message || 'يرجى المحاولة مرة أخرى.'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('حدث خطأ في الاتصال. يرجى التأكد من تشغيل الخادم.');
            } finally {
                btn.innerText = originalText;
                btn.style.opacity = '1';
                btn.disabled = false;
            }
        });
    }

    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.service-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});
