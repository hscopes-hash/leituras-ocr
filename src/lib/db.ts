// Mock do banco de dados para modo demo (sem MongoDB)
// Quando configurar MONGODB_URI, substituir por conexão real

import { hash, compare } from 'bcryptjs'

// Dados em memória
const data: {
  usuarios: any[]
  maquinas: any[]
  locais: any[]
  tiposMaquina: any[]
  leituras: any[]
} = {
  usuarios: [],
  maquinas: [],
  locais: [],
  tiposMaquina: [],
  leituras: [],
}

// Inicializar usuário admin
async function initAdmin() {
  if (data.usuarios.length === 0) {
    const senhaHash = await hash('admin123', 10)
    data.usuarios.push({
      id: '1',
      codigo: 1,
      nome: 'admin',
      senha: senhaHash,
      nivel: 'admin',
      nomeCompleto: 'Administrador',
      ativo: true,
      createdAt: new Date(),
    })
  }
}
initAdmin()

// Funções auxiliares
function filterByWhere(items: any[], where: any): any[] {
  if (!where) return items
  return items.filter(item => {
    for (const key in where) {
      if (key === 'NOT') {
        for (const notKey in where.NOT) {
          if (item[notKey] === where.NOT[notKey]) return false
        }
      } else if (key === 'equals') {
        continue
      } else if (typeof where[key] === 'object' && where[key]?.equals !== undefined) {
        if (item[key] !== where[key].equals) return false
      } else {
        if (item[key] !== where[key]) return false
      }
    }
    return true
  })
}

function selectFields(item: any, select: any): any {
  if (!select) return item
  const result: any = {}
  for (const key in select) {
    if (select[key] === true) {
      result[key] = item[key]
    }
  }
  return result
}

function orderByItems(items: any[], orderBy: any): any[] {
  if (!orderBy) return items
  const sorted = [...items]
  sorted.sort((a, b) => {
    for (const key in orderBy) {
      const dir = orderBy[key] === 'desc' ? -1 : 1
      if (a[key] < b[key]) return -1 * dir
      if (a[key] > b[key]) return 1 * dir
    }
    return 0
  })
  return sorted
}

// Mock do Prisma Client
export const db = {
  usuario: {
    findMany: async (opts?: any) => {
      let result = filterByWhere(data.usuarios, opts?.where)
      result = orderByItems(result, opts?.orderBy)
      if (opts?.select) {
        result = result.map(item => selectFields(item, opts.select))
      }
      return result
    },
    findFirst: async (opts?: any) => {
      const result = filterByWhere(data.usuarios, opts?.where)
      return result[0] || null
    },
    findUnique: async (opts?: any) => {
      return data.usuarios.find(u => u.id === opts?.where?.id) || null
    },
    create: async (opts: any) => {
      const id = String(data.usuarios.length + 1)
      const codigo = data.usuarios.length + 1
      const novo = { id, codigo, createdAt: new Date(), ...opts.data }
      data.usuarios.push(novo)
      if (opts?.select) {
        return selectFields(novo, opts.select)
      }
      return novo
    },
    update: async (opts: any) => {
      const idx = data.usuarios.findIndex(u => u.id === opts.where.id)
      if (idx === -1) throw new Error('Usuário não encontrado')
      data.usuarios[idx] = { ...data.usuarios[idx], ...opts.data }
      if (opts?.select) {
        return selectFields(data.usuarios[idx], opts.select)
      }
      return data.usuarios[idx]
    },
    delete: async (opts: any) => {
      const idx = data.usuarios.findIndex(u => u.id === opts.where.id)
      if (idx !== -1) {
        data.usuarios.splice(idx, 1)
      }
      return { success: true }
    },
  },

  maquina: {
    findMany: async (opts?: any) => {
      let result = filterByWhere(data.maquinas, opts?.where)
      result = orderByItems(result, opts?.orderBy)
      if (opts?.include?.tipo) {
        result = result.map((m: any) => ({
          ...m,
          tipo: data.tiposMaquina.find(t => t.id === m.tipoId) || null
        }))
      }
      return result
    },
    findFirst: async (opts?: any) => {
      const result = filterByWhere(data.maquinas, opts?.where)
      return result[0] || null
    },
    findUnique: async (opts?: any) => {
      let maquina = data.maquinas.find(m => m.id === opts?.where?.id) || null
      if (!maquina && opts?.where?.codigo) {
        maquina = data.maquinas.find(m => m.codigo === opts.where.codigo) || null
      }
      return maquina
    },
    create: async (opts: any) => {
      const id = String(data.maquinas.length + 1)
      const codigo = data.maquinas.length + 1
      const novo = { id, codigo, entrada: 0, saida: 0, createdAt: new Date(), ...opts.data }
      data.maquinas.push(novo)
      return novo
    },
    update: async (opts: any) => {
      const idx = data.maquinas.findIndex(m => m.id === opts.where.id)
      if (idx === -1) throw new Error('Máquina não encontrada')
      
      // Tratar increment
      const updateData = { ...opts.data }
      if (updateData.entrada?.increment !== undefined) {
        updateData.entrada = data.maquinas[idx].entrada + updateData.entrada.increment
      }
      if (updateData.saida?.increment !== undefined) {
        updateData.saida = data.maquinas[idx].saida + updateData.saida.increment
      }
      
      data.maquinas[idx] = { ...data.maquinas[idx], ...updateData }
      return data.maquinas[idx]
    },
    delete: async (opts: any) => {
      const idx = data.maquinas.findIndex(m => m.id === opts.where.id)
      if (idx !== -1) {
        data.maquinas.splice(idx, 1)
      }
      return { success: true }
    },
  },

  local: {
    findMany: async (opts?: any) => {
      let result = filterByWhere(data.locais, opts?.where)
      result = orderByItems(result, opts?.orderBy)
      return result
    },
    findFirst: async (opts?: any) => {
      const result = filterByWhere(data.locais, opts?.where)
      return result[0] || null
    },
    findUnique: async (opts?: any) => {
      let local = data.locais.find(l => l.id === opts?.where?.id) || null
      if (!local && opts?.where?.codigo) {
        local = data.locais.find(l => l.codigo === opts.where.codigo) || null
      }
      return local
    },
    create: async (opts: any) => {
      const id = String(data.locais.length + 1)
      const codigo = data.locais.length + 1
      const novo = { id, codigo, createdAt: new Date(), ...opts.data }
      data.locais.push(novo)
      return novo
    },
    update: async (opts: any) => {
      const idx = data.locais.findIndex(l => l.id === opts.where.id)
      if (idx === -1) throw new Error('Local não encontrado')
      data.locais[idx] = { ...data.locais[idx], ...opts.data }
      return data.locais[idx]
    },
    delete: async (opts: any) => {
      const idx = data.locais.findIndex(l => l.id === opts.where.id)
      if (idx !== -1) {
        data.locais.splice(idx, 1)
      }
      return { success: true }
    },
  },

  tipoMaquina: {
    findMany: async (opts?: any) => {
      let result = filterByWhere(data.tiposMaquina, opts?.where)
      result = orderByItems(result, opts?.orderBy)
      return result
    },
    findFirst: async (opts?: any) => {
      const result = filterByWhere(data.tiposMaquina, opts?.where)
      return result[0] || null
    },
    create: async (opts: any) => {
      const id = String(data.tiposMaquina.length + 1)
      const codigo = data.tiposMaquina.length + 1
      const novo = { id, codigo, createdAt: new Date(), ...opts.data }
      data.tiposMaquina.push(novo)
      return novo
    },
    update: async (opts: any) => {
      const idx = data.tiposMaquina.findIndex(t => t.id === opts.where.id)
      if (idx === -1) throw new Error('Tipo não encontrado')
      data.tiposMaquina[idx] = { ...data.tiposMaquina[idx], ...opts.data }
      return data.tiposMaquina[idx]
    },
    delete: async (opts: any) => {
      const idx = data.tiposMaquina.findIndex(t => t.id === opts.where.id)
      if (idx !== -1) {
        data.tiposMaquina.splice(idx, 1)
      }
      return { success: true }
    },
  },

  leitura: {
    findMany: async (opts?: any) => {
      let result = filterByWhere(data.leituras, opts?.where)
      result = orderByItems(result, opts?.orderBy)
      
      // Include relations
      if (opts?.include) {
        result = result.map((l: any) => ({
          ...l,
          maquina: opts.include.maquina ? {
            ...data.maquinas.find(m => m.id === l.maquinaId),
            tipo: opts.include.maquina.include?.tipo 
              ? data.tiposMaquina.find(t => t.id === data.maquinas.find(m => m.id === l.maquinaId)?.tipoId)
              : undefined
          } : undefined,
          local: opts.include.local ? data.locais.find(loc => loc.id === l.localId) : undefined,
          usuario: opts.include.usuario 
            ? selectFields(data.usuarios.find(u => u.id === l.usuarioId) || {}, opts.include.usuario.select)
            : undefined,
        }))
      }
      
      if (opts?.take) {
        result = result.slice(0, opts.take)
      }
      
      return result
    },
    findFirst: async (opts?: any) => {
      const result = filterByWhere(data.leituras, opts?.where)
      return result[0] || null
    },
    create: async (opts: any) => {
      const id = String(data.leituras.length + 1)
      const novo = { id, dataLeitura: new Date(), ...opts.data }
      data.leituras.push(novo)
      
      // Include relations no retorno
      let result: any = { ...novo }
      if (opts?.include) {
        result.maquina = opts.include.maquina ? {
          ...data.maquinas.find(m => m.id === novo.maquinaId),
          tipo: opts.include.maquina.include?.tipo 
            ? data.tiposMaquina.find(t => t.id === data.maquinas.find(m => m.id === novo.maquinaId)?.tipoId)
            : undefined
        } : undefined
        result.local = opts.include.local ? data.locais.find(loc => loc.id === novo.localId) : undefined
        result.usuario = opts.include.usuario 
          ? selectFields(data.usuarios.find(u => u.id === novo.usuarioId) || {}, opts.include.usuario.select)
          : undefined
      }
      
      return result
    },
    delete: async (opts: any) => {
      const idx = data.leituras.findIndex(l => l.id === opts.where.id)
      if (idx !== -1) {
        data.leituras.splice(idx, 1)
      }
      return { success: true }
    },
    groupBy: async (opts?: any) => {
      // Simplificado - retorna array vazio
      return []
    },
  },
}
