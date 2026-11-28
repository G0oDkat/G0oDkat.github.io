import { Terminal, sleep } from './terminal.js';
import { prompt, session } from './session.js';

// The inline script in <head> adds .intro unless the visitor prefers reduced motion.
// Without JavaScript the class is never set and the profile shows right away.
const root = document.documentElement;

if (root.classList.contains('intro')) {
    const screen = document.getElementById('terminal');
    const terminal = new Terminal(screen, { prompt });

    await sleep(600);
    await terminal.play(session());
    terminal.clear();
    await sleep(250);

    root.classList.remove('intro');
    screen.parentElement.scrollTop = 0;
}
