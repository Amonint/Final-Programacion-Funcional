const fs = require('fs');
const readline = require('readline-sync');

// Función para leer el archivo card.txt
function leerTarjeta() {
  const contenido = fs.readFileSync('./ATM/card.txt', 'utf8');
  const lineas = contenido.split('\n');
  const tarjeta = {};

  lineas.forEach((linea) => {
    const [clave, valor] = linea.split(':');
    const atributo = clave.trim();
    const valorAtributo = valor ? valor.trim() : '';

    if (atributo === 'Nombre') {
      tarjeta.nombre = valorAtributo;
    } else if (atributo === 'Saldo') {
      tarjeta.saldo = parseFloat(valorAtributo);
    } else if (atributo === 'NumeroTarjeta') {
      tarjeta.numeroTarjeta = valorAtributo;
    } else if (atributo === 'Contraseña') {
      tarjeta.contraseña = valorAtributo;
    }
  });

  return tarjeta;
}

// Función para escribir en el archivo card.txt
function escribirTarjeta(tarjeta) {
  const contenido = `Nombre: ${tarjeta.nombre}\nSaldo: ${tarjeta.saldo}\nNumeroTarjeta: ${tarjeta.numeroTarjeta}\nContraseña: ${tarjeta.contraseña}`;
  fs.writeFileSync('./ATM/card.txt', contenido, 'utf8');
}

// Función para realizar un retiro
function hacerRetiro(tarjeta) {
  const monto = parseFloat(readline.question('Ingrese el monto a retirar (hasta $1000): '));
  const saldoActual = tarjeta.saldo;
  const nuevoSaldo = saldoActual - monto;

  if (nuevoSaldo < 0) {
    console.log('Fondos insuficientes');
    return;
  }

  const queryUpdateSQL = `UPDATE cajerodb SET saldo = <span class="math-inline">\{nuevoSaldo\} WHERE nro\_tarjeta \= '</span>{tarjeta.numeroTarjeta}'`;
  connection.query(queryUpdateSQL);
  console.log('Retiraste $' + monto + '. Saldo actual: $' + nuevoSaldo.toFixed(2));
  preguntarGenerarRecibo(nuevoSaldo, tarjeta.numeroTarjeta);
}

// Función para realizar un depósito
function hacerDeposito(tarjeta) {
  const monto = parseFloat(readline.question('Ingrese el monto a depositar: '));
  const saldoActual = tarjeta.saldo;
  const nuevoSaldo = saldoActual + monto;

  const queryUpdateSQL = `UPDATE cajerodb SET saldo = <span class="math-inline">\{nuevoSaldo\} WHERE nro\_tarjeta \= '</span>{tarjeta.numeroTarjeta}'`;
  connection.query(queryUpdateSQL);
  console.log('Depositaste $' + monto + '. Saldo actual: $' + nuevoSaldo.toFixed(2));
  preguntarGenerarRecibo(nuevoSaldo, tarjeta.numeroTarjeta);
}

// Función principal
function ejecutarCajero() {
  const tarjeta = leerTarjeta();

  const contraseñaIngresada = readline.question('Ingrese la contraseña: ');
  const operacion = readline.question('¿Desea hacer un retiro (r) o un depósito (d)? ').toLowerCase();

  // Validar la contraseña
  const contraseñaCorrecta = contraseñaIngresada === tarjeta.contraseña;

  // Realizar operación según la elección del usuario
  const operacionRealizada =
    contraseñaCorrecta &&
    (operacion === 'r' ? hacerRetiro(tarjeta) : operacion === 'd' ? hacerDeposito(tarjeta) : false);

  // Preguntar si desea imprimir el recibo
  const imprimirRecibo = operacionRealizada && readline.question('¿Desea imprimir el recibo? (si/no): ').toLowerCase() === 'si';

  // Imprimir recibo
  if (imprimirRecibo) {
    const recibo = {
      nombreUsuario: tarjeta.nombre,
      fecha: new Date().toLocaleDateString(),
      saldoAn}
  }
}
