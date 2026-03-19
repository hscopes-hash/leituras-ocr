import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

interface OCRResponse {
  success: boolean;
  text: string;
  totalEntradas?: string;
  totalSaidas?: string;
  error?: string;
  details?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<OCRResponse>> {
  try {
    const body = await request.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: "Imagem é obrigatória" },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Você é um sistema de OCR de alta precisão. Sua tarefa é extrair TODO o texto da imagem com FIDELIDADE MÁXIMA.

REGRAS OBRIGATÓRIAS:

1. **FIDELIDADE ABSOLUTA**: Transcreva exatamente o que está escrito, incluindo:
   - Todos os caracteres, pontuações e símbolos
   - Maiúsculas e minúsculas exatamente como aparecem
   - Números, valores monetários e unidades de medida
   - Caracteres especiais (®, ™, ©, etc.)

2. **PRESERVAÇÃO DE LAYOUT**:
   - Mantenha a estrutura de linhas e colunas da imagem
   - Use quebras de linha (Enter) para separar linhas visuais
   - Para tabelas: use ESPAÇOS ou TABULAÇÃO para alinhar colunas
   - Preserve a ordem de leitura (esquerda para direita, cima para baixo)

3. **TABELAS E DADOS TABULARES**:
   - Identifique tabelas e preserve-as em formato tabular
   - Alinhe colunas com espaçamento consistente
   - Mantenha cabeçalhos claramente separados dos dados
   - Se houver grades/linhas, represente a estrutura visual

4. **NÃO ADICIONE NADA**:
   - Não faça comentários, explicações ou interpretações
   - Não adicione texto que não esteja na imagem
   - Não corrija erros de ortografia da imagem
   - Não formate além do necessário para preservar o layout

5. **TEXTO ILEGÍVEL**:
   - Se houver texto parcialmente legível, transcreva o que for possível
   - Use [?] apenas para caracteres completamente ilegíveis
   - Nunca invente ou assuma conteúdo

Após extrair o texto, identifique e retorne também:
- TOTAL ENTRADAS: o valor numérico encontrado (se houver)
- TOTAL SAÍDAS: o valor numérico encontrado (se houver)

Responda EXATAMENTE no seguinte formato JSON:
{
  "texto": "texto completo extraído",
  "totalEntradas": "valor ou null",
  "totalSaidas": "valor ou null"
}

Retorne APENAS o JSON, sem nenhum comentário adicional.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      thinking: { type: "disabled" },
    });

    const rawContent = response.choices[0]?.message?.content || "";
    
    // Parse da resposta JSON
    let extractedText = "";
    let totalEntradas: string | undefined;
    let totalSaidas: string | undefined;
    
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        extractedText = parsed.texto || parsed.texto || rawContent;
        totalEntradas = parsed.totalEntradas || undefined;
        totalSaidas = parsed.totalSaidas || undefined;
      } else {
        extractedText = rawContent;
      }
    } catch {
      extractedText = rawContent;
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      totalEntradas,
      totalSaidas,
    });
  } catch (error) {
    console.error("Erro no OCR com IA:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar imagem com IA",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
