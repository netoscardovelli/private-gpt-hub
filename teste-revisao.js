
// Arquivo de teste para demonstrar a revisão automática de código
function calcularTotal(items) {
    let total = 0
    for (let i = 0; i < items.length; i++) {
        total += items[i].preco * items[i].quantidade
    }
    return total
}

// Função com alguns problemas intencionais para teste
function processarDados(dados) {
    // Sem verificação de null/undefined
    const resultado = dados.map(item => {
        return {
            id: item.id,
            nome: item.nome.toUpperCase(), // Pode dar erro se nome for null
            valor: parseFloat(item.valor), // Sem tratamento de erro
            ativo: item.status == 'ativo' // Comparação com == ao invés de ===
        }
    })
    
    // Loop desnecessário
    let contador = 0
    for (let i = 0; i < resultado.length; i++) {
        contador++
    }
    
    console.log("Total de items:", contador) // Poderia usar resultado.length
    return resultado
}

// Função com performance questionável
function buscarItem(lista, id) {
    for (let i = 0; i < lista.length; i++) {
        if (lista[i].id === id) {
            return lista[i]
        }
    }
    // Sem return explícito para caso não encontre
}

// Exportação
module.exports = {
    calcularTotal,
    processarDados,
    buscarItem
}
