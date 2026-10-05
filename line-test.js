require("dotenv").config({ path: ".env.local" });

const userId = "U99a8d7cbf8f57c9e6b65ec26bfc50b3f";

fetch("https://api.line.me/v2/bot/message/push", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.LINE_CHANNEL_ACCESS_TOKEN,
  },
  body: JSON.stringify({
    to: userId,
    messages: [{ type: "text", text: "Anythingテスト送信です" }],
  }),
})
  .then(async (r) => {
    const text = await r.text();
    console.log("status:", r.status);
    console.log("body:", text);
  })
  .catch((e) => console.error(e));