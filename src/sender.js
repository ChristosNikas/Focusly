// sender.js
require('dotenv').config();
const { eventBuffer, allEvents } = require('./tracker');

function buildSummary(events) {
  const categoryTotals = {};
  const appTotals = {};
  let totalSecs = 0;

  for (const e of events) {
    const secs = e.durationSecs || 0;
    totalSecs += secs;

    if (!categoryTotals[e.category]) {
      categoryTotals[e.category] = { secs: 0, color: e.categoryColor };
    }
    categoryTotals[e.category].secs += secs;

    if (!appTotals[e.app]) {
      appTotals[e.app] = { secs: 0, category: e.category, color: e.categoryColor };
    }
    appTotals[e.app].secs += secs;
  }

  return {
    date: new Date().toISOString().split('T')[0],
    totalSecs,
    categoryTotals,
    appBreakdown: Object.entries(appTotals)
      .map(([app, data]) => ({ app, ...data }))
      .sort((a, b) => b.secs - a.secs),
  };
}

async function flush() {
  eventBuffer.splice(0, eventBuffer.length);
  const summary = buildSummary(allEvents);
  console.log(`[sender] Summary built — ${Object.keys(summary.categoryTotals).length} categories.`);
  return summary;
}

module.exports = { flush, buildSummary };