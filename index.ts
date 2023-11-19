import { SerialPort } from "serialport";

const port = new SerialPort({
  path: "/dev/ttyUSB0",
  baudRate: 4800,
  dataBits: 8,
  parity: "none",
  stopBits: 1,
});

let weightReceived = false;

port.on("open", () => {
  console.log("Port opened");

  // Enviando solicitação de peso para a balança
  const ENQ = Buffer.from([0x05]);
  port.write(ENQ, (err) => {
    if (err) {
      return console.error("Error writing ENQ:", err.message);
    }
    console.log("ENQ sent successfully");
  });
});

port.on("data", (data) => {
  const response = data.toString();

  if (
    !weightReceived &&
    response.startsWith("\x02") &&
    response.endsWith("\x03")
  ) {
    // Processar a resposta do peso
    const weight = response.slice(1, -1); // Remover STX e ETX
    console.log("Weight received:", weight);
    weightReceived = true;

    // Enviar preço baseado no peso recebido
    const price = calculatePriceBasedOnWeight(weight); // Função para calcular o preço com base no peso
    const formattedPrice = price.toFixed(2).replace(".", "").padStart(6, "0");
    const priceMessage = Buffer.from([
      0x02,
      ...formattedPrice.split("").map((char) => char.charCodeAt(0)),
      0x03,
    ]);

    port.write(priceMessage, (err) => {
      if (err) {
        return console.error("Error writing price:", err.message);
      }
      console.log("Price sent successfully");
    });
  }
});

port.on("close", () => console.log("Port closed"));
port.on("error", (err) => console.error("Port error: ", err));

// Função de exemplo para calcular o preço com base no peso
function calculatePriceBasedOnWeight(weight: string) {
  // Implemente aqui o cálculo do preço com base no peso recebido
  // Exemplo: Preço = Peso * 2.5 (valor fictício)
  const numericWeight = parseFloat(weight.replace(",", ".")); // Converter para número
  const price = numericWeight * 2.5; // Valor fictício para exemplo

  return price;
}
