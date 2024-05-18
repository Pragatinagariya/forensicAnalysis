const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Function to analyze log files
const analyzeLogFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    let errorCount = 0;
    let warningCount = 0;
    let infoCount = 0;
    let debugCount = 0;

    lines.forEach(line => {
      if (line.includes('ERROR')) {
        errorCount++;
      } else if (line.includes('WARNING')) {
        warningCount++;
      } else if (line.includes('INFO')) {
        infoCount++;
      } else if (line.includes('DEBUG')) {
        debugCount++;
      }
    });

    return {
      totalLines: lines.length,
      errorCount,
      warningCount,
      infoCount,
      debugCount
    };
  } catch (error) {
    console.error('Error reading log file:', error.message);
    return { error: error.message };
  }
};

app.get('/analyze', (req, res) => {
  const filePath = req.query.filePath;
  if (!filePath) {
    return res.status(400).send('File path is required');
  }

  const result = analyzeLogFile(filePath);
  if (result.error) {
    res.status(404).send(`Error reading file: ${result.error}`);
  } else {
    res.json(result);
  }
});

app.get('/', (req, res) => {
  res.send(`
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background: linear-gradient(45deg, #F1F3F4, #9AA0A6, #CEEAD6);
        background-size: 400% 400%;
        animation: gradientAnimation 15s ease infinite;
      }
      
      @keyframes gradientAnimation {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .container {
        background-color: #f0f2f2;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
        text-align: center;
        animation: fadeIn 2s ease-out;
        width: 500px;
        overflow: hidden; /* Added overflow for scrollable content */
      }

      h1 {
        color: #000;
        margin-bottom: 20px;
        animation: fadeIn 2s ease-out;
      }

      form {
        margin-top: 20px;
      }

      input[type="text"] {
        width: 300px;
        padding: 10px;
        border: none;
        border-radius: 5px;
        margin-right: 10px;
      }

      button {
        padding: 10px 20px;
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }

      button:hover {
        background-color: #0056b3;
      }

      .chart-container {
        display: flex;
        flex-direction: column; /* Changed to column layout */
        align-items: center;
        overflow-x: hidden; /* Hide horizontal scrollbar */
        overflow-y: auto; /* Enable vertical scrollbar */
        max-height: 400px; /* Limit height for scrollability */
      }

      canvas {
        margin-top: 20px;
      }
    </style>
    <div class="container">
      <h1>Log File Analyzer</h1>
      <form action="/analyze" method="get">
        <input type="text" name="filePath" placeholder="Enter full path to the log file">
        <button type="submit">Analyze</button>
      </form>
      <div class="chart-container">
        <canvas id="pieChart" width="400" height="400"></canvas>
        <canvas id="barChart" width="400" height="400"></canvas>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script>
        const form = document.querySelector('form');
        form.addEventListener('submit', function(event) {
          event.preventDefault();
          const filePath = document.querySelector('input[name="filePath"]').value;
          fetch(\`/analyze?filePath=\${encodeURIComponent(filePath)}\`)
            .then(response => response.json())
            .then(data => {
              const pieCtx = document.getElementById('pieChart').getContext('2d');
              const barCtx = document.getElementById('barChart').getContext('2d');

              const pieChart = new Chart(pieCtx, {
                type: 'pie',
                data: {
                  labels: ['Total Lines', 'Errors', 'Warnings', 'Info', 'Debug'],
                  datasets: [{
                    data: [data.totalLines, data.errorCount, data.warningCount, data.infoCount, data.debugCount],
                    backgroundColor: [
                      'rgba(99, 255, 132, 0.2)',
                      'rgba(255, 99, 132, 0.2)',
                      'rgba(255, 206, 86, 0.2)',
                      'rgba(54, 162, 235, 0.2)',
                      'rgba(153, 102, 255, 0.2)'
                    ],
                    borderColor: [
                      'rgba(99, 255, 132, 1)',
                      'rgba(255, 99, 132, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                  }]
                },
                options: {
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    }
                  }
                }
              });

              const barChart = new Chart(barCtx, {
                type: 'bar',
                data: {
                  labels: ['Total Lines', 'Errors', 'Warnings', 'Info', 'Debug'],
                  datasets: [{
                    label: 'Count of Logs',
                    data: [data.totalLines, data.errorCount, data.warningCount, data.infoCount, data.debugCount],
                    backgroundColor: [
                      'rgba(99, 255, 132, 0.2)',
                      'rgba(255, 99, 132, 0.2)',
                      'rgba(255, 206, 86, 0.2)',
                      'rgba(54, 162, 235, 0.2)',
                      'rgba(153, 102, 255, 0.2)'
                    ],
                    borderColor: [
                      'rgba(99, 255, 132, 1)',
                      'rgba(255, 99, 132, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                  }]
                },
                options: {
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }
              });
            })
            .catch(error => console.error('Error fetching data:', error));
        });
      </script>
    </div>
  `);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
