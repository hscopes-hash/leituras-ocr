import ZAI from "z-ai-web-dev-sdk";

async function testVision() {
  try {
    console.log("Criando ZAI...");
    const zai = await ZAI.create();
    console.log("ZAI criado!");
    
    // Imagem de teste pequena (1x1 pixel vermelho)
    const testImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";
    const imageUrl = `data:image/png;base64,${testImage}`;
    
    console.log("Testando createVision...");
    const response = await zai.chat.completions.createVision({
      model: 'glm-4v-flash',
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "O que você vê nesta imagem? Responda brevemente." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });
    
    console.log("Resposta completa:", JSON.stringify(response, null, 2));
    console.log("Conteúdo:", response.choices?.[0]?.message?.content);
  } catch (error) {
    console.error("ERRO:", error);
    console.error("Stack:", error?.stack);
  }
}

testVision();
