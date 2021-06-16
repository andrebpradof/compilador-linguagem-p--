const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { memory } = require('console');

// Tablea que contem as palavras reservadas
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

// Vetor com os operadores
const operadores = [';', ':', '+', '-', '*', '/', '(', ')', '=', ',', '>', '<', '.']; 

// Toquem de saída. Recebe
let token = [];

// Autômato para a validação de número inteiros e reais 
automatoNumero = (aux, num_linha) => {
  let s = 0;  // controle do estado do autôamto
  let tama_cont = 0;  // var de controle
  let saida = null; // var de resultado 
  let c;  // var com um caracter

  for(let i = 0; i < aux.length; i++){
    c = aux[i];
    switch(s){
      // Estado 0
      case 0:
        if(c >= '0' && c <= '9'){ // se está ente 0 e 9
          s = 2;
          tama_cont++;
  
          if(aux.length == 1){  // Validou o número inteiro
            token.push({'lexema': aux, 'token': 'num_inteiro', 'linha': num_linha, 'status': true});
            saida = {status: true };
          }
        }
        else if(c == '-' || c == '+') // Caso apresente o sinal antes do núemro
          s = 1  
        else{
          s = 5
        }
        break;
      
      // Estado 1
      case 1:
        if(c >= '0' && c <= '9'){
          tama_cont++;
          s = 2;
        }
        else
          s = 4;
        break
      
      // Estado 2
      case 2:
        if(i >= aux.length - 1){
          if(c >= '0' && c <= '9')
            token.push({'lexema': aux, 'token': 'num_inteiro', 'linha': num_linha, 'status': true});
          else{
            token.push({'lexema': aux, 'token': 'Numero mal formado', 'linha': num_linha, 'status': false});
          }
          saida = {status: true };
        }
        else if(c == '.')
          s = 3;
        else if(c >= '0' && c <= '9')
          tama_cont++;
        else
          s = 4;
        break;

      // Estado 3
      case 3:
        if(i >= aux.length - 1){
          if(c >= '0' && c <= '9')
            token.push({'lexema': aux, 'token': 'num_real', 'linha': num_linha, 'status': true});
          else{
            token.push({'lexema': aux, 'token': 'Numero mal formado', 'linha': num_linha, 'status': false});
          }
          saida = {status: true };
        }
        else if(c >= '0' && c <= '9')
          tama_cont++;
        else
          s = 4;
        break;
      
      // Estado 4
      case 4:
        token.push({'lexema': aux, 'token': 'Numero mal formado', 'linha': num_linha, 'status': false});
        saida = {status: true };
        break;
      
      // Estado 5
      case 5: 
        return saida;
    }
  }
  return saida;
}

// Autômato para validar os parenteses
automatoParenteses = (linha, posicao ,num_linha) => {
  let s = 0;  // Estado autômato
  let flag = true;
  let c = '';

  let i = posicao;
  while(c !== '\n'){
    c = linha[i];
    switch(s){

      // Estado 0
      case 0:
        if(c === '('){ s =  1;}
        else if(c === ')'){
          token.push({'lexema': ')', 'token': 'Parênteses não foi aberto', 'linha': num_linha, 'status': false});
          flag = false;
        }
        else{
          flag = false;
        }    
        break;

      // Estado 1
      case 1:
        if(c === '('){ s =  2;}
        else if(c === ')'){ s =  1;}
        break;
      
      // Estado 2
      case 2:
        if(c === '('){ s =  3;}
        else if(c === ')'){ s =  2;}
        break;
      
      // Estado 3
      case 3:
        if(c === '('){ s =  4;}
        else if(c === ')'){ s =  3;}
        break;
      
      // Estado 4
      case 4: //erro
        token.push({'lexema': '(', 'token': 'Limite máximo de parênteses','linha': num_linha, 'status': false});
        flag = false;
        break;
    }
    i++;
  }
  return;
}

// Autômato para validar os operadores
automatoOperadores = (c, linha, num_linha, posicao) => {
  let s = 0; // Estado
  let c_aux;
  let linha_aux;
  let flag = true;

  if(c === ')'){
    token.push({'lexema': ')', 'token': 'simb_fpar', 'linha': num_linha, 'status': true});
  }
  else if(c === '('){
    s = 0;

    for(let i = posicao; i < linha.length; i++){
            
      c_aux = linha[i];

      switch(s){

        // Estado 0
        case 0:
          if(i >= linha.length - 1)
            token.push({'lexema': '(', 'token': 'simb_par', 'linha': num_linha , 'status': true});
          else if(c_aux == '(')
            s = 1;
          else if(c_aux == ')')
            s = 4
          break;

        // Estado 1
        case 1:
          if (i >= linha.length - 1 && c_aux != ')'){
            linha_aux = linha.replace("\n", "");
            token.push({'lexema': ')', 'token': 'Parenteses não fechado', 'linha': num_linha, 'status': false});
          }
          else if(c_aux == '(')
            s = 2;
          else if(c_aux == ')')
            s = 0;
          break;

        // Estado 2
        case 2:
          if(i >= linha.length - 1 && c_aux !== ')'){
            linha_aux = linha.replace("\n", "");
            token.push({'lexema': ')', 'token': 'Identacao dos parenteses', 'linha': num_linha, 'status': false});
          }
          else if(c_aux == '(')
            s = 3;
          else if(c_aux == ')')
            s = 1;
          break;
        
        // Estado 3
        case 3:
          if(i >= linha.length - 1 && c_aux != ')'){
            linha_aux = linha.replace("\n", "");
            token.push({'lexema': ')', 'token': 'Identacao dos parenteses', 'linha': num_linha, 'status': false});
          }
          else if(c_aux == '(')
            s = 5;
          else if(c_aux == ')')
            s = 2;
          break;

          // Estado 4
          case 4:
            linha_aux = linha.replace("\n", "");
            token.push({'lexema': ')', 'token': 'Identacao dos parenteses', 'linha': num_linha , 'status': false});
            break;

          // Estado 5
          case 5:
            linha_aux = linha.replace("\n", "");
            token.push({'lexema': ')', 'token': 'Maximo de parenteses atingido', 'linha': num_linha, 'status': false});
            break;
      }
    }
  }
  else{
      s = 0; // Estado
      let i = posicao;

      while(flag){
        c_aux = linha[i];

        switch(s){

          // Estado 0
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

          // Estado 1
          case 1:
            if(c_aux == '=')
              s = 2
            else
              s = 3
            break
          
          // Estado 2 - :=
          case 2:
            token.push({'lexema': ':=', 'token': 'simb_atribuicao', 'linha': num_linha, 'status': true});
            flag = false;
            break;
          
          // Estado 3 - :
          case 3:
            token.push({'lexema': ':', 'token': 'simb_dp', 'linha': num_linha , 'status': true});
            flag = false;
            break;
          
          // Estado 4
          case 4:
            if(c_aux == '=')
              s = 5;
            else if(c_aux == '>')
              s = 6;
            else
              s = 7;
            break;
          
          // Estado 5 - <=
          case 5:
            token.push({'lexema': '<=', 'token': 'simb_menor_igual', 'linha': num_linha , 'status': true});
            flag = false;
            break;

          // Estado 6 - <>
          case 6:
            token.push({'lexema': '<>', 'token': 'simb_dif', 'linha': num_linha , 'status': true});
            flag = false;
            break;
          
          // Estado 7 - <
          case 7:
            token.push({'lexema': '<', 'token': 'simb_menor', 'linha': num_linha , 'status': true});
            flag = false;
            break;

          // Estado 8 - =
          case 8:
            token.push({'lexema': '=', 'token': 'simb_igual', 'linha': num_linha , 'status': true});
            flag = false;
            break;

          // Estado 9
          case 9:
            if(c_aux == '=')
              s = 10
            else
              s = 11
          
          // Estado 10 - >=
          case 10:
            token.push({'lexema': '>=', 'token': 'simb_maior_igual', 'linha': num_linha , 'status': true});
            flag = false;
            break;

          // Estado 11 - >
          case 11:
            token.push({'lexema': '>', 'token': 'simb_maior', 'linha': num_linha , 'status': true});
            flag = false;
            break;
          
          // Estado 12 - /
          case 12:
            token.push({'lexema': '/', 'token': 'simb_dividir', 'linha': num_linha , 'status': true});
            flag = false;
            break;

          // Estado 13 - ,
          case 13:
            token.push({'lexema': ',', 'token': 'simb_virgula', 'linha': num_linha , 'status': true});
            flag = false;
            break;

          // Estado 14 - *
          case 14:
            token.push({'lexema': '*', 'token': 'simb_mult', 'linha': num_linha , 'status': true});
            flag = false;
            break;
          
          // Estado 15 - +
          case 15:
            token.push({'lexema': '+', 'token': 'simb_mais', 'linha': num_linha , 'status': true});
            flag = false;
            break;

          // Estado 16 - .
          case 16:
            token.push({'lexema': '.', 'token': 'simb_ponto', 'linha': num_linha , 'status': true});
            flag = false;
            break;

          // Estado 17 - ;
          case 17:
            token.push({'lexema': ';', 'token': 'simb_ponto_virgula', 'linha': num_linha , 'status': true});
            flag = false;
            break;
          
          // Estado 18 - -
          case 18:
            token.push({'lexema': '-', 'token': 'simb_menos', 'linha': num_linha , 'status': true});
            flag = false;
            break;

          // Estado 19
          case 19:
            flag = false;
        }
        i++;
      }
  }
  return;
}

// Autômato para a validação dos identificadores
automatoIdentificador = (palavra, num_linha) => {
  let s = 0; // Estado
  let flag = true;
  let i = 0;

  while(flag){
    let c = palavra[i];
    switch(s){

      // Estado 0
      case 0:
        if((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')){
          s = 1;
        }
        else{
          s = 3;
        }
        break;

      // Estado 0
      case 1:
        if((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')){
          s = 1;
          
          if( (palavra.length -1) == parseInt(i)){
            token.push({'lexema': palavra, 'token': 'ident', 'linha': num_linha , 'status': true});
            flag = false;
          }
        }
        else if((palavra.length) == parseInt(i)){
          token.push({'lexema': palavra, 'token': 'ident', 'linha': num_linha, 'status': true});
          flag = false;
        }
        else{
          s = 2;
        }
        break;
      
      // Estado 2
      case 2:
        token.push({'lexema': palavra, 'token': 'Identificador com caracter inválido', 'linha': num_linha, 'status': false});
        flag = false;
        break;

      // Estado 3
      case 3:
        token.push({'lexema': palavra, 'token': 'Identificador não inicia letra', 'linha': num_linha, 'status': false});
        flag = false;
        break;
    }
    i++;
  }
  return;
}

// Autômato para a validação dos comentários
comentario = (linha, pos, linha_num) => {
  let s = 0; // Estado
  while(1){
    let c = linha[pos];
    
    switch(s) {
      // Estado 0  
      case 0:
        if(c === '{'){ s =  1;}
        else if(c === '}'){
          token.push({'lexema': '}', 'token': 'Comentario fechado sem abertura', 'linha': linha_num, 'status': false})
          return {status: false, mensagem: 'Comentario', pos: pos };
        }
        break;
      
      // Estado 1
      case 1:
        if(c === '}'){ s = 2;}
        if(c === '\n'){ s = 3;}
        break;

      // Estado 2
      case 2:
        return {status: true, mensagem: 'Comentario', pos: pos };

      // Estado 3
      case 3:
        token.push({'lexema': '{', 'token': 'Comentario nao fechado', 'linha': linha_num, 'status': false})
        return {status: false, mensagem: 'Comentario', pos: pos };
    }
    pos++;
  }
}

// Compilador Léxico
module.exports = {


  async start(arquivo_entrada, callback) {
    try {

      // Abrindo o arquivo informado
      const data = fs.createReadStream(path.resolve(__dirname, './' + arquivo_entrada), { encoding: 'utf8', flag: 'r' });
      const rl = readline.createInterface({
        input: data,
        crlfDelay: Infinity
      });

      let aux = '';
      let linha_num = 0;

      for await (let linha of rl) { // Percorre linha por linha até o fim do arquivo

        linha_num++;
        linha += '\n';
        for(let i = 0; i < linha.length; i++){
        
          if(linha[i] === '{' || linha[i] === '}'){
            let {pos} = comentario(linha, i, linha_num); // Autômato de comentário
            i = parseInt(pos);
        
            aux = '';
          }

          if(linha[i] === '('){
            automatoParenteses(linha, i, linha_num);
          }
          // Taleba de operadores
          if(linha[i] == ' ' || linha[i] == '\n' || operadores.indexOf(linha[i]) > -1){
            if(aux !== ''){
              
              // Autômaro de números
              if(automatoNumero(aux, linha_num) === null){
                if(typeof tabela_reservados[aux] === "undefined"){
                  // Autômato de identificadores
                  automatoIdentificador(aux, linha_num);
                }
                else{
                  token.push({'lexema': aux, 'token': tabela_reservados[aux], 'linha': linha_num, 'status': true})
                }
              }
            }
            
            // Tabela de operadores
            if(operadores.indexOf(linha[i]) > -1){
              // Autôamto de operadores
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
      }
      return callback({ status: true, mensagem: 'Ok', token: token });

    } catch (err) {
      console.log(err);
      return callback({ status: false, mensagem: 'Erro ao abrir o arquivo' });
    }
  }
}