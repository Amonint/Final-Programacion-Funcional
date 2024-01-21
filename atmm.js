const readline = require('readline-sync');
const mysql = require('mysql');
const fs = require('fs'); 

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1234',
  database: 'banco'
});

const mostrarMensajeBienvenida = () => console.log('¡Bienvenido al Banco de Loja!');

const solicitarInformacion = (mensaje) => readline.question(mensaje);

const autenticarUsuario = () => new Promise((resolve, reject) => {
  const operacion = solicitarInformacion('¿Desea hacer un depósito (d) o un retiro (r)? ').toLowerCase();
  const numeroTarjeta = solicitarInformacion('Ingrese el número de tarjeta: ');
  const contrasena = parseInt(solicitarInformacion('Ingrese la contraseña numérica: '), 10);

  const querySelectSQL = `SELECT u.nombre, u.apellido, t.saldo FROM usuarios u INNER JOIN tarjetas t ON u.numeroTarjeta = t.numeroTarjeta WHERE u.numeroTarjeta = '${numeroTarjeta}' AND t.contrasena = ${contrasena}`;
  connection.query(querySelectSQL, (error, results) => {
    error ? reject('Error al verificar la tarjeta y la contraseña:', error)
      : resolve(results.length > 0 ? { ...results[0], operacion, numeroTarjeta } : null);
  });
});

const solicitarMonto = (operacion) => parseFloat(solicitarInformacion(operacion === 'r' ? 'Ingrese el monto a retirar: ' : 'Ingrese el monto a depositar: '));

const mostrarRecibo = (nombre, apellido, fecha, saldoAnterior, saldoNuevo) => {
  const contenidoRecibo = `
----- Recibo de Transacción -----
Nombre: ${nombre} ${apellido}
Fecha: ${fecha}
Saldo Anterior: $${saldoAnterior.toFixed(2)}
Saldo Nuevo: $${saldoNuevo.toFixed(2)}
--------------------------------
`;

  // Escribir el contenido en un archivo de texto
  // Escribir el contenido en un archivo de texto
fs.writeFile('recibo.txt', contenidoRecibo, (err) => 
err
  ? console.error('Error al escribir el archivo:', err)
  : console.log('Recibo generado exitosamente. Puedes encontrarlo en "recibo.txt"')
);
};

const realizarOperacion = ({ operacion, numeroTarjeta, nombre, apellido, saldo }, monto) => {
  const nuevoSaldo = operacion === 'r' ? -monto : monto;

  const queryUpdateTarjeta = `UPDATE tarjetas SET saldo = saldo + ${nuevoSaldo} WHERE numeroTarjeta = '${numeroTarjeta}'`;
  const queryInsertMovimiento = `INSERT INTO movimientos (numeroTarjeta, tipo, monto) VALUES ('${numeroTarjeta}', '${operacion === 'r' ? 'retiro' : 'deposito'}', ${monto})`;

  // Utilizar promesas para asegurar el orden de ejecución
  const updateTarjetaPromise = new Promise((resolve, reject) => {
    connection.query(queryUpdateTarjeta, (error, result) => {
      error ? reject('Error al actualizar el saldo:', error) : resolve(result);
    });
  });

  const insertMovimientoPromise = new Promise((resolve, reject) => {
    connection.query(queryInsertMovimiento, (error) => {
      error ? reject('Error al registrar el movimiento:', error) : resolve();
    });
  });

  Promise.all([updateTarjetaPromise, insertMovimientoPromise])
    .then(() => {
      console.log(`Operación exitosa. Monto: $${monto.toFixed(2)}`);
      mostrarRecibo(nombre, apellido, new Date().toLocaleDateString(), saldo, saldo + nuevoSaldo);
      connection.end();
    })
    .catch((error) => console.error(error));
};

const ejecutarCajero = () => {
  mostrarMensajeBienvenida();

  autenticarUsuario()
    .then((usuario) => usuario
      ? realizarOperacion(usuario, solicitarMonto(usuario.operacion))
      : (console.log('Número de tarjeta o contraseña incorrectos. Operación cancelada.'), connection.end())
    )
    .catch((error) => console.error(error));
};

connection.connect((error) =>
  error
    ? (console.error('Error al conectar con la base de datos:', error), process.exit(1))
    : ejecutarCajero()
);
