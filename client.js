const net = require("net");
const readline = require("readline");

// Cria uma interface para ler a entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Conecta ao servidor
const client = net.createConnection({ port: 4000, host: "127.0.0.1" }, () => {
  console.log("Conectado ao servidor");

  client.on("data", (data) => {
    console.log(data.toString());
  });

  // Função para ler comandos do usuário
  const sendCommand = () => {
    rl.question("", (input) => {
      client.write(input.trim());
      console.log("\n");
      if (input.trim() === "0" && !client.inChat) {
        rl.close();
      } else {
        sendCommand();
      }
    });
  };

  sendCommand();
});

// Tratando o evento de fechamento de conexão
client.on("end", () => {
  console.log("Desconectado do servidor");
  rl.close(); // Fecha a interface de leitura
});

// Tratando o erro do cliente
client.on("error", (err) => {
  console.log("Desconectado do servidor");
  rl.close(); // Fecha a interface de leitura
});
