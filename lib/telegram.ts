import { env } from "@/lib/env";

export async function sendTelegramMessage(message: string) {
  if (!env.telegramNotificationsEnabled) return { skipped: true, reason: "Telegram disabled" };
  if (!env.telegramBotToken || !env.telegramChatId) {
    return { skipped: true, reason: "Telegram credentials missing" };
  }

  const response = await fetch(`https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: env.telegramChatId,
      text: message,
      disable_web_page_preview: true
    })
  });

  if (!response.ok) {
    return { skipped: false, error: `Telegram API returned HTTP ${response.status}` };
  }

  return { skipped: false, ok: true };
}
