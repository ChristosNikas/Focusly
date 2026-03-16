// tracker.js
const { spawn }       = require('child_process');
const path            = require('path');
const { getCategory } = require('./categories');

const eventBuffer = [];
const allEvents   = [];

let watcherProcess = null;

function start() {
  if (watcherProcess) return;

  watcherProcess = spawn('python3', [path.join(__dirname, 'watcher.py')], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  watcherProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean);

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (!parsed.app || parsed.durationSecs <= 3) continue;

        if (['gnome-shell', 'gjs'].includes(parsed.app.toLowerCase())) continue;

        const cat = getCategory(parsed.app, parsed.windowTitle);

        const event = {
          app:           parsed.app,
          windowTitle:   parsed.windowTitle  || '',
          duration:      parsed.duration     || '',
          durationSecs:  parsed.durationSecs,
          timestamp:     parsed.timestamp    || '',
          category:      cat.name,
          categoryColor: cat.color,
        };

        eventBuffer.push(event);
        allEvents.push(event);

        console.log(`[tracker] captured: ${event.app} (${event.duration}) [${event.category}]`);
      } catch (_) {}
    }
  });

  watcherProcess.stderr.on('data', (data) => {
    const msg = data.toString();
    if (!msg.includes('dbind') && !msg.includes('AT-SPI')) {
      process.stderr.write(msg);
    }
  });

  watcherProcess.on('exit', (code) => {
    console.log(`[tracker] watcher exited with code ${code}`);
    watcherProcess = null;
  });

  console.log('[tracker] Started.');
}

function stop() {
  if (watcherProcess) {
    watcherProcess.kill();
    watcherProcess = null;
  }
  console.log('[tracker] Stopped.');
}

module.exports = { eventBuffer, allEvents, start, stop };