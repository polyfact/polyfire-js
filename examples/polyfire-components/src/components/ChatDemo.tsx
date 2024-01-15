import React, { ChangeEvent, useState } from "react";
import Chat, { CustomChatColor } from "@polyfire-ai/chat-ui";
import { ChatOptions } from "polyfire-js/chats";

import "@polyfire-ai/chat-ui/styles.css";
import CodeDisplay from "./CodeDisplay";

const options: ChatOptions = {};

const code = ` 
<Chat.Root baseChatColor={color} options={options}>
    <Chat.Sidebar>
        <Chat.SidebarHeader />
        <Chat.NewChatButton />
        <Chat.ChatList />
    </Chat.Sidebar>
    <Chat.View>
        <Chat.History
            HistoryItemComponent={Chat.RoundedChatListItem}
            HistoryLoadingComponent={Chat.RoundedHistoryLoadingComponent}
            HistoryEmptyComponent={Chat.HistoryEmptyComponent}
        />

        <Chat.Prompt>
            <Chat.Input />
            <Chat.SendButton />
        </Chat.Prompt>
    </Chat.View>
</Chat.Root>`;

type Theme = "light" | "dark" | "auto" | `#${string}` | CustomChatColor;

const ChatUI = ({ theme }: { theme: Theme }) => {
    return (
        <Chat.Root baseChatColor={theme} options={options}>
            <Chat.Sidebar>
                <Chat.SidebarHeader />
                <Chat.NewChatButton />
                <Chat.ChatList />
                <Chat.SidebarButtonGroup>
                    <Chat.SidebarButton
                        label="Return to component"
                        onClick={() => window.history.back()}
                    />
                </Chat.SidebarButtonGroup>
            </Chat.Sidebar>
            <Chat.View>
                <Chat.History
                    HistoryItemComponent={Chat.RoundedChatListItem}
                    HistoryLoadingComponent={Chat.RoundedHistoryLoadingComponent}
                    HistoryEmptyComponent={Chat.HistoryEmptyComponent}
                />

                <Chat.Prompt>
                    <Chat.Input />
                    <Chat.SendButton />
                </Chat.Prompt>
            </Chat.View>
        </Chat.Root>
    );
};

const ChatDemo: React.FC = () => {
    const [color, setColor] = useState("#78716C");
    const [baseColor, setBaseColor] = useState<Theme>("#78716C");

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        setColor(value);
        if (value.length === 7 && value.startsWith("#")) {
            setBaseColor(value as Theme);
        }
    };

    return (
        <div className="p-1 mb-10 w-full">
            <div className="mb-6">
                <h3 className="text-md font-bold mb-4">Dynamic Text Generation</h3>
                <div className="flex flex-col">
                    <div>
                        <h4 className="font-semibold mb-2 text-stone-100">Chat Color</h4>
                        <input
                            value={color}
                            onChange={handleInputChange}
                            className="border border-stone-300 rounded px-2 py-1.5 mb-4 w-full bg-stone-700"
                        />
                    </div>
                </div>

                <h4 className="font-semibold my-2">Result</h4>
                <div className="relative h-[500px]">
                    <div>
                        <ChatUI theme={baseColor} key={baseColor as string} />
                    </div>
                </div>

                <h4 className="font-semibold my-2">Code</h4>
                <CodeDisplay code={code} />
            </div>
        </div>
    );
};

export default ChatDemo;
