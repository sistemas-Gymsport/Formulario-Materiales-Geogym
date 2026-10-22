ALTER TABLE "FormSchedule"
  ALTER COLUMN "openingTime" SET DEFAULT '05:00',
  ALTER COLUMN "closingTime" SET DEFAULT '17:00',
  ALTER COLUMN "allowedWeekdays" SET DEFAULT ARRAY[0, 2, 4, 6]::INTEGER[],
  ALTER COLUMN "closedMessage" TYPE VARCHAR(800),
  ADD COLUMN "noticeTitle" VARCHAR(120) NOT NULL DEFAULT '¡Aviso importante para tus pedidos!',
  ADD COLUMN "noticeIntro" VARCHAR(800) NOT NULL DEFAULT E'Recuerda que las entregas de material en sucursal se realizan exclusivamente los días lunes, miércoles y viernes.\nPara garantizar que tu material llegue a tiempo, planifica y registra tu solicitud un día antes:',
  ADD COLUMN "noticeOutro" VARCHAR(400) NOT NULL DEFAULT '¡Anticipa tus insumos para no quedarte sin material en tu sucursal!',
  ADD COLUMN "noticeButton" VARCHAR(40) NOT NULL DEFAULT 'Entendido, continuar',
  ADD COLUMN "closedOutro" VARCHAR(400) NOT NULL DEFAULT 'Te esperamos en el siguiente horario de apertura para registrar la lista de materiales de tu sucursal.',
  ADD COLUMN "closedButton" VARCHAR(40) NOT NULL DEFAULT 'Volver al inicio';

UPDATE "FormSchedule"
SET "closedTitle" = 'Formulario cerrado temporalmente'
WHERE "closedTitle" = 'Las solicitudes de materiales están cerradas por el momento';

UPDATE "FormSchedule"
SET "closedMessage" = E'En este momento la recepción de pedidos no se encuentra disponible.\nRecuerda que las entregas se realizan los días lunes, miércoles y viernes, por lo que las solicitudes deben realizarse con un día de anticipación dentro de los siguientes horarios:'
WHERE "closedMessage" = 'Consulta los próximos días habilitados para realizar tu solicitud.';

UPDATE "FormSchedule"
SET "openingTime" = '05:00', "closingTime" = '17:00', "allowedWeekdays" = ARRAY[0, 2, 4, 6]::INTEGER[]
WHERE "openingTime" = '08:00' AND "closingTime" = '18:00' AND "allowedWeekdays" = ARRAY[1, 2, 3, 4, 5]::INTEGER[];

ALTER TABLE "FormSchedule"
  ALTER COLUMN "noticeTitle" DROP DEFAULT,
  ALTER COLUMN "noticeIntro" DROP DEFAULT,
  ALTER COLUMN "noticeOutro" DROP DEFAULT,
  ALTER COLUMN "noticeButton" DROP DEFAULT,
  ALTER COLUMN "closedOutro" DROP DEFAULT,
  ALTER COLUMN "closedButton" DROP DEFAULT,
  ALTER COLUMN "closedTitle" DROP DEFAULT,
  ALTER COLUMN "closedMessage" DROP DEFAULT;
