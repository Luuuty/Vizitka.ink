export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return response.status(500).json({ ok: false, error: "Telegram env is not configured" });
  }

  const body = request.body || {};
  const name = sanitize(body.name);
  const contact = sanitize(body.contact);
  const taskType = sanitize(body.taskType);
  const budget = sanitize(body.budget || "Не указан");
  const comment = sanitize(body.comment || "Без комментария");
  const source = sanitize(body.source || "Landing");

  if (!name || !contact || !taskType) {
    return response.status(400).json({ ok: false, error: "Required fields are missing" });
  }

  const message = [
    "🟦 Новая заявка с сайта",
    "",
    `Имя: ${name}`,
    `Контакт: ${contact}`,
    `Тип задачи: ${taskType}`,
    `Бюджет: ${budget}`,
    `Комментарий: ${comment}`,
    `Источник: ${source}`,
  ].join("\n");

  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      disable_web_page_preview: true,
    }),
  });

  if (!telegramResponse.ok) {
    return response.status(502).json({ ok: false, error: "Telegram request failed" });
  }

  return response.status(200).json({ ok: true });
}

function sanitize(value) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 1200);
}
