import 'react-i18next';
import common from '../../public/locales/vi/common.json';
import controls from '../../public/locales/vi/controls.json';
import messages from '../../public/locales/vi/messages.json';
import sheet from '../../public/locales/vi/sheet.json';
import board from '../../public/locales/vi/board.json';
import exportNs from '../../public/locales/vi/export.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      controls: typeof controls;
      messages: typeof messages;
      sheet: typeof sheet;
      board: typeof board;
      export: typeof exportNs;
    };
  }
}
