-- script para inserción de datos de prueba

-- DELETE FROM cliente;

INSERT INTO `cliente` (`nombre`, `apellido`, `nro_documento`, `tipo_documento`, `email`, `telefono`, `nacimiento`) VALUES
  ('Rogelio', 'Fernández', '2987123', 'cédula', 'rogelio@gmail.com', '0984 372 817', '1980-10-15'),
  ('Juana Mariela', 'Zárate', '3849009', 'cédula', 'juanazarate@gmail.com', '+59521 876 391', '1985-01-31');


-- DELETE FROM concepto;

INSERT INTO `concepto` (`descripcion`, `requerido`) VALUES
  ('vale de 200.000 gs', '200');
  -- insertar otros conceptos con la api

