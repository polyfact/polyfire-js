import client, { PromptInsert, Filter } from "../lib/prompt";

async function main() {
    const apiClient = client({
        token: "YOUR_API_TOKEN",
        endpoint: "https://localhost:8080",
    });

    // Create a new prompt
    const newPrompt: PromptInsert = {
        name: "Test Prompt",
        description: "This is a test prompt description.",
        prompt: "What is the meaning of life?",
        tags: ["philosophy", "life"],
    };
    const createdPrompt = await apiClient.createPrompt(newPrompt);
    console.log("Created Prompt:", createdPrompt);

    // Get all prompts
    const allPrompts = await apiClient.getAllPrompts();
    console.log("All Prompts:", allPrompts);

    // Get all prompts filtered by name
    const filterByName: Filter = {
        column: "name",
        operation: "eq",
        value: "Test Prompt",
    };
    const filteredPrompts = await apiClient.getAllPrompts([filterByName]);
    console.log("Filtered Prompts:", filteredPrompts);

    // Update a prompt
    const updatedData = { description: "Updated description" };
    const updatedPrompt = await apiClient.updatePrompt(createdPrompt.id, updatedData);
    console.log("Updated Prompt:", updatedPrompt);

    // Delete a prompt
    await apiClient.deletePrompt(createdPrompt.id);
    console.log("Prompt Deleted!");
}

main().catch((error) => {
    console.error("An error occurred:", error);
});
