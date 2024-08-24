const net = require("net"); // Importa o módulo net para criar o servidor TCP

let connectionCount = 0; // Contador para nomear clientes
const clients = []; // Lista para armazenar clientes conectados à sala de chat

// Função que lida com cada nova conexão de cliente
const handleConnection = (socket) => {
  connectionCount++;
  const clientName = `PC${connectionCount}`;
  socket.clientName = clientName; // Atribui o nome ao socket do cliente

  console.log(`${clientName} se conectou`);

  // Envia um menu de opções para o cliente assim que ele se conecta
  socket.write(
    "Escolha uma opção:\n1 - Entrar na sala de chat\n0 - Desconectar\n"
  );

  // Evento que lida com dados recebidos do cliente
  socket.on("data", (data) => {
    const message = data.toString().trim(); // Converte os dados recebidos em string e remove espaços em branco

    // Verifica se o cliente não está na sala de chat
    if (!socket.inChat) {
      if (message === "1") {
        // Se o cliente escolher '1', ele entra na sala de chat
        socket.inChat = true; // Marca o cliente como estando na sala de chat
        clients.push(socket); // Adiciona o cliente à lista de clientes na sala de chat
        socket.write('Você entrou na sala de chat. Digite "exit" para sair.\n');
        // Notifica todos os outros clientes que um novo cliente entrou
        broadcast(`${clientName} entrou na sala de chat.`, socket); 
      } else if (message === "0") {
        // Se o cliente escolher '0', ele se desconecta do server
        socket.end("Desconectando...\n"); // Encerra a conexão com uma mensagem
      } else {
        socket.write(
          "Opção inválida. Escolha 1 para entrar na sala de chat ou 0 para desconectar.\n"
        );
      }
    } else {
      // Se o cliente estiver na sala de chat
      if (message.toLowerCase() === "exit") {
        socket.inChat = false; // Marca o cliente como não estando mais na sala de chat
        // Remove o cliente da lista de clientes na sala de chat
        clients.splice(clients.indexOf(socket), 1); 
        socket.write("Você saiu da sala de chat.\n");
        // Notifica todos os outros clientes que o cliente saiu
        broadcast(`${clientName} saiu da sala de chat.`, socket); 
        socket.write(
          "Escolha uma opção:\n1 - Entrar na sala de chat\n0 - Desconectar\n"
        );
      } else {
        // Se o cliente estiver na sala de chat e enviar uma mensagem
         // Envia a mensagem para todos os clientes na sala de chat
        broadcast(`${clientName}: ${message}`, socket);
      }
    }
  });

  // Evento que lida com a desconexão do cliente
  socket.on("end", () => {
    console.log(`${clientName} desconectou`); // Loga a desconexão do cliente
    if (socket.inChat) {
      // Se o cliente estava na sala de chat
      // Remove o cliente da lista de clientes na sala de chat
      clients.splice(clients.indexOf(socket), 1); 
      // Notifica todos os outros clientes que o cliente saiu
      broadcast(`${clientName} saiu da sala de chat.`, socket); 
    }
  });

  // Evento que lida com erros do cliente
  socket.on("error", (err) => {
    console.error(`Erro em ${clientName}:`, err.message); // Loga o erro
  });
};

// Função para enviar uma mensagem para todos os clientes na sala de chat, 
// exceto o remetente
const broadcast = (message, sender) => {
  clients.forEach((client) => {
    if (client !== sender) {
      // Envia a mensagem para o cliente
      client.write(message + "\n"); 
    }
  });
};

// Cria um servidor TCP e define a função de callback para lidar com conexões
const server = net.createServer(handleConnection);

// Evento que lida com erros do servidor
server.on("error", (err) => {
  console.error("Erro no servidor:", err.message); // Loga o erro do servidor
});

// Faz o servidor começar a ouvir na porta 4000 e IP 127.0.0.1
server.listen(4000, "127.0.0.1", () => {
  console.log("Servidor ouvindo em 127.0.0.1:4000");
});
