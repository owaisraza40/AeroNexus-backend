#include "RecordDB.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <cstdio>
using namespace std;
RecordDB::RecordDB(string fname) : Database(fname){
    setCap(); // Set capacity based on file content

    airport = new string[capacity];
    destination = new string[capacity];
    modelno = new string[capacity];
    distance = new float[capacity];
    fuelConsumed = new float[capacity];
    status = new string[capacity];

    loadData(); // Load existing data from the file
}

RecordDB::~RecordDB() {
    delete[] airport;
    delete[] destination;
    delete[] modelno;
    delete[] distance;
    delete[] fuelConsumed;
    delete[] status;
}

void RecordDB::setCap() {
    Database::setCap(); // Call base class method to set capacity
    capacity += 100; // Add extra space for new records unique to RecordDB
    cout << "Record capacity set to: " << capacity << endl;
}

void RecordDB::loadData() {
    // Implement file reading logic to populate the record database
    ifstream file(fileName);
    if (!file.is_open()) {
        cerr << "Error opening file: " << fileName << endl;
        return;
    }
    string line;
    string data;
    bool emptylines = false;
    int index = 0;
    while (getline(file, line)) {
        if (line == ""){
            emptylines = true;
            continue; // Skip empty lines
        }
        stringstream ss(line);

        getline(ss, data, ',');
        airport[index] = data;

        getline(ss, data, ',');
        destination[index] = data;

        getline(ss, data, ',');
        modelno[index] = data;

        getline(ss, data, ',');
        distance[index] = stof(data);

        getline(ss, data, ',');
        fuelConsumed[index] = stof(data);

        getline(ss, data, ',');
        status[index] = data;

        index++;
    }
    pointer = index; // Set pointer to the number of records loaded
    file.close();
    if (emptylines) {
        cout << "Warning: Empty lines were found and skipped in the file." << endl;
        cout << "Correcting file by removing empty lines..." << endl;
        removeEmptyLines(); // Remove empty lines from the file
        cout << "Empty lines removed and file corrected." << endl;
    }
    
    cout << "Data loaded successfully from " << fileName << endl;
}

void RecordDB::addRecord() {
    if (pointer >= capacity) {
        cout << "Database is full. Cannot add more records." << endl;
        return;
    }
    cout << "Enter Starting Airport: ";
    getline(cin, airport[pointer]);
    cout << "Enter Destination Airport: ";
    getline(cin, destination[pointer]);
    cout << "Enter Plane Model Number: ";
    getline(cin, modelno[pointer]);
    cout << "Enter Flight Distance: ";
    cin >> distance[pointer];
    cout << "Enter Fuel Consumed: ";
    cin >> fuelConsumed[pointer];
    cin.ignore(); // Clear the input buffer
    cout << "Enter Flight Status ( 1 for Scheduled, 2 for Completed, 3 for Cancelled): ";
    int x;
    cin >> x;
    switch (x) {
        case 1:
            status[pointer] = "Scheduled";
            break;
        case 2:
            status[pointer] = "Completed";
            break;
        case 3:
            status[pointer] = "Cancelled";
            break;
        default:
            cout << "Invalid input for status. Setting to 'Scheduled' by default." << endl;
            status[pointer] = "Scheduled";
    }
    cout << "Record added successfully." << endl;
    pointer++;                  // Increment temporary pointer for new record
}

void RecordDB::saveData() {
    ofstream file("Data_Dependancy/Company_Records/temp.csv");
    if (!file.is_open()) {
        cerr << "Error opening file for writing: " << fileName << endl;
        return;
    }
    for (int i = 0; i < pointer; i++) {
        file << airport[i] << ","
             << destination[i] << ","
             << modelno[i] << ","
             << distance[i] << ","
             << fuelConsumed[i] << ","
             << status[i] << endl;
    }
    file.close();
    remove(fileName.c_str()); // Remove old file
    rename("Data_Dependancy/Company_Records/temp.csv", fileName.c_str()); // Replace old file with new file
    cout << "Data saved successfully to " << fileName << endl;
}

void RecordDB::displayRecords() {
    cout << "\n========== CURRENT RECORDS ==========\n";
    cout << "S.No.\tAirport\tDestination\tModel No.\tDistance(km)\tFuel Consumed(liters)\tStatus" << endl;
    for (int i = 0; i < pointer; i++) {
        cout << (i + 1) << "\t" << airport[i] << "\t" << destination[i] << "\t" << modelno[i] << "\t" << distance[i] << "\t" << fuelConsumed[i] << "\t" << status[i] << endl;
    }

    cout << "\n=====================================\n";
}
void RecordDB::updateRecord(int index) {
    index--; // Adjust index for 0-based array
    if (index < 0 || index >= pointer) {
        cout << "Invalid record index." << endl;
        return;
    }
    cout << "Enter new Starting Airport: ";
    getline(cin, airport[index]);
    cout << "Enter new Destination Airport: ";
    getline(cin, destination[index]);
    cout << "Enter new Plane Model Number: ";
    getline(cin, modelno[index]);
    cout << "Enter new Flight Distance: ";
    cin >> distance[index];
    cout << "Enter new Fuel Consumed: ";
    cin >> fuelConsumed[index];
    cin.ignore(); // Clear the input buffer after reading numeric input
    cout << "Enter new Flight Status ( 1 for Scheduled, 2 for Completed, 3 for Cancelled): ";
    int x;
    cin >> x;
    while (x < 1 || x > 3) {
        cout << "Invalid input for status. Please enter 1 for Scheduled, 2 for Completed, or 3 for Cancelled: ";
        cin >> x;
    }
    switch (x) {
        case 1:
            status[index] = "Scheduled";
            break;
        case 2:
            status[index] = "Completed";
            break;
        case 3:
            status[index] = "Cancelled";
            break;
        default:
            cout << "Invalid input for status. Keeping previous status." << endl;
    }
    cout << "Record updated successfully." << endl;
}

void RecordDB::deleteRecord(int index) {
    index--; // Adjust index for 0-based array
    if (index < 0 || index >= pointer) {
        cout << "Invalid record index." << endl;
        return;
    }
    for(int i = index; i < pointer - 1; i++) {
        airport[i] = airport[i + 1];
        destination[i] = destination[i + 1];
        modelno[i] = modelno[i + 1];
        distance[i] = distance[i + 1];
        fuelConsumed[i] = fuelConsumed[i + 1];
        status[i] = status[i + 1];
    }
    pointer--; // Decrement pointer to reflect deleted record
    cout << "Record deleted successfully." << endl;
}