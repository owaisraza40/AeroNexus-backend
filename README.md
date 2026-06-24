# AeroNexus Backend

## Overview

The AeroNexus Backend is a C++ based server that handles user authentication, aircraft management, flight management, and operational record storage for the AeroNexus Flight Management System.

The backend communicates with the React frontend through HTTP APIs and uses CSV files for data persistence.

## Features

* User Authentication
* Aircraft Management
* Flight Management
* Flight Record Management
* CSV-Based Data Storage
* REST API Communication

## Requirements

Before running the backend, make sure you have:

* GCC/G++ Compiler (MinGW for Windows)
* Windows Command Prompt or PowerShell

## Installation

Clone the repository:

```bash
git clone https://github.com/2540007-cmd/AeroNexus---Flight-Management-System.git
```

Navigate to the backend folder:

```bash
cd backend
```

## Build the Server

Compile the backend using:

```bash
g++ -o server server.cpp RecordDB.cpp Database.cpp User.cpp -lws2_32
```

## Run the Server

```bash
.\server.exe
```

If the server starts successfully, it will begin listening for frontend requests.

## Data Storage

Application data is stored using CSV files:

* User.csv
* FlightDB.csv
* PlaneDB.csv
* records.csv


## Authors

Developed as part of the AeroNexus Flight Management System project.
"# AeroNexus-backend" 
