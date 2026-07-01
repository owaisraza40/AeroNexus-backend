<div align="center">
  <h1>✈️ AeroNexus Backend</h1>
  <p><strong>A high-performance C++ REST API for the AeroNexus Flight Management System</strong></p>
  
  [![C++17](https://img.shields.io/badge/C%2B%2B-17-blue.svg)](https://isocpp.org/)
  [![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20Docker-lightgrey.svg)](#)
  [![Security](https://img.shields.io/badge/Security-Fortified-success.svg)](#)
</div>

---

## 📖 Overview

The **AeroNexus Backend** is a highly efficient, lightweight C++ server designed to handle the core logic of the AeroNexus Flight Management System. 

It provides secure RESTful APIs for the React frontend, managing user authentication, aircraft logistics, flight scheduling, and operational record keeping. Built entirely on C++ standard libraries with a focus on speed, it leverages a robust file-based CSV database system for persistent, scalable storage.

## ✨ Features

- **🛡️ Secure Authentication:** Custom token-based auth with `picosha2` SHA-256 password hashing.
- **🔐 Role-Based Access Control:** Distinguishes between `admin` (write access) and `regular` (read-only) users.
- **⚡ Ultra-Lightweight API:** Powered by the header-only `httplib`, offering blazing-fast HTTP request handling.
- **🗄️ File-Based Persistence:** Engineered with safe, thread-locked CSV file interactions—no external database servers required.
- **🛫 Comprehensive Management:** Fully handles nested data for Companies, Planes, Flights, and past Records.
- **🌐 Cross-Origin Ready:** Native CORS handling and environment-based URL configurations.

---

## 🛠️ Tech Stack

- **Core Language:** C++17
- **HTTP Server:** [cpp-httplib](https://github.com/yhirose/cpp-httplib)
- **JSON Serialization:** [nlohmann/json](https://github.com/nlohmann/json)
- **Hashing:** [PicoSHA2](https://github.com/okdshin/PicoSHA2)
- **Deployment:** Docker & Railway

---

## 🚀 Getting Started

### Prerequisites

- GCC/G++ Compiler (MinGW if on Windows)
- Make sure to have a C++17 compatible compiler installed.

### 1. Clone the Repository

```bash
git clone https://github.com/owaisraza40/AeroNexus-backend.git
cd AeroNexus-backend
```

### 2. Build the Server

**On Windows (Powershell/CMD):**
```bash
g++ -std=c++17 server.cpp Database.cpp RecordDB.cpp User.cpp Company.cpp FlightDB.cpp PlaneDB.cpp -o server -lws2_32 -pthread
```

**On Linux/macOS:**
```bash
g++ -std=c++17 server.cpp Database.cpp RecordDB.cpp User.cpp Company.cpp FlightDB.cpp PlaneDB.cpp -o server -pthread
```

**Using Docker:**
```bash
docker build -t aeronexus-backend .
docker run -p 8080:8080 aeronexus-backend
```

### 3. Run

```bash
./server
```
The server will start listening on port `8080` (or the port defined by your `PORT` environment variable).

---

## 🗂️ Data Architecture

AeroNexus uses a scalable directory structure to segregate company data safely, preventing bottlenecks and data corruption:

```text
Data_Dependancy/
├── Companies.csv                  # Main registry of airlines
├── Users.csv                      # Registered users and hashed passwords
├── Company_Records/               # Historical flight records
│   └── [Company]_records.csv
├── Company_Planes/                # Active fleet management
│   └── [Company]_planes.csv
└── Company_Flights/               # Scheduled future flights
    └── [Company]_flights.csv
```

---

## 🔒 Security Practices

This backend has been heavily fortified against standard web vulnerabilities:
- **Injection Attacks:** Complete sanitization on CSV write operations and robust JSON string escaping.
- **Path Traversal:** File access is strictly sanitized—company names are filtered before being mapped to file paths.
- **Race Conditions:** Implemented `std::mutex` globally to ensure thread-safe read/write operations during high concurrency.
- **Memory Management:** Full utilization of virtual destructors and deep-cleaning to prevent runtime memory leaks.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📝 License
This project is part of the AeroNexus ecosystem.
