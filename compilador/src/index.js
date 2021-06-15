const lexico = require('./lexico')

const args = process.argv.slice(2);
const arquivo_entrada = args[0];
lexico.start(arquivo_entrada, ({status, mensagem}) => {
  console.log(mensagem);
});