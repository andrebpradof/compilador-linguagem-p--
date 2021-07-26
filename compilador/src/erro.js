let erros = [];

module.exports = {
    set_erro(analizador, linha, erro){
        if (typeof erros[linha] == 'undefined') {
            erros[linha] = [];
        }
        erros[linha].push({
            analizador: analizador,
            linha: linha,
            erro: erro,
        })
    },
    get_erros(){
        return erros;
    }
}