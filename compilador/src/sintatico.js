const path = require("path");

let posicao_token = 0;
let token_atual = null;
let token_t = [];
let errors = null;

get_prox_token = () => {
    if (typeof token_t[posicao_token] != 'undefined') {
        token = token_t[posicao_token];
        posicao_token++;
        return token;
    }
    else {
        return null;
    }
};

modo_panico = (seguidores_imediatos = [], seguidores_pai = [], tokens_extras = []) => {
    while (true) {
        if (seguidores_imediatos.includes(token_atual['token'])) {
            return true
        }

        if (seguidores_pai.includes(token_atual['token'])) {
            return false
        }

        if (tokens_extras.includes(token_atual['token'])) {
            return false
        }

        token_atual = get_prox_token();
        if (token_atual == null) {
            break;
        }
    }
}

dc = (seguidores_pai) => {

    dc_c([].concat(["simb_var"], seguidores_pai));

    dc_v([].concat(["simb_procedure"], seguidores_pai));

    dc_p(seguidores_pai);
};

dc_c = (seguidores_pai) => {
    if (token_atual["token"] == "simb_const") {
        token_atual = get_prox_token();
    } else {
        return;
    }

    if (token_atual["token"] == "ident") {
        token_atual = get_prox_token();
    } else {
        errors.set_erro("sintático",token_atual["linha"],"Ausência de identificador");
        if (modo_panico(["simb_const"], seguidores_pai)) {
            dc_c(seguidores_pai);
        } else {
            return;
        }
    }

    if (token_atual["token"] == "simb_igual") {
        token_atual = get_prox_token();
    } else {
        errors.set_erro("sintático", token_atual["linha"], "Ausência do sinal de '='");
        modo_panico(["num_inteiro", "num_real"], seguidores_pai);
    }

    if ( token_atual["token"] == "num_inteiro" || token_atual["token"] == "num_real") {
        token_atual = get_prox_token();
    } else {
        errors.set_erro("sintático", token_atual["linha"], "Ausência de um número");
        modo_panico(["simb_ponto_virgula"], seguidores_pai);
    }

    if (token_atual["token"] == "simb_ponto_virgula") {
        token_atual = get_prox_token();
        dc_c(seguidores_pai);
    } else {
        errors.set_erro("sintático", token_atual["linha"]-1, "Ausência de ';'");
        if (modo_panico([], seguidores_pai, ["simb_const"])) {
            dc_c(seguidores_pai);
        }
    }
};

dc_v = (seguidores_pai) => {
    if (token_atual["token"] == "simb_var") {
        token_atual = get_prox_token();
    } else {
        return;
    }

    if (token_atual["token"] == "ident") {
        token_atual = get_prox_token();
        while (token_atual["token"] == "simb_virgula") {
            token_atual = get_prox_token();
            if (token_atual["token"] == "ident") {
                token_atual = get_prox_token();
            } else {
                if (token_atual["token"] != "simb_dp") {
                    modo_panico(["simb_dp"], seguidores_pai);
                }
                break;
            }
        }
    } else {
        errors.set_erro(
            "sintático",
            token_atual["linha"],
            "Ausência de identificador"
        );
        modo_panico([], seguidores_pai);
        return;
    }

    if (token_atual["token"] == "simb_dp") {
        token_atual = get_prox_token();
    } else {
        errors.set_erro("sintático", token_atual["linha"], "Ausência de ':'");
        modo_panico(["simb_tipo"], seguidores_pai);
    }

    if (token_atual["token"] == "simb_tipo") {
        token_atual = get_prox_token();
    } else {
        errors.set_erro(
            "sintático",
            token_atual["linha"],
            "Ausência de variável"
        );
        modo_panico(["simb_ponto_virgula"], seguidores_pai);
    }

    if (token_atual["token"] == "simb_ponto_virgula") {
        token_atual = get_prox_token();
        dc_v(seguidores_pai);
    } else {
        errors.set_erro("sintático", token_atual["linha"]-1, "Ausência de ';'");
        if (modo_panico([], seguidores_pai, ["simb_const"])) {
            dc_v(seguidores_pai);
        }
    }
};

dc_p = (seguidores_pai) => {
    if (token_atual["token"] == "simb_procedure") {
        token_atual = get_prox_token();
    } else {
        return;
    }

    if (token_atual["token"] == "ident") {
        token_atual = get_prox_token();
    } else {
        errors.set_erro(
            "sintático",
            token_atual["linha"],
            "Ausência de identificador"
        );
        modo_panico([], seguidores_pai);
        return;
    }

    if (
        token_atual["token"] == "simb_par" ||
        token_atual["token"] == "simb_ponto_virgula"
    ) {
        if (token_atual["token"] == "simb_par") {
            token_atual = get_prox_token();

            while (true) {

                variaveis([].concat(["simb_dp"], seguidores_pai));

                if (token_atual["token"] == "simb_dp") {
                    token_atual = get_prox_token();
                } else {
                    errors.set_erro("sintático", token_atual["linha"], "Ausência de ':'");
                    modo_panico(["real, integer"], seguidores_pai);
                }

                if (token_atual["token"] == "simb_tipo") {
                    token_atual = get_prox_token();
                } else {
                    errors.set_erro(
                        "sintático",
                        token_atual["linha"],
                        "Ausência de variável"
                    );
                    modo_panico(["simb_ponto_virgula", "simb_fpar"], seguidores_pai);
                }

                if (token_atual["token"] == "simb_ponto_virgula") {
                    token_atual = get_prox_token();
                } else {
                    break;
                }
            }
            if (token_atual["token"] == "simb_fpar") {
                token_atual = get_prox_token();
            } else {
                errors.set_erro("sintático", token_atual["linha"], "Ausência do ')'");
                modo_panico(["simb_ponto_virgula"], seguidores_pai);
            }
        }

        if (token_atual["token"] == "simb_ponto_virgula") {
            token_atual = get_prox_token();
        } else {
            errors.set_erro("sintático", token_atual["linha"]-1, "Ausência de ';'");
            modo_panico(["simb_var", "simb_begin"], seguidores_pai);
        }

        corpo_p(seguidores_pai); 
    } else {
        errors.set_erro("sintático", token_atual["linha"], "Procedure mal formado");
        modo_panico([], seguidores_pai);
        return;
    }
};

variaveis = (seguidores_pai) => {
    if (token_atual["token"] == "ident") {
        token_atual = get_prox_token();
    } else {
        errors.set_erro(
            "sintático",
            token_atual["linha"],
            "Ausência de identificador"
        );
        modo_panico([], seguidores_pai);
        return;
    }

    while (token_atual["token"] == "simb_virgula") {
        token_atual = get_prox_token();
        if (token_atual["token"] == "ident") {
            token_atual = get_prox_token();
        } else {
            modo_panico([], seguidores_pai);
            return;
        }
    }
};

corpo_p = (seguidores_pai) => {

    dc_v([].concat(["simb_begin"], seguidores_pai));

    if (token_atual["token"] == "simb_begin") {
        token_atual = get_prox_token();
    } else {
        errors.set_erro("sintático", token_atual["linha"], "Ausência do 'begin'");
        modo_panico(
            [
                "simb_read",
                "simb_write",
                "simb_for",
                "simb_while",
                "simb_if",
                "ident",
                "simb_begin",
            ],
            seguidores_pai
        );
    }
    
    comandos([].concat(["simb_end"], seguidores_pai));

    if (token_atual["token"] == "simb_end") {
        token_atual = get_prox_token();
    } 
    else {
        errors.set_erro("sintático", token_atual["linha"], "Ausência do 'end'");
        modo_panico(["simb_ponto_virgula"], seguidores_pai);
    }

    if (token_atual["token"] == "simb_ponto_virgula") {
        token_atual = get_prox_token();
    } else {
        errors.set_erro("sintático", token_atual["linha"]-1, "Ausência de ';'");
    }
};

argumentos = (seguidores_pai) => {
    if (token_atual["token"] == "simb_par") token_atual = get_prox_token();
    else {
        errors.set_erro("sintático", token_atual["linha"], "Ausência de '('");
        modo_panico(["ident"], seguidores_pai);
    }

    if(token_atual["token"] == "ident"){
        token_atual = get_prox_token();
    }
    else{
        errors.set_erro("sintático", token_atual["linha"], "Ausência de identificador");
        modo_panico(["simb_ponto_virgula", "simb_fpar"], seguidores_pai);
    }

    while (token_atual["token"] == "simb_ponto_virgula") {
        token_atual = get_prox_token();

        if (token_atual["token"] == "ident") {
            token_atual = get_prox_token();
        }
        else {
            errors.set_erro("sintático", token_atual["linha"], "Ausência de identificador");
            modo_panico(["simb_ponto_virgula", "simb_fpar"], seguidores_pai);
        }
    }
    if (token_atual["token"] == "simb_fpar") {
        token_atual = get_prox_token();
    }
    else {
        errors.set_erro("sintático", token_atual["linha"], "Ausência do ')'");
    }
};

relacao = () => {
    if (token_atual['token'] == 'simb_igual')
        token_atual = get_prox_token();
    else if (token_atual['token'] == 'simb_diff')
        token_atual = get_prox_token();
    else if (token_atual['token'] == 'simb_maior_igual')
        token_atual = get_prox_token();
    else if (token_atual['token'] == 'simb_menor_igual')
        token_atual = get_prox_token();
    else if (token_atual['token'] == 'simb_maior')
        token_atual = get_prox_token();
    else if (token_atual['token'] == 'simb_menor')
        token_atual = get_prox_token();
    else
        errors.set_erro('sintatico', token_atual['linha'], 'Ausência do operador relacional');
}


condicao = (seguidores_pai) => {
    expressao([].concat(['simb_igual', 'simb_diff', 'simb_maior_igual', 'simb_menor_igual', 'simb_maior', 'simb_menor'],seguidores_pai));
    relacao([].concat(['simb_mais', 'simb_menos', 'ident', 'num_inteiro', 'num_real', 'simb_par'], seguidores_pai));
    expressao(seguidores_pai);
}

comandos = (seguidores_pai) => {
    primeiro_comandos = ['simb_read', 'simb_write', 'simb_for', 'simb_while', 'simb_if', 'ident', 'simb_begin']

    while (primeiro_comandos.includes(token_atual['token'])) {
        
        cmd([].concat(["simb_ponto_virgula"], seguidores_pai));

        if (token_atual['token'] == 'simb_ponto_virgula') {
            token_atual = get_prox_token();
        }
        else {
            errors.set_erro('sintatico', token_atual['linha'], "Ausência do ';'")
            modo_panico(['simb_read', 'simb_write', 'simb_for', 'simb_while', 'simb_if', 'ident', 'simb_begin'], seguidores_pai)
        }
    }
}

expressao = (seguidores_pai) => {
    parenteses = false;
    primeiro_expressao = ['simb_mais', 'simb_menos', 'ident', 'num_real', 'num_inteiro', 'simb_par'];


    if (!primeiro_expressao.includes(token_atual['token'])) {
        modo_panico([], seguidores_pai);
        return;
    }

    while (primeiro_expressao.includes(token_atual['token'])) {

        if (token_atual['token'] == 'simb_mais' || token_atual['token'] == 'simb_menos') {
            token_atual = get_prox_token();
        }

        if (token_atual['token'] == 'ident' || token_atual['token'] == 'num_inteiro' || token_atual['token'] == 'num_real') {
            token_atual = get_prox_token();

            if (token_atual['token'] == 'simb_mult' || token_atual['token'] == 'simb_dividir' || token_atual['token'] == 'simb_menos' || token_atual['token'] == 'simb_mais') {
                token_atual = get_prox_token();
            }
        }

        if (token_atual['token'] == 'simb_par') {
            token_atual = get_prox_token();
            if (!primeiro_expressao.includes(token_atual['token'])) {
                modo_panico(primeiro_expressao, seguidores_pai);
            }
        }

        if (token_atual['token'] == 'simb_fpar' && parenteses == tru) {
            token_atual = get_prox_token();
        }
    }
}

cmd = (seguidores_pai) => {
    if (token_atual['token'] == 'simb_read' || token_atual['token'] == 'simb_write') {
        token_atual = get_prox_token();

        if (token_atual['token'] == 'simb_par')
            token_atual = get_prox_token();
        else {
            errors.set_erro('sintatico', token_atual['linha'], "Ausência de '('");
            modo_panico(['ident'], seguidores_pai);
        }

        variaveis([].concat(["simb_fpar"], seguidores_pai));

        if (token_atual['token'] == 'simb_fpar')
            token_atual = get_prox_token();
        else {
            errors.set_erro('sintatico', token_atual['linha'], "Ausência de ')'");
        }
    }
    else if (token_atual['token'] == 'simb_for') {
        token_atual = get_prox_token();

        if (token_atual['token'] == 'ident'){
            token_atual = get_prox_token();
        }
        else {
            errors.set_erro('sintatico', token_atual['linha'], 'Ausência do identificador');
            modo_panico(['simb_atribuicao'], seguidores_pai)
        }

        if (token_atual['token'] == 'simb_atribuicao')
            token_atual = get_prox_token()
        else {
            errors.set_erro('sintatico', token_atual['linha'], "Ausência do ':='")
            modo_panico(['simb_mais', 'simb_menos', 'ident', 'num_real', 'num_inteiro'], seguidores_pai)
        }

        expressao([].concat(["simb_to"], seguidores_pai))

        if (token_atual['token'] == 'simb_to')
            token_atual = get_prox_token()
        else {
            errors.set_erro('sintatico', token_atual['linha'],"Ausência do 'to'")
            modo_panico(['simb_mais', 'simb_menos', 'ident', 'num_real', 'num_inteiro'], seguidores_pai)
        }

        expressao([].concat(["simb_to"], seguidores_pai));

        if (token_atual['token'] == 'simb_do')
            token_atual = get_prox_token()
        else {
            errors.set_erro('sintatico', token_atual['linha'], "Ausência do 'do'")
            modo_panico(['simb_mais', 'simb_menos', 'ident', 'num_real', 'num_inteiro'], seguidores_pai)
        }

        cmd(seguidores_pai);
    }
    else if (token_atual['token'] == 'simb_while') {
        token_atual = get_prox_token();

        if (token_atual['token'] == 'simb_par')
            token_atual = get_prox_token();
        else {
            errors.set_erro('sintatico', token_atual['linha'], "Ausência do '('");
            modo_panico(['simb_mais', 'simb_menos', 'ident', 'num_inteiro', 'num_real', 'simb_par'], seguidores_pai);
        }

        condicao([].concat(['simb_fpar'], seguidores_pai));

        if (token_atual['token'] == 'simb_fpar')
            token_atual = get_prox_token()
        else {
            errors.set_erro('sintatico', token_atual['linha'], "Ausência de ')'")
            modo_panico(['simb_do'], seguidores_pai)
        }

        if (token_atual['token'] == 'simb_do'){
            token_atual = get_prox_token();
        }
        else {
            errors.set_erro('sintatico', token_atual['linha'], "Ausência do 'do'");
        }

        cmd(seguidores_pai);
    }
    else if (token_atual['token'] == 'simb_if') {
        token_atual = get_prox_token();
        
        condicao([].concat(["simb_then"], seguidores_pai))

        if (token_atual['token'] == 'simb_then') {
            token_atual = get_prox_token();
            cmd([].concat(['else'], seguidores_pai))
        }
        else {
            errors.set_erro('sintatico', token_atual['linha'], "Ausência do 'then'")
            modo_panico(['else'], seguidores_pai)
        }

        if (token_atual['token'] == 'simb_else') {
            token_atual = get_prox_token();
            cmd(seguidores_pai);
        }
    }
    else if (token_atual['token'] == 'ident') {
        token_atual = get_prox_token();

        if (token_atual['token'] == 'simb_atribuicao') {
            token_atual = get_prox_token();
            expressao(seguidores_pai);
        }
        else {
            argumentos(seguidores_pai);
        }
    }
    else if (token_atual['token'] == 'simb_begin') {
        token_atual = get_prox_token();

        comandos([].concat(["simb_end"], seguidores_pai));

        if (token_atual['token'] == 'simb_end'){
            token_atual = get_prox_token();
        } 
        else{
            errors.set_erro('sintatico', token_atual['linha'], "Ausência do 'end'");
        }
    }
}

module.exports = {
    start(token_table, erros) {
        
        errors = erros;
        token_t = token_table;
        token_atual = get_prox_token();

        seguidores_pai = [];
        
        if (token_atual["token"] == "simb_program") {
            token_atual = get_prox_token();
        } else {
            errors.set_erro("sintático", token_atual["linha"], "Ausência do 'program'");
            modo_panico(["ident"], seguidores_pai);
        }

        if (token_atual["token"] == "ident") {
            token_atual = get_prox_token();
        } else {
            errors.set_erro(
                "sintático",
                token_atual["linha"],
                "Ausência do identificador"
            );
            modo_panico(["simb_ponto_virgula"], seguidores_pai);
        }

        if (token_atual["token"] == "simb_ponto_virgula") {
            token_atual = get_prox_token();
        } else {
            errors.set_erro(
                "sintático",
                token_atual["linha"],
                "Ausência do ';'"
            );
            modo_panico(["simb_const", "simb_var", "simb_procedure"], seguidores_pai);
        }
        
        dc([].concat(["simb_begin"], seguidores_pai));

        if (token_atual["token"] == "simb_begin") {
            token_atual = get_prox_token();
        } else {
            errors.set_erro("sintático", token_atual["linha"], "Ausência do 'begin'");
            modo_panico(
                [
                    "simb_read",
                    "simb_write",
                    "simb_for",
                    "simb_while",
                    "simb_if",
                    "ident",
                    "simb_begin",
                ],
                seguidores_pai
            );
        }
    
        comandos([].concat(["simb_end"], seguidores_pai));

        let aux_linha;
        if (token_atual["token"] == "simb_end") {
            aux_linha = token_atual["linha"];
            token_atual = get_prox_token();
        } else {
            errors.set_erro("sintático", token_atual["linha"], "Ausência do 'end'");
            modo_panico(["simb_ponto"], seguidores_pai);
        }

        if(token_atual == null){
            errors.set_erro("sintático", aux_linha, "Ausência do '.'");
        }
        else if (token_atual["token"] != "simb_ponto") {
            errors.set_erro("sintático", token_atual["linha"], "Ausência do '.'");
        }
    },
};
