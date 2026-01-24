// Safe toggle button
const toggleButton = document.getElementById('theme-toggle');
if (toggleButton) {
  toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });
}
