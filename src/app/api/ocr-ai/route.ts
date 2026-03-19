import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

// Configurar timeout maior para a rota
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { imageBase64, mimeType } = body;

    console.log("=== OCR API ===");
    console.log("ImageBase64 length:", imageBase64?.length || 0);
    console.log("MimeType:", mimeType);

    if (!imageBase64) {
      return NextResponse.json({
        success: false,
        error: "Imagem é obrigatória"
      }, { status: 400 });
    }

    // Verificar tamanho da imagem (máximo 5MB em base64 = ~3.7MB de imagem)
    const imageSizeMB = (imageBase64.length * 0.75) / (1024 * 1024);
    console.log("Tamanho da imagem:", imageSizeMB.toFixed(2), "MB");
    
    if (imageSizeMB > 5) {
      return NextResponse.json({
        success: false,
        error: `Imagem muito grande (${imageSizeMB.toFixed(1)}MB). Máximo: 5MB`
      }, { status: 400 });
    }

    console.log("Criando cliente ZAI...");
    const zai = await ZAI.create();
    console.log("ZAI criado");

    const imageUrl = `data:${mimeType || "image/jpeg"};base64,${imageBase64}`;

    console.log("Enviando para IA Vision...");
    
    const response = await zai.chat.completions.createVision({
      model: 'glm-4v-flash',
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Você é um especialista em ler displays de máquinas de jogos.

Analise esta foto de um display digital e extraia:

1. ENTRADA DE FICHA - O valor numérico que aparece junto a este texto
2. SALIDA CON LLAVE - O valor numérico que aparece junto a este texto

IMPORTANTE:
- Procure cuidadosamente pelos textos exatos "ENTRADA DE FICHA" e "SALIDA CON LLAVE"
- Extraia apenas os números associados a cada campo
- Se não encontrar, retorne null

Responda APENAS com JSON válido, sem texto adicional:
{"totalEntradas": valor_ou_null, "totalSaidas": valor_ou_null}`,
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
    });

    const processingTime = (Date.now() - startTime) / 1000;
    console.log(`IA respondeu em ${processingTime.toFixed(2)}s`);

    const rawContent = response.choices?.[0]?.message?.content || "";
    console.log("Resposta da IA:", rawContent.substring(0, 200));

    if (!rawContent) {
      return NextResponse.json({
        success: false,
        error: "IA não retornou resposta",
        processingTime,
      });
    }

    // Parsear resposta
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
        totalEntradas = parsed.totalEntradas != null ? String(parsed.totalEntradas) : undefined;
        totalSaidas = parsed.totalSaidas != null ? String(parsed.totalSaidas) : undefined;
      }
    } catch (parseError) {
      console.log("Erro no parse, tentando extrair números diretamente");
      // Tentar extrair números da resposta
      const numbers = rawContent.match(/\d+[\.,]?\d*/g);
      if (numbers && numbers.length >= 2) {
        totalEntradas = numbers[0];
        totalSaidas = numbers[1];
      }
    }

    console.log("Valores extraídos:", { totalEntradas, totalSaidas });

    return NextResponse.json({
      success: true,
      text: rawContent,
      totalEntradas,
      totalSaidas,
      processingTime,
    });

  } catch (error) {
    const processingTime = (Date.now() - startTime) / 1000;
    console.error("ERRO OCR:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      processingTime,
    }, { status: 500 });
  }
}
