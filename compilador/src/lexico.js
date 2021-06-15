const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { range } = require("range");
const { memory } = require('console');

const tabela_reservados = {
  program: 'simb_program',
  var: 'simb_var',
  integer: 'simb_tipo',
  real: 'simb_tipo',
  begin: 'simb_begin',
  end: 'simb_end',
  while: 'simb_while',
  read: 'simb_read',
  write: 'simb_write',
  const: 'simb_const',
  procedure: 'simb_procedure',
  else: 'simb_else',
  then: 'simb_then',
  if: 'simb_if',
  do: 'simb_do',
  to: 'simb_to',
  for: 'simb_for'
};

const operadores = [';', ':', '+', '-', '*', '/', '(', ')', '=', ',', '>', '<', '.']; 

let token = [];

automatoNumero = (aux, num_linha) => {
  let auto_estado = 0;
  let tama_cont = 0;
  let saida = null;
  let c;

  for(let i = 0; i < aux.length; i++){
    c = aux[i];
    switch(auto_estado){
      case 0:
        if(c >= '0' && c <= '9'){
          auto_estado = 2;
          tama_cont++;
  
          if(aux.length == 1){
            token.push({'lexema': aux, 'token': 'num_inteiro', 'linha': num_linha});
            saida = {status: true };
          }
        }
        else if(c == '-' || c == '+') 
          estado = 1  
        else{
          estado = 5
        }
        break;

      case 1:
        if(c >= '0' && c <= '9'){
          tama_cont++;
          auto_estado = 2;
        }
        else
          auto_estado = 4;
        break
  
      case 2:
        if(i >= aux.length - 1){
          if(c >= '0' && c <= '9')
            token.push({'lexema': aux, 'token': 'num_inteiro', 'linha': num_linha});
          else{
            token.push({'lexema': aux, 'token': 'Numero mal formado', 'linha': num_linha});
          }
          saida = {status: true };
        }
        else if(c == '.')
          auto_estado = 3;
        else if(c >= '0' && c <= '9')
          tama_cont++;
        else
          auto_estado = 4;
        break;
      
      case 3:
        if(i >= aux.length - 1){
          if(c >= '0' && c <= '9')
            token.push({'lexema': aux, 'token': 'num_real', 'linha': num_linha});
          else{
            token.push({'lexema': aux, 'token': 'Numero mal formado', 'linha': num_linha});
          }
          saida = {status: true };
        }
        else if(c >= '0' && c <= '9')
          tama_cont++;
        else
          auto_estado = 4;
        break;

      case 4:
        token.push({'lexema': aux, 'token': 'Numero mal formado', 'linha': num_linha});
        saida = {status: true };
        break;
      
      case 5: 
        return saida;
    }
  }

  return saida;

}

automatoOperadores = (c, linha, num_linha, posicao) => {
  let s = 0;
  let c_aux;
  let linha_aux;
  let flag = true;

  if(c === ')'){
    token.push({'lexema': ')', 'token': 'simb_fpar', 'linha': num_linha});
  }
  else if(c === '('){

    for(let i = posicao; i < linha.length; i++){
            
      c_aux = linha[i];

      switch(s){
        case 0:
          if(i >= linha.length - 1)
            token.push({'lexema': '(', 'token': 'simb_par', 'linha': num_linha});
          else if(c_aux == '(')
            s = 1;
          else if(c_aux == ')')
            s = 4
          break;

        case 1:
          if (i >= linha.length - 1 && c_aux != ')'){
            linha_aux = linha.replace("\n", "");
            token.push({'lexema': '}', 'token': 'simb_par', 'linha': num_linha});
            // adicionar erro
          }
          else if(c_aux == '(')
            s = 2;
          else if(c_aux == ')')
            s = 0;
          break;

        case 2:
          if(i >= linha.length - 1 && c_aux !== ')'){
            linha_aux = linha.replace("\n", "");
            token.push({'lexema': '}', 'token': 'Identacao dos parenteses', 'linha': num_linha});
             // adicionar erro
          }
          else if(c_aux == '(')
            s = 3;
          else if(c_aux == ')')
            s = 1;
          break;

        case 3:
          if(i >= linha.length - 1 && c_aux != ')'){
            linha_aux = linha.replace("\n", "");
            token.push({'lexema': '}', 'token': 'Identacao dos parenteses', 'linha': num_linha});
             // adicionar erro
          }
          else if(c_aux == '(')
            s = 5;
          else if(c_aux == ')')
            s = 2;
          break;

          case 4:
            linha_aux = linha.replace("\n", "");
            token.push({'lexema': '}', 'token': 'Identacao dos parenteses', 'linha': num_linha});
              // adicionar erro
            break;

          case 5:
            linha_aux = linha.replace("\n", "");
            token.push({'lexema': '}', 'token': 'Maximo de parenteses atingido', 'linha': num_linha});
              // adicionar erro
            break;
      }
    }
  }
  else{
      s = 0;
      let i = posicao;

      while(flag){
        c_aux = linha[i];

        switch(s){
          case 0:
            if(c_aux == ':')
              s = 1;
            else if (c_aux == '<')
              s = 4;
            else if (c_aux == '='){
              if (linha[i - 1] != ':')
                s = 8;
              else
                s = 19;
            }
            else if (c_aux == '>'){
              if (linha[i - 1] != '<')
                s = 9;
              else
                s = 19;
            }
            else if (c_aux == '/')
              s = 12;            
            else if (c_aux == ',')
              s = 13;
            else if (c_aux == '*')
              s = 14;
            else if (c_aux == '+')
              s = 15;
            else if (c_aux == '.')
              s = 16;
            else if (c_aux == ';'){
              s = 17;
            }
            else if (c_aux == '-')
              s = 18;
            break

          case 1:
            if(c_aux == '=')
              s = 2
            else
              s = 3
            break
          
          case 2:
            token.push({'lexema': ':=', 'token': 'simb_atribuicao', 'linha': num_linha});
            flag = false;
            break;

          case 3:
            token.push({'lexema': ':', 'token': 'simb_dp', 'linha': num_linha});
            flag = false;
            break;

          case 4:
            if(c_aux == '=')
              s = 5;
            else if(c_aux == '>')
              s = 6;
            else
              s = 7;
            break;
            
          case 5:
            token.push({'lexema': '<=', 'token': 'simb_menor_igual', 'linha': num_linha});
            flag = false;
            break;

          case 6:
            token.push({'lexema': '<>', 'token': 'simb_dif', 'linha': num_linha});
            flag = false;
            break;

          case 7:
            token.push({'lexema': '<', 'token': 'simb_menor', 'linha': num_linha});
            flag = false;
            break;

          case 8:
            token.push({'lexema': '=', 'token': 'simb_igual', 'linha': num_linha});
            flag = false;
            break;

          case 9:
            if(c_aux == '=')
              s = 10
            else
              s = 11
          
          case 10:
            token.push({'lexema': '>=', 'token': 'simb_maior_igual', 'linha': num_linha});
            flag = false;
            break;

          case 11:
            token.push({'lexema': '>', 'token': 'simb_maior', 'linha': num_linha});
            flag = false;
            break;

          case 12:
            token.push({'lexema': '/', 'token': 'simb_dividir', 'linha': num_linha});
            flag = false;
            break;

          case 13:
            token.push({'lexema': ',', 'token': 'simb_virgula', 'linha': num_linha});
            flag = false;
            break;

          case 14:
            token.push({'lexema': '*', 'token': 'simb_mult', 'linha': num_linha});
            flag = false;
            break;

          case 15:
            token.push({'lexema': '+', 'token': 'simb_mais', 'linha': num_linha});
            flag = false;
            break;

          case 16:
            token.push({'lexema': '.', 'token': 'simb_ponto', 'linha': num_linha});
            flag = false;
            break;

          case 17:
            token.push({'lexema': ';', 'token': 'simb_ponto_virgula', 'linha': num_linha});
            flag = false;
            break;

          case 18:
            token.push({'lexema': '-', 'token': 'simb_menos', 'linha': num_linha});
            flag = false;
            break;

          case 19:
            flag = false;
        }
        i++;
      }
  }
  return;
}

automatoIdentificador = (palavra, num_linha) => {
  let s = 0;
  let flag = true;
  let i = 0;
  // for (let i in palavra) {
  while(flag){
    let c = palavra[i];
    //console.log(c);
    switch(s){
      case 0:
        if((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')){
          //console.log('aqui');
          s = 1;
        }
        else{
          s = 2;
        }
        break;
      case 1:
        //console.log((palavra.length-1) +' - '+ parseInt(i));
        if((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')){
          s = 1;
          
          if( (palavra.length -1) == parseInt(i)){
            token.push({'lexema': palavra, 'token': 'ident', 'linha': num_linha});
            flag = false;
          }
        }
        else if((palavra.length) == parseInt(i)){
          token.push({'lexema': palavra, 'token': 'ident', 'linha': num_linha});
          flag = false;
        }
        else{
          s = 2;
        }
        break;
      case 2:
        token.push({'lexema': palavra, 'token': 'Identificador com caracter inválido', 'linha': num_linha});
        flag = false;
        break;
    }
    i++;
  }
  return;
}
comentario = (linha, pos, linha_num) => {
  let s = 0;
  while(1){
    let c = linha[pos];
    switch(s) {
      case 0:
        if(c === '{'){ s =  1;}
        else if(c === '}'){
          token.push({'lexema': '}', 'token': 'Comentario fechado sem abertura', 'linha': linha_num})
          return {status: false, mensagem: 'Comentario', pos: pos };
        }
        break;
      case 1:
        if(c === '}'){ s = 2;}
        if(c === '\n'){ s = 3;}
        break;
      case 2:
        return {status: true, mensagem: 'Comentario', pos: pos };
      case 3:
        token.push({'lexema': '{', 'token': 'Comentario nao fechado', 'linha': linha_num})
        return {status: false, mensagem: 'Comentario', pos: pos };
    }
    pos++;
  }
}

module.exports = {
  async start(arquivo_entrada, callback) {
    try {
      const data = fs.createReadStream(path.resolve(__dirname, './' + arquivo_entrada), { encoding: 'utf8', flag: 'r' });
      const rl = readline.createInterface({
        input: data,
        crlfDelay: Infinity
      });

      let aux = '';
      let linha_num = 1;

      for await (let linha of rl) {
        // console.log(`Line from file: ${linha}`);
        //for (let i in linha) {
        linha = linha.replace(/\t/g, '');

        for(let i = 0; i < linha.length; i++){  
          if(linha[i] === '{' || linha[i] === '}'){
            let {pos} = comentario(linha, i, linha_num);
            i = parseInt(pos);
        
            aux = '';
          }

          if(linha[i] === ' ' || linha[i] === '\n' || operadores.indexOf(linha[i]) > -1){
            // console.log(aux);
            if(aux !== ''){
              //console.log(linha[i]);
              if(automatoNumero(aux, linha_num) === null){
                //console.log(aux);
                if(typeof tabela_reservados[aux] === "undefined"){
                  
                  automatoIdentificador(aux, linha_num);
                }
                else{
                  token.push({'lexema': aux, 'token': tabela_reservados[aux], 'linha': linha_num})
                }
              }
            }

            if(operadores.indexOf(linha[i]) > -1){
              automatoOperadores(linha[i], linha, linha_num, i);
            }
            aux = '';
          }
          else{
            if(typeof linha[i] !== "undefined"){
              aux += linha[i];
            }
          }
        }

        linha_num++;
      }
      console.log(token);
      return callback({ status: true, mensagem: 'Ok' });

    } catch (err) {
      console.log(err);
      return callback({ status: false, mensagem: 'Erro ao abrir o arquivo' });
    }
  }
}