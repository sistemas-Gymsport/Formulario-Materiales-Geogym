export const SCHEDULE_TEXTS = {
  noticeTitle: '¡Aviso importante para tus pedidos!',
  noticeIntro:
    'Recuerda que las entregas de material en sucursal se realizan exclusivamente los días lunes, miércoles y viernes.\nPara garantizar que tu material llegue a tiempo, planifica y registra tu solicitud un día antes:',
  noticeOutro: '¡Anticipa tus insumos para no quedarte sin material en tu sucursal!',
  noticeButton: 'Entendido, continuar',
  closedTitle: 'Formulario cerrado temporalmente',
  closedMessage:
    'En este momento la recepción de pedidos no se encuentra disponible.\nRecuerda que las entregas se realizan los días lunes, miércoles y viernes, por lo que las solicitudes deben realizarse con un día de anticipación dentro de los siguientes horarios:',
  closedOutro: 'Te esperamos en el siguiente horario de apertura para registrar la lista de materiales de tu sucursal.',
  closedButton: 'Volver al inicio'
};

export const SCHEDULE_DEFAULTS = {
  timezone: 'America/Mexico_City',
  enabled: true,
  openingTime: '05:00',
  closingTime: '17:00',
  allowedWeekdays: [0, 2, 4, 6],
  ...SCHEDULE_TEXTS
};
