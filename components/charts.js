// components/charts.js
export function renderLangChart(existingChart, canvasEl, langTotals) {
  const labels = Object.keys(langTotals);
  const values = Object.values(langTotals);

  if (existingChart) existingChart.destroy();

  if (!labels.length) {
    return new Chart(canvasEl, {
      type: "doughnut",
      data: { labels: ["No language data"], datasets: [{ data: [1] }] },
      options: { plugins: { legend: { position: "bottom" } } },
    });
  }

  return new Chart(canvasEl, {
    type: "pie",
    data: {
      labels,
      datasets: [{ data: values }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
    },
  });
}
