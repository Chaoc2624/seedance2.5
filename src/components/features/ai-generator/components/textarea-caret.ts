export function focusTextareaAtEnd(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return;

  textarea.focus({ preventScroll: true });
  const end = textarea.value.length;
  textarea.setSelectionRange(end, end);
}
