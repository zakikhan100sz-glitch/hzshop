export function buildWhatsAppLink({ number, text }) {
  // remove spaces
  const digits = String(number || '').replace(/[^0-9]/g, '');

  // encode message text for URL
  const encoded = encodeURIComponent(text || '');
  return `https://api.whatsapp.com/send?phone=${digits}&text=${encoded}`;
}