// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/react';
import { beforeEach } from 'vitest';

// Raise the default async timeout so waitFor assertions don't flake under the
// CPU contention of the pre-commit hook / CI (build + tests running together).
configure({ asyncUtilTimeout: 5000 });

// Isolate localStorage between tests: several play screens read/write the daily
// play-once store, so a "solved" case in one test would otherwise leak into the
// next (e.g. tripping the daily guard). Clear it before every test.
beforeEach(() => {
  try {
    window.localStorage.clear();
  } catch {
    /* jsdom without storage — nothing to clear */
  }
});

// Mock matchmedia
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };
