import jsdom from 'jsdom';
import tape from 'tape';
import raf from 'raf';
import asap from 'asap';

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.navigator = { userAgent: 'jsdom' };

export default tape;

export function wait(fn) {
  asap(() => {
    raf(() => {
      fn();
    });
  });
}
