// Botni bir marta sozlash: webhook, menyu tugmasi va buyruqlar.
// Ishga tushirish (deploydan keyin):  node --env-file=.env scripts/bot-sozla.mjs
// Kerakli env: TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, MINI_APP_URL (https://...)
// Token ekranga chiqarilmaydi.

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const url = process.env.MINI_APP_URL?.replace(/\/$/, "");

if (!token || !secret || !url?.startsWith("https://")) {
  console.error("TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET va https:// bilan boshlanuvchi MINI_APP_URL kerak.");
  process.exit(1);
}

async function bot(metod, body) {
  const javob = await fetch(`https://api.telegram.org/bot${token}/${metod}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await javob.json();
  console.log(`${metod}: ${data.ok ? "ok" : `XATO — ${data.description}`}`);
  if (!data.ok) process.exitCode = 1;
  return data.result;
}

const men = await bot("getMe", {});
if (men) console.log(`Bot: @${men.username}`);

await bot("setWebhook", {
  url: `${url}/api/telegram/webhook`,
  secret_token: secret,
  allowed_updates: ["message", "callback_query"],
  drop_pending_updates: true,
});
await bot("setMyCommands", { commands: [{ command: "start", description: "Boshlash" }] });
await bot("setChatMenuButton", { menu_button: { type: "web_app", text: "Menyu", web_app: { url } } });

const info = await bot("getWebhookInfo", {});
if (info) console.log(`Webhook: ${info.url} (kutayotgan: ${info.pending_update_count})`);
