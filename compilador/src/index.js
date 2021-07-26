const lexico = require('./lexico')
const sintatico = require('./sintatico')
const fs = require('fs');
const path = require('path');
const errors = require("./erro")

const args = process.argv.slice(2);
const arquivo_entrada = args[0];

lexico.start(arquivo_entrada, ({status, mensagem, token}) => {
  let buffer = '';
  let num_erros = 0;

  for(let i = 0; i < token.length; i++){
    if(!token[i].status){
      errors.set_erro('lexico', token[i].linha, token[i].token);
    }
  }

  try {
    sintatico.start(token, errors);
  } catch(err){
    console.error('>> Compilação finalizada:\n')
  }
  for (let value of errors.get_erros()) {
    if(typeof value != 'undefined'){
      
      for (let erro of value){
        console.log(`${erro.linha} - Erro ${erro.analizador}: ${erro.erro}`);
        buffer += `${erro.linha} - Erro ${erro.analizador}: ${erro.erro}\n`;
        num_erros++;
      }
    }
  }

  console.error(`\n>> Número de erros: ${num_erros}`);

  fs.writeFile(path.resolve(__dirname, './saida.txt') ,buffer,{enconding:'utf-8',flag: 'w'}, function (err) {
      if (err) throw err;
      console.log('\n>> Arquivo saida.txt salvo!');
  });

});