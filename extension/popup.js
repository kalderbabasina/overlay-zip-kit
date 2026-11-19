"use strict";

if (/^ru\b/i.test(navigator.language)) {
  document.documentElement.lang = "ru";
  document.querySelector('div[lang="en"]').hidden = true;
  document.querySelector('div[lang="ru"]').hidden = false;
}
