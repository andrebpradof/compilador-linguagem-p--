const lexico = require('./lexico')
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const arquivo_entrada = args[0];
lexico.start(arquivo_entrada, ({status, mensagem, token}) => {
  let buffer = '';
  for(let i = 0; i < token.length; i++){
    if(token[i].status){
      console.log(`${token[i].lexema}, ${token[i].token}, ${token[i].linha}`);
      buffer += `${token[i].lexema}, ${token[i].token}\n`;
    }
    else{
      console.log(`${token[i].lexema}, ERRO(${token[i].token}) , ${token[i].linha}`)
      buffer += `${token[i].lexema}, ERRO(${token[i].token})\n`;
    } 
  }

  fs.writeFile(path.resolve(__dirname, './saida.txt') ,buffer,{enconding:'utf-8',flag: 'w'}, function (err) {
      if (err) throw err;
      console.log('>> Arquivo saida.txt salvo!');
  });

});