#  AeroVision – AI Powered Air Quality Intelligence Platform

AeroVision is a **full-stack environmental intelligence platform** that provides real-time air quality monitoring, pollution-aware route planning, AI travel recommendations, AQI prediction, and historical analytics through interactive dashboards and maps.

The platform helps users **make smarter and healthier travel decisions** by combining **real-time pollution data, machine learning predictions, and geospatial analysis.**

---

#  Features

###  Real-Time AQI Monitoring

* Fetches real-time air quality data for any city
* Displays AQI category and pollutant levels
* Shows pollutants like:

  * PM2.5
  * PM10
  * NO₂
  * SO₂
  * O₃
  * CO

---

###  AI Travel AQI Advisor

Provides **AI-generated health recommendations** based on:

* Destination city
* Age group
* Health conditions
* Outdoor exposure
* Activity intensity
* Mask type
* AQI awareness level

This feature helps users understand **health risks and precautions before traveling.**

---

### Interactive AQI Map

* Built with **Mapbox**
* Drag a location pin anywhere on the map
* Instantly analyze air quality for that location
* Displays AQI value, category, and pollutant levels

---

###  Pollution-Aware Route Planner

Find the **cleanest travel route** between two cities.

Features:

* Source & destination city input
* Calculates **lowest AQI exposure path**
* Displays:

  * Route distance
  * Travel duration
  * Average AQI along the route
* Visual route drawn on interactive map

---

###  AQI Prediction (Machine Learning)

Predicts **future air quality levels** using machine learning models.

Displays:

* Predicted AQI value
* AQI category
* Trend analysis
* Health advice based on prediction

---

###  AQI History & Analytics

Analyze pollution trends using interactive charts:

* 7-day AQI trend graph
* Pollutant concentration charts
* 5-day average AQI trends
* 24-hour AQI variation

Charts built using **Chart.js**

---

###  Authentication System

Users can:

* Sign up
* Log in
* Access protected dashboard pages

Authentication handled with **JWT tokens.**

---

#  Tech Stack

### Frontend

* Next.js
* React.js
* JavaScript
* HTML5
* CSS3
* GSAP Animations
* Chart.js

### Backend

* Node.js
* Express.js
* REST APIs

### Database

* MongoDB

### APIs & Tools

* Mapbox API
* Open AQI Data APIs

### Machine Learning

* AQI Prediction Model
* Pollution trend analysis

---

#  System Architecture

Frontend (Next.js)
↓
API Server (Node.js + Express)
↓
Database (MongoDB)
↓
External APIs (AQI data, Mapbox)

Machine Learning Service handles AQI predictions.

---


# ⚙ Installation Guide

###  Clone the Repository

```bash
git clone https://github.com/yourusername/aerovision.git
cd aerovision
```

---

###  Install Frontend Dependencies

```bash
npm install
```

---

###  Install Backend Dependencies

```bash
cd backend
npm install
```

---



### 5️⃣ Run Backend

```bash
npm start
```

---

### 6️⃣ Run Frontend

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

#  Project Structure

```
AeroVision
│
├── frontend
│   ├── pages
│   ├── components
│   ├── layouts
│   ├── styles
│   └── context
│
├── backend
│   ├── routes
│   ├── controllers
│   ├── models
│   └── middleware
│
├── ml-service
│   └── AQI prediction model
│
└── README.md
```

---

#  Real World Use Cases

* Smart city pollution monitoring
* Health risk assessment
* Travel safety recommendations
* Urban environmental analytics
* Pollution-aware navigation systems

---

#  Future Improvements

* Mobile application
* Live AQI notifications
* Personal pollution exposure tracking
* Weather integration
* AI pollution forecasting for multiple days

---

 👨‍💻 Author

Shizan-ansari

Computer Science Developer
Interested in:

* AI/ML
* Web Development
* Environmental Intelligence Systems

---

Support

If you like this project, please consider **starring the repository** ⭐

It helps the project reach more developers.

