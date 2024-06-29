// Importing and Initializing Express
import express from "express";

const PORT = 3003;
const app = express();

// Starting the Server
app.listen(PORT, async () => {
  console.log(`Starting server at port: ${PORT}`);
});

// Importing and Initializing ChatGPT
import { ChatGPTAPI } from "chatgpt";

const OPENAI_API_KEY = "XXX";
const openAI = new ChatGPTAPI({
  apiKey: OPENAI_API_KEY,
});

// Importing and Initializing Vonage
import { Vonage } from "@vonage/server-sdk";
import { MessengerText } from "@vonage/messages";

const VONAGE_API_KEY = "XXX";
const VONAGE_APPLICATION_ID = "XXX";
const VONAGE_PRIVATE_KEY_PATH = "./private.key";

const vonage = new Vonage({
  apiKey: VONAGE_API_KEY,
  applicationId: VONAGE_APPLICATION_ID,
  privateKey: VONAGE_PRIVATE_KEY_PATH,
});

// Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Defining Routes
app.get("/", (req, res) => {
  res.json(200);
});

app.post("/webhooks/callback", async (req, res) => {
  res.json(200);
});

const message_from_to_parent_message_id_map = {};
app.post("/webhooks/inbound-messaging", async (req, res) => {
  res.json(200);
  const message_to = req.body.to;
  const message_from = req.body.from;
  const received_text = req.body.text;
  console.log("Received message: ", received_text, "from: ", message_from);

  const chat_gpt_opts = {};

  if (message_from_to_parent_message_id_map[message_from]) {
    chat_gpt_opts["parentMessageId"] = message_from_to_parent_message_id_map[message_from];
  }
  openAI.sendMessage(received_text, chat_gpt_opts).then(async (chat_response) => {
    console.log("Chat GPT Response:", chat_response.text);

    message_from_to_parent_message_id_map[message_from] = chat_response.id;
    vonage.messages.send(
      new MessengerText({
        to: message_from,
        from: message_to,
        text: chat_response.text.slice(0, 640),
      })
    );
  });
});

// Tunneling with Localtunnel
import localtunnel from "localtunnel";
(async () => {
  const tunnel = await localtunnel({
    subdomain: "youruniquesubdomain",
    port: PORT,
  });
  console.log(`App available at: ${tunnel.url}`);
})();
