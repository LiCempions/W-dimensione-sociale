if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.querySelector("html").setAttribute("data-bs-theme", "dark")
}