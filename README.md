![Header Image](header-image.png)

# MicroClimate IoT Server

Explore sensor and weather data for Dinajpur district, Bangladesh.

### Overview
This is an Express.js-based server for handling IoT microclimate data. It serves real-time sensor readings and weather data, ensuring efficient and accessible environmental monitoring.

### Directory Structure
```
└── iot-microclimate-server/
    ├── index.js           # Main Express server file
    ├── package.json       # Project dependencies and metadata
    ├── vercel.json        # Configuration file for Vercel deployment
    └── public/
        └── index.html     # Frontend UI (Tailwind CSS and Vanilla JS)
```

### Features
- Serves real-time IoT sensor data
- Provides weather information for Dinajpur, Bangladesh
- Lightweight Express.js backend
- Interactive User Interface with Tailwind CSS and Vanilla JS

### Installation & Usage
#### Prerequisites
- Node.js

#### Installation
```sh
# Clone the repository
git clone https://github.com/AbidHasanRafi/iot-microclimate-server.git
cd iot-microclimate-server

# Install dependencies
npm install

# Run the server
node index.js
```

The server will be accessible at `http://localhost:3000` (or configured port).

### Deployment
To deploy on Vercel, ensure you have the Vercel CLI installed:
```sh
vercel
```
Follow the prompts to deploy.

### Disclaimer
Unauthorized copying, use, or distribution of data without the author's consent or citation is strictly prohibited!

---
📧 **Contact:** [ahr16.abidhasanrafi@gmail.com](mailto:ahr16.abidhasanrafi@gmail.com)