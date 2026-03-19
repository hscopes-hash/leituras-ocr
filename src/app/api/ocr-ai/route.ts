import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, mimeType } = body;

    console.log("=== Requisição OCR recebida ===");
    console.log("Tamanho da imagem (base64):", imageBase64?.length || 0);
    console.log("MimeType:", mimeType);

    if (!imageBase64) {
      console.log("ERRO: Imagem não fornecida");
      return NextResponse.json({
        success: false,
        text: "",
        error: "Imagem é obrigatória"
      }, { status: 400 });
    }

    console.log("=== Iniciando OCR com IA Vision ===");
    const startTime = Date.now();

    try {
      const zai = await ZAI.create();
      console.log("ZAI criado com sucesso");

      const imageUrl = `data:${mimeType || "image/jpeg"};base64,${imageBase64}`;
      console.log("Image URL preparada, tamanho:", imageUrl.length);

      console.log("Chamando createVision...");
      const response = await zai.chat.completions.createVision({
        model: 'glm-4v-flash',
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analise esta imagem de um display de máquina de jogos.

PROCURE E EXTRAIA OS VALORES NUMÉRICOS:

1. Campo "ENTRADA DE FICHA" - valor numérico que aparece junto a este texto
2. Campo "SALIDA CON LLAVE" - valor numérico que aparece junto a este texto

Responda APENAS em formato JSON:
{"totalEntradas": "numero", "totalSaidas": "numero"}

Se não encontrar um valor, use null.`,
              },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
      });

      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;
      console.log(`OCR concluído em ${processingTime.toFixed(2)}s`);

      console.log("Response completa:", JSON.stringify(response, null, 2).substring(0, 500));

      const rawContent = response.choices?.[0]?.message?.content || "";
      console.log("Resposta da IA:", rawContent);

      if (!rawContent) {
        console.log("ERRO: Resposta vazia da IA");
        return NextResponse.json({
          success: false,
          text: "",
          error: "IA retornou resposta vazia",
          processingTime,
        });
      }

      let totalEntradas: string | undefined;
      let totalSaidas: string | undefined;
      
      try {
        let cleanContent = rawContent
          .replace(/```json\s*/gi, '')
          .replace(/```\s*/gi, '')
          .trim();
        
        console.log("Conteúdo limpo:", cleanContent);
        
        const jsonMatch = cleanContent.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log("JSON parseado:", parsed);
          
          totalEntradas = parsed.totalEntradas || undefined;
          totalSaidas = parsed.totalSaidas || undefined;
          
          if (totalEntradas === null || totalEntradas === "null") totalEntradas = undefined;
          if (totalSaidas === null || totalSaidas === "null") totalSaidas = undefined;
          
          console.log("Extraído:", { totalEntradas, totalSaidas });
        } else {
          console.log("Nenhum JSON encontrado na resposta");
        }
      } catch (parseError) {
        console.error("Erro ao fazer parse do JSON:", parseError);
      }

      return NextResponse.json({
        success: true,
        text: rawContent,
        totalEntradas,
        totalSaidas,
        processingTime,
      });

    } catch (aiError) {
      console.error("ERRO NA IA:", aiError);
      return NextResponse.json({
        success: false,
        text: "",
        error: "Erro na IA: " + (aiError instanceof Error ? aiError.message : String(aiError)),
        details: aiError instanceof Error ? aiError.stack : undefined,
      });
    }

  } catch (error) {
    console.error("ERRO GERAL OCR:", error);
    return NextResponse.json({
      success: false,
      text: "",
      error: "Erro ao processar",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
