import { CalculationResult } from '../types';

export function formatResultForClipboard(data: CalculationResult): string {
  let text = `📊 SMARTTOOLS HUB: ${data.toolName.toUpperCase()}\n`;
  text += `Generated: ${data.dateGenerated}\n`;
  text += `----------------------------------------\n`;
  text += `📌 ${data.primaryResult.label}: ${data.primaryResult.value}\n`;
  if (data.primaryResult.subtext) {
    text += `   (${data.primaryResult.subtext})\n`;
  }
  text += `\nInputs:\n`;
  data.inputs.forEach((inp) => {
    text += `• ${inp.label}: ${inp.value}\n`;
  });
  text += `\nBreakdown:\n`;
  data.breakdown.forEach((b) => {
    text += `• ${b.label}: ${b.value}${b.note ? ` (${b.note})` : ''}\n`;
  });
  text += `----------------------------------------\n`;
  text += `🔗 Calculated at SmartTools Hub: ${window.location.href}\n`;
  return text;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy text', err);
    return false;
  }
}

export async function shareResult(data: CalculationResult): Promise<{ shared: boolean; method: string }> {
  const text = formatResultForClipboard(data);
  const title = `${data.toolName} Result - SmartTools Hub`;
  const url = window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return { shared: true, method: 'native' };
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Native share failed, falling back', err);
      } else {
        return { shared: false, method: 'cancelled' };
      }
    }
  }

  // Fallback to clipboard
  const copied = await copyToClipboard(text);
  return { shared: copied, method: 'clipboard' };
}

export function openWhatsAppShare(data: CalculationResult) {
  const text = encodeURIComponent(formatResultForClipboard(data));
  const waUrl = `https://api.whatsapp.com/send?text=${text}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}
