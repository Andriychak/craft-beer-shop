function confirmAction() {
  if (window.app && window.app.ui && typeof window.app.ui.currentConfirmAction === 'function') {
    window.app.ui.currentConfirmAction();
  }
}

function closeModal() {
  if (window.app && window.app.ui) {
    window.app.ui.closeModal();
  }
}

function toggleMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  
  if (hamburger && navMenu) {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  }
}

function closeMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  
  if (hamburger && navMenu) {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  }
}

window.confirmAction = confirmAction;
window.closeModal = closeModal;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;

export { confirmAction, closeModal, toggleMobileMenu, closeMobileMenu };