import jsdom from 'jsdom';
import tape from 'tape';

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.navigator = { userAgent: 'jsdom' };

export default tape;
