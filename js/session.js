/**
 * The scripted session: a console login on an Ubuntu server, then downloading
 * and running a script. Timestamps are generated per visit, so it always looks live.
 */

const USER = 'torben';
const HOST = 'pietreck.dev';
const OS = 'Ubuntu 26.04.1 LTS';
const KERNEL = '7.0.0-15-generic';
const TTY = 'ttyS0';
const SERVER_IP = '185.199.108.153'; // GitHub Pages
const SCRIPT = { name: 'dev.sh', url: `https://${HOST}/releases/dev.sh`, bytes: 13414 };

export const prompt = { user: USER, host: HOST, path: '~' };

const print = (text, delay) => ({ type: 'print', text, delay });
const dim = (text, delay) => ({ type: 'print', text, delay, dim: true });
const blank = () => ({ type: 'print', text: '', delay: 0 });
const input = (label, text, options) => ({ type: 'input', prompt: label, text, ...options });
const command = (text, options) => ({ type: 'command', text, ...options });
const progress = (label, bytes, options) => ({ type: 'progress', label, bytes, ...options });

export function session(now = new Date()) {
    const lastLogin = loginTime(randomRecentDate(now, 7));
    const timestamp = wgetTime(now);
    const kilobytes = Math.round(SCRIPT.bytes / 1024);

    return [
        dim(`${OS} ${HOST} ${TTY}`, 300), // getty banner from /etc/issue
        blank(),
        input(`${HOST} login: `, USER, { delay: 300 }),
        input('Password: ', '*'.repeat(10), { typeDelay: 110, delay: 600 }),
        dim(`Last login: ${lastLogin} on ${TTY}`, 150),
        print(`Welcome to ${OS} (GNU/Linux ${KERNEL} x86_64)`, 100),
        blank(),
        dim(' * Documentation:  https://help.ubuntu.com', 60),
        dim(' * Management:     https://landscape.canonical.com', 60),
        dim(' * Support:        https://ubuntu.com/pro', 400),
        blank(),

        command(`wget ${SCRIPT.url}`),
        dim(`--${timestamp}--  ${SCRIPT.url}`, 150),
        dim(`Resolving ${HOST} (${HOST})... ${SERVER_IP}`, 200),
        dim(`Connecting to ${HOST} (${HOST})|${SERVER_IP}|:443... connected.`, 250),
        dim('HTTP request sent, awaiting response... 200 OK', 100),
        dim(`Length: ${SCRIPT.bytes} (${kilobytes}K) [application/x-sh]`, 60),
        dim(`Saving to: ‘${SCRIPT.name}’`, 100),
        blank(),
        progress(SCRIPT.name, SCRIPT.bytes, { duration: '0.01s', delay: 100 }),
        blank(),
        dim(`${timestamp} (2.41 MB/s) - ‘${SCRIPT.name}’ saved [${SCRIPT.bytes}/${SCRIPT.bytes}]`, 500),
        blank(),

        command(`chmod +x ${SCRIPT.name}`),
        command(`./${SCRIPT.name}`),
    ];
}

/** A random moment between one hour and `days` days before `now`. */
function randomRecentDate(now, days) {
    const hour = 60 * 60 * 1000;
    return new Date(now - hour - Math.random() * (days * 24 - 1) * hour);
}

/** login(1) format in UTC, e.g. "Fri Nov 27 23:58:41 UTC 2026". */
function loginTime(date) {
    const [weekday, day, month, year, time] = date.toUTCString().replace(',', '').split(' ');
    return `${weekday} ${month} ${String(Number(day)).padStart(2)} ${time} UTC ${year}`;
}

/** wget format in local time, e.g. "2026-11-28 10:15:02". */
function wgetTime(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} `
        + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
