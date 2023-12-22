import { TextGenerated, Login } from "polyfire-js/components";

function App() {
    return (
        <Login termsOfService="https://example.com/tos" privacyPolicy="https://example.com/privacy">
            <h2 className="font-bold">Here's a little auto-generated haiku for you:</h2>
            <TextGenerated
                className="whitespace-pre font-mono p-3 rounded-lg text-left border-solid border border-gray-500 inline-block bg-gray-200"
                prompt="Generate a hello world haiku"
                loadingElement="loading..."
            />
        </Login>
    );
}

export default App;
