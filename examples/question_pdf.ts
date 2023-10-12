import { generate, PDFLoader } from "../lib/index";

async function main() {
    const response = await generate("What is polyfire ?", {
        data: PDFLoader(
            "/home/lancelot/Downloads/Polyfire_-_Open-Source_Library_of_LLM-based_Dev_Tool_Packages.pdf",
        ),
    });

    console.log(response);
}

main();
