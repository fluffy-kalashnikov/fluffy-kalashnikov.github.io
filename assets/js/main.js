

window.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver(entries => {
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

    document.querySelectorAll('section[id]').forEach(section => {
        observer.observe(section);
    });
});
