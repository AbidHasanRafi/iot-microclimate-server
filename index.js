require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const path = require('path');

const app = express();

// Enable CORS
app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Handle root request to serve `index.html`
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// MongoDB Connection
const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.CLUSTER_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=${process.env.APP_NAME}`;

mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB", err));

// Define schema
const sensorDataSchema = new mongoose.Schema({
  sensorTemperature: Number,
  sensorHumidity: Number,
  sensorPressure: Number,
  weatherTemperature: Number,
  weatherHumidity: Number,
  weatherPressure: Number,
  rain: String,
  lightIntensity: Number,
  timestamp: { type: Date, default: Date.now }
});

const SensorData = mongoose.model('SensorData', sensorDataSchema);

// OpenWeather API
const openWeatherApiKey = process.env.OPEN_WEATHER_API_KEY;
const openWeatherApiUrl = `http://api.openweathermap.org/data/2.5/weather?q=Dinajpur&appid=${openWeatherApiKey}&units=metric`;
let espIp = null;  // Store ESP's IP globally

async function fetchWeatherData() {
  try {
    const response = await axios.get(openWeatherApiUrl);
    return {
      weatherTemperature: response.data.main.temp,
      weatherHumidity: response.data.main.humidity,
      weatherPressure: response.data.main.pressure
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

// Get public IP using ipify API
async function getPublicIp() {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    console.error("Error fetching IP:", error);
    return 'IP not found';
  }
}

// API to receive sensor data
app.post('/sensor-data', async (req, res) => {
  try {
    const weatherData = await fetchWeatherData();
    if (!weatherData) return res.status(500).send("Error fetching weather data");

    const newSensorData = new SensorData({ ...req.body, ...weatherData });
    await newSensorData.save();
    res.status(200).send("Data saved successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving data");
  }
});

// API to receive and store ESP's IP
app.post('/esp-ip', (req, res) => {
    espIp = req.body.ip;
    console.log("Received ESP IP:", espIp);
    res.status(200).send("ESP IP received");
});

// API to fetch stored ESP IP
app.get('/esp-ip', (req, res) => {
    if (espIp) {
        res.status(200).json({ espIp });
    } else {
        res.status(404).send("ESP IP not available");
    }
});

// GET route to fetch sensor data in JSON format
app.get('/sensor-data', async (req, res) => {
  try {
    const data = await SensorData.find({});
    res.status(200).json(data);  // Return data in JSON format
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching sensor data");
  }
});

// CSV Download
app.get('/download/csv', async (req, res) => {
  try {
    const data = await SensorData.find({});
    const csv = new Parser().parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('sensor-data.csv');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating CSV");
  }
});

// Excel Download
app.get('/download/excel', async (req, res) => {
  try {
    const data = await SensorData.find({});
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sensor Data');
    
    worksheet.columns = [
      { header: 'Sensor Temperature', key: 'sensorTemperature' },
      { header: 'Sensor Humidity', key: 'sensorHumidity' },
      { header: 'Sensor Pressure', key: 'sensorPressure' },
      { header: 'Weather Temperature', key: 'weatherTemperature' },
      { header: 'Weather Humidity', key: 'weatherHumidity' },
      { header: 'Weather Pressure', key: 'weatherPressure' },
      { header: 'Rain', key: 'rain' },
      { header: 'Light Intensity', key: 'lightIntensity' },
      { header: 'Timestamp', key: 'timestamp' }
    ];

    worksheet.addRows(data);

    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment('sensor-data.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating Excel file");
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
