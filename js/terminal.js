/**
 * A small scripted terminal.
 *
 * Plays a list of steps into an element: printed output, input typed behind a
 * prompt, and a wget-style progress bar. Lines are built as DOM nodes, so no
 * HTML strings are ever parsed.
 *
 * Step shapes:
 *   { type: 'print',    text, dim?, delay? }
 *   { type: 'input',    prompt, text, typeDelay?, delay? }   e.g. "login: "
 *   { type: 'command',  text, typeDelay?, delay? }           behind the shell prompt
 *   { type: 'progress', label, bytes, duration, width?, stepDelay?, delay? }
 */

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const DEFAULTS = {
    typeDelay: 85,    // ms per typed character
    lineDelay: 350,   // ms pause after each line
    promptPause: 600, // ms the prompt waits before typing starts
};

export class Terminal {
    #screen;
    #scroller;
    #prompt;
    #options;

    /**
     * @param {HTMLElement} screen  element the lines are written into; its parent scrolls
     * @param {object} options      timing overrides (see DEFAULTS) and the shell prompt
     * @param {{user: string, host: string, path: string}} options.prompt
     */
    constructor(screen, { prompt, ...options }) {
        this.#screen = screen;
        this.#scroller = screen.parentElement;
        this.#prompt = prompt;
        this.#options = { ...DEFAULTS, ...options };
    }

    async play(steps) {
        for (const step of steps) {
            const line = this.#addLine(step.dim);
            await this.#render(line, step);
            await sleep(step.delay ?? this.#options.lineDelay);
            line.classList.remove('is-typing');
        }
    }

    clear() {
        this.#screen.replaceChildren();
    }

    #addLine(dim) {
        const line = document.createElement('div');
        line.className = dim ? 'line line--dim' : 'line';
        this.#screen.append(line);
        this.#scrollToEnd();
        return line;
    }

    #render(line, step) {
        switch (step.type) {
            case 'print':
                line.textContent = step.text;
                return;
            case 'input':
                return this.#type(line, [span('prompt-login', step.prompt)], step);
            case 'command':
                return this.#type(line, this.#shellPrompt(), step);
            case 'progress':
                return this.#progress(line, step);
            default:
                throw new Error(`Unknown step type: ${step.type}`);
        }
    }

    /** Coloured like Ubuntu's default bash prompt: user@host:path$ */
    #shellPrompt() {
        const { user, host, path } = this.#prompt;
        return [span('prompt-user', `${user}@${host}`), ':', span('prompt-path', path), '$ '];
    }

    async #type(line, prompt, { text, typeDelay = this.#options.typeDelay }) {
        const typed = span();
        line.append(...prompt, typed);
        line.classList.add('is-typing'); // shows the blinking cursor (CSS)
        await sleep(this.#options.promptPause);
        for (const char of text) {
            await sleep(typeDelay);
            typed.textContent += char;
            this.#scrollToEnd();
        }
    }

    /** wget's bar, narrowed to fit the window: "dev.sh        100%[=====>]  13.10K  in 0.01s" */
    async #progress(line, { label, bytes, duration, width = 20, stepDelay = 50 }) {
        for (let i = 1; i <= width; i++) {
            await sleep(stepDelay);
            const percent = String(Math.round((i / width) * 100)).padStart(3);
            const bar = '='.repeat(i - 1) + '>' + ' '.repeat(width - i);
            const size = `${((bytes * i) / width / 1024).toFixed(2)}K`.padStart(7);
            const time = i === width ? `  in ${duration}` : '';
            line.textContent = `${label.padEnd(14)}${percent}%[${bar}] ${size}${time}`;
        }
    }

    #scrollToEnd() {
        this.#scroller.scrollTop = this.#scroller.scrollHeight;
    }
}

function span(className, text = '') {
    const element = document.createElement('span');
    if (className) element.className = className;
    element.textContent = text;
    return element;
}
