import theme from '../theme/platform';

const { Colors } = theme;

const VISIT_STATUS = {
  CANCELLED: 'C',
  NEW_VISIT: 'A',
  HELD: 'H',
  RESCHEDULE: 'R',
};

const VISIT_STATUS_COLOR = {
  CANCELLED: {
    visitStausStyle: { color: Colors.white, backgroundColor: Colors.shiraz },
    visitDetailsStatusColor: Colors.shiraz,
  },
  NEW_VISIT: {
    visitStausStyle: { color: Colors.voodoo, backgroundColor: Colors.morningGlory },
    visitDetailsStatusColor: Colors.bondiBlue,
  },
  RESCHEDULE: {
    visitStausStyle: { color: Colors.voodoo, backgroundColor: Colors.amber },
    visitDetailsStatusColor: Colors.amber,
  },
  NON_TIME_SPECIFIC: {
    visitStausStyle: { color: Colors.white, backgroundColor: Colors.white },
    visitDetailsStatusColor: Colors.white,
  },
};

const VISIT_TYPE = {
  ATTENDANCE_TYPE: 'T',
};

export { VISIT_STATUS, VISIT_TYPE, VISIT_STATUS_COLOR };
