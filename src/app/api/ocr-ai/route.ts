import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64) {
      return NextResponse.json({
        success: false,
        text: "",
        error: "Imagem é obrigatória"
      }, { status: 400 });
    }

    console.log("=== Iniciando OCR com IA Vision ===");
    const startTime = Date.now();

    const zai = await ZAI.create();

    const imageUrl = `data:${mimeType || "image/jpeg"};base64,${imageBase64}`;

    const response = await zai.chat.completions.createVision({
      model: 'glm-4.6v',
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Você é um especialista em extrair dados de displays de máquinas de jogos.

Analise esta imagem com MUITA ATENÇÃO e encontre:

1. **TOTAL ENTRADAS**: Procure por:
   - "ENTRADA", "ENTRADAS", "IN", "TOTAL IN", "CREDIT", "CRÉDITO"
   - Valores numéricos que representem entradas

2. **TOTAL SAÍDAS**: Procure por:
   - "SAÍDA", "SAÍDAS", "OUT", "TOTAL OUT", "DÉBITO"
   - Valores numéricos que representem saídas

Responda APENAS com JSON (sem markdown):
{"totalEntradas": "valor ou null", "totalSaidas": "valor ou null"}`,
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      thinking: { type: 'disabled' },
    });

    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;
    console.log(`OCR concluído em ${processingTime.toFixed(2)}s`);

    const rawContent = response.choices?.[0]?.message?.content || "";
    console.log("Resposta da IA:", rawContent.substring(0, 300));

    let totalEntradas: string | undefined;
    let totalSaidas: string | undefined;
    
    try {
      let cleanContent = rawContent
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();
      
      const jsonMatch = cleanContent.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        totalEntradas = parsed.totalEntradas || undefined;
        totalSaidas = parsed.totalSaidas || undefined;
        
        if (totalEntradas === null || totalEntradas === "null") totalEntradas = undefined;
        if (totalSaidas === null || totalSaidas === "null") totalSaidas = undefined;
        
        console.log("Extraído:", { totalEntradas, totalSaidas });
      }
    } catch (parseError) {
      console.error("Erro parse:", parseError);
    }

    return NextResponse.json({
      success: true,
      text: rawContent,
      totalEntradas,
      totalSaidas,
    });
  } catch (error) {
    console.error("ERRO OCR:", error);
    return NextResponse.json({
      success: false,
      text: "",
      error: "Erro ao processar",
      details: error instanceof Error ? error.message : "Erro",
    });
  }
}
