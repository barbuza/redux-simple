import { JSDOM } from 'jsdom';
import tape from 'tape';
import raf from 'raf';
import asap from 'asap';

const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.navigator = { userAgent: 'jsdom' };

export default tape;

export function wait(fn) {
  asap(() => {
    raf(() => {
      fn();
    });
  });
}
