drop database if exists fidelizacion_db;
create database fidelizacion_db character set utf8;

use fidelizacion_db;

CREATE TABLE `cliente` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `nro_documento` varchar(50) NOT NULL,
  `tipo_documento` varchar(50) NOT NULL,
  `pais` varchar(50) NOT NULL DEFAULT 'Paraguay',
  `email` varchar(50) NOT NULL,
  `telefono` varchar(50) NOT NULL,
  `nacimiento` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cliente_nro_documento_unique` (`nro_documento`),
  UNIQUE KEY `cliente_email_unique` (`email`)
);

CREATE TABLE `concepto` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `descripcion` varchar(100) NOT NULL,
 `requerido` int(10) unsigned NOT NULL COMMENT 'cantidad requerida de puntos',
 PRIMARY KEY (`id`),
 UNIQUE KEY `concepto_descripcion_unique` (`descripcion`)
);

CREATE TABLE `regla` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `lim_inferior` int(10) unsigned NOT NULL DEFAULT '0',
 `lim_superior` int(10) unsigned NOT NULL DEFAULT '4294967295' COMMENT 'default igual al máximo valor posible',
 `equivalencia` int(10) unsigned NOT NULL COMMENT 'monto de equivalencia de un punto',
 PRIMARY KEY (`id`)
);

CREATE TABLE `param_duracion` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `validez_ini` timestamp NOT NULL DEFAULT '2000-01-01 00:00:00' COMMENT 'fecha de inicio de validez de esta regla',
 `validez_fin` timestamp NOT NULL DEFAULT '2030-12-31 00:00:00' COMMENT 'fecha de fin de validez de esta regla',
 `duracion` int(10) unsigned NOT NULL COMMENT 'duración en días',
 PRIMARY KEY (`id`)
) COMMENT='permite definir la duración de los puntajes';

CREATE TABLE `bolsa` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `cliente_id` int(11) NOT NULL,
 `fecha_asignacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 `fecha_caducidad` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 `asignado` int(11) unsigned NOT NULL COMMENT 'cantidad de puntos asignados',
 `utilizado` int(11) unsigned NOT NULL DEFAULT '0' COMMENT 'cantidad de puntos utilizados',
 `saldo` int(11) unsigned NOT NULL COMMENT 'saldo de puntos (asignado - utilizado) (poner en 0 cuando llega la fecha de caducidad)',
 `monto_op` int(11) unsigned NOT NULL COMMENT 'monto de la operación que produjo esta bolsa',
 PRIMARY KEY (`id`),
 KEY `bolsa_cliente_fk` (`cliente_id`),
 CONSTRAINT `bolsa_cliente_fk` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`)
);

CREATE TABLE `uso` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `cliente_id` int(11) NOT NULL,
 `utilizado` int(11) unsigned NOT NULL COMMENT 'cantidad de puntos utilizados',
 `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'fecha y hora de utilización',
 `concepto_id` int(11) NOT NULL,
 PRIMARY KEY (`id`),
 KEY `uso_cliente_fk` (`cliente_id`),
 KEY `uso_concepto_fk` (`concepto_id`),
 CONSTRAINT `uso_cliente_fk` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`),
 CONSTRAINT `uso_concepto_fk` FOREIGN KEY (`concepto_id`) REFERENCES `concepto` (`id`)
);

CREATE TABLE `uso_detalle` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `uso_id` int(11) NOT NULL,
 `utilizado` int(11) unsigned NOT NULL COMMENT 'puntaje utilizado de la bolsa',
 `bolsa_id` int(11) NOT NULL,
 PRIMARY KEY (`id`),
 UNIQUE KEY `uso_detalle_uso_id_bolsa_id_unique` (`uso_id`,`bolsa_id`) USING BTREE,
 KEY `uso_detalle_bolsa_fk` (`bolsa_id`) USING BTREE,
 CONSTRAINT `uso_detalle_bolsa_fk` FOREIGN KEY (`bolsa_id`) REFERENCES `bolsa` (`id`),
 CONSTRAINT `uso_detalle_uso_fk` FOREIGN KEY (`uso_id`) REFERENCES `uso` (`id`)
);


DELETE FROM cliente;
INSERT INTO `cliente` (`nombre`, `apellido`, `nro_documento`, `tipo_documento`, `email`, `telefono`, `nacimiento`) VALUES
  ('Rogelio', 'Fernández', '2987123', 'CI', 'rogelio@gmail.com', '0984 372 817', '1980-10-15'),
  ('Juana Mariela', 'Zárate', '3849009', 'CI', 'juanazarate@gmail.com', '0971 673 807', '1985-01-31'),
  ('Pablo', 'Duarte', '3567901', 'CI', 'pabolduarte@outlook.com', '0971 673 807', '1990-06-03'),
  ('Laura', 'Torres', '2709512', 'CI', 'lauratorres@hotmail.com', '0992 123 456', '1987-11-21');

DELETE FROM regla;
INSERT INTO `regla` (`lim_inferior`, `lim_superior`, `equivalencia`) VALUES
  (0, 300000, 10000),
  (300000, 1000000, 9000);

DELETE FROM concepto;
INSERT INTO `concepto` (`descripcion`, `requerido`) VALUES
  ('Vale de 100.000 Gs.', 150),
  ('Vale de 250.000 Gs.', 300),
  ('Vale de 500.000 Gs.', 500);

DELETE FROM param_duracion;
INSERT INTO param_duracion (validez_ini, validez_fin, duracion) VALUES
  ('2000-01-01', '2029-12-31', 365);
