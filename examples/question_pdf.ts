import { generate, PDFLoader } from "../lib/index";

async function main() {
    const response = await generate("What is polyfact ?", {
        data: PDFLoader(
            "/home/lancelot/Downloads/Polyfact_-_Open-Source_Library_of_LLM-based_Dev_Tool_Packages.pdf",
        ),
    });

    console.log(response);
}

main();
