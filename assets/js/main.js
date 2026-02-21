

window.addEventListener('DOMContentLoaded', () => {
    const navbarHighlightObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            if (entry.intersectionRatio > 0)
            {
                document.querySelector(`.navbar-entry a[href="#${id}"]`).parentElement.classList.add('active');
            }
            else
            {
                document.querySelector(`.navbar-entry a[href="#${id}"]`).parentElement.classList.remove('active');
            }
        });
    })
    const autoplayVideoObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.play();
            } else {
                video.pause();
            }
            console.log("video visible")
        })
    }, { threshold: 0.6})

    document.querySelectorAll('section[id]').forEach(section => {
        navbarHighlightObserver.observe(section);
    });
    document.querySelectorAll('video.autoplay-video').forEach(autoplayVideo => {
        autoplayVideoObserver.observe(autoplayVideo);
    });
});
