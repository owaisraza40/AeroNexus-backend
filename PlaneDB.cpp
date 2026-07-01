#include "PlaneDB.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <cstdio>
using namespace std;

PlaneDB::PlaneDB(string fname) : Database(fname){
    setCap(); // Set capacity based on file content
    modelNo = new string[capacity];
    fuelCapacity = new float[capacity];
    status = new string[capacity];
    loadData();
}

PlaneDB::~PlaneDB() {
    delete[] modelNo;
    delete[] fuelCapacity;
    delete[] status;
}

void PlaneDB::setCap() {
    Database::setCap(); // Call base class method to set capacity
    capacity += 10; // Add extra space for new records unique to PlaneDB
    cout << "Plane database capacity set to: " << capacity << endl;
}

void PlaneDB::loadData() {
    ifstream file(fileName);
    if (!file.is_open()) {
        cerr << "Error: Could not open file " << fileName << endl;
        return;
    }

    string data;
    string line;
    int index = 0;
    bool emptylines = false;
    while (getline(file, line)) {
        if (line == "") {
            emptylines = true;
            continue; // Skip empty lines
        }
        stringstream ss(line);

        getline(ss, data, ',');
        modelNo[index] = data;

        getline(ss, data, ',');
        fuelCapacity[index] = stof(data);

        getline(ss, data, ',');
        status[index] = data;
        
        index++;
    }

    file.close();
    pointer = index; // Set pointer to the number of records loaded
    if (emptylines) {
        cout << "Warning: Empty lines were found and skipped in the file." << endl;
        cout << "Correcting file by removing empty lines..." << endl;
        removeEmptyLines(); // Remove empty lines from the file
        cout << "Empty lines removed and file corrected." << endl;
    }
}

void PlaneDB::displayRecords() {
    cout << "\n========== CURRENT PLANE RECORDS ==========\n";
    cout << "S.No.\tModel No.\tFuel Capacity\tStatus" << endl;
    for (int i = 0; i < pointer; i++) {
        cout << (i + 1) << "\t" << modelNo[i] << "\t" << fuelCapacity[i] << "\t" << status[i] << endl;
    }
}

void PlaneDB::addRecord() {
    if (pointer >= capacity) {
        cout << "Plane database is full. Cannot add more records. Try again later!" << endl;
        return;
    }
    cout << "Enter Plane Model Number: ";
    getline(cin, modelNo[pointer]);
    cout << "Enter Plane Fuel Capacity: ";
    cin >> fuelCapacity[pointer];
    cin.ignore(); // Clear the input buffer
    cout << "Enter Plane Status ( 1 for Active, 2 for Inactive): ";
    int x=0;
    while (x != 1 && x != 2) {
        cin >> x;
        switch (x) {
            case 1:
                status[pointer] = "Active";
                break;
            case 2:
                status[pointer] = "Inactive";
                break;
            default:
                cout << "Invalid input for status. Try again!" << endl;
        }
    }   
    cout << "Plane record added successfully." << endl;
    pointer++; // Increment pointer for new record
}

void PlaneDB::saveData() {
    ofstream file("Data_Dependancy/Company_Planes/temp.csv");
    if (!file.is_open()) {
        cerr << "Error opening file for writing: " << fileName << endl;
    }
    for (int i = 0; i < pointer; i++) {
        file << modelNo[i] << ","
             << fuelCapacity[i] << ","
             << status[i] << endl;
    }
    file.close();
    remove(fileName.c_str()); // Remove old file
    rename("Data_Dependancy/Company_Planes/temp.csv", fileName.c_str()); // Replace old file with new file
    cout << "Data saved successfully to " << fileName << endl;
}

void PlaneDB::updateRecord(int index) {
    index--; // Adjust index for 0-based array
    if (index < 0 || index >= pointer) {
        cout << "Invalid record index." << endl;
        return;
    }
    cout << "Enter new Plane Model Number: ";
    getline(cin, modelNo[index]);
    cout << "Enter new Plane Fuel Capacity: ";
    cin >> fuelCapacity[index];
    cin.ignore(); // Clear the input buffer
    cout << "Enter new Plane Status ( 1 for Active, 2 for Inactive): ";
    int x=0;
    while (x != 1 && x != 2) {
        cin >> x;
        switch (x) {
            case 1:
                status[index] = "Active";
                break;
            case 2:
                status[index] = "Inactive";
                break;
            default:
                cout << "Invalid input for status. Try again!" << endl;
        }
    }
    cout << "Plane record updated successfully." << endl;
}

void PlaneDB::deleteRecord(int index) {
    index--; // Adjust index for 0-based array
    if (index < 0 || index >= pointer) {
        cout << "Invalid record index." << endl;
        return;
    }
    for(int i = index; i < pointer - 1; i++) {
        modelNo[i] = modelNo[i + 1];
        fuelCapacity[i] = fuelCapacity[i + 1];
        status[i] = status[i + 1];
    }
    pointer--; // Decrement pointer to reflect deleted record
    cout << "Plane record deleted successfully." << endl;
}

