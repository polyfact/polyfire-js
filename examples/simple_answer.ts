import { Chat } from "../lib/index";

async function main() {
    const chat = new Chat({ model: "best" });

    console.log(await chat.chatId);

    console.log(await chat.getMessages());

    let prompt = "Who is the first person to have walked on the moon?";
    console.log(prompt);

    let result = await chat.sendMessage(prompt);
    console.log(result);

    prompt = "Who is the second ?";
    console.log(prompt);

    result = await chat.sendMessage(prompt);
    console.log(result);

    prompt = "Who was the president of the United States at the time?";
    console.log(prompt);

    result = await chat.sendMessage(prompt);
    console.log(result);

    console.log(await chat.getMessages());
}

main();
