import { db } from "@/lib/db";
import { hash } from "bcryptjs";

async function main() {
  console.log("Iniciando seed...");

  // Criar senha hasheada
  const senhaHash = await hash("12345", 10);

  // Criar usuário administrador
  const adminExistente = await db.usuario.findFirst({ where: { nome: "BETO" } });
  
  if (!adminExistente) {
    await db.usuario.create({
      data: {
        nome: "BETO",
        senha: senhaHash,
        nivel: "ADMINISTRADOR",
        nomeCompleto: "Beto",
        ativo: true,
      },
    });
    console.log("Usuário BETO criado!");
  } else {
    console.log("Usuário BETO já existe");
  }

  // Criar tipo de máquina padrão
  const tipoExistente = await db.tipoMaquina.findFirst({ where: { codigo: 1 } });
  
  if (!tipoExistente) {
    await db.tipoMaquina.create({
      data: {
        codigo: 1,
        descricao: "CAÇA NÍQUEL",
        campoEntrada: "ENTRADA",
        campoSaida: "SAIDA",
      },
    });
    console.log("Tipo de máquina criado!");
  }

  // Criar local padrão
  const localExistente = await db.local.findFirst({ where: { codigo: 1 } });
  
  if (!localExistente) {
    await db.local.create({
      data: {
        codigo: 1,
        nome: "LOCAL PRINCIPAL",
        adicional: "MATRIZ",
        percentual: 0,
      },
    });
    console.log("Local criado!");
  }

  console.log("\n=== SEED CONCLUÍDO ===");
  console.log("Usuário: BETO");
  console.log("Senha: 12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
