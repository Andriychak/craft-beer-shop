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

window.confirmAction = confirmAction;
window.closeModal = closeModal;

export { confirmAction, closeModal };