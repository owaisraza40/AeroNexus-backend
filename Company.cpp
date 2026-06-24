#include "Company.h"
#include <fstream>
#include <sstream>
#include <iostream>
using namespace std;

Company::Company(string fname) : Database(fname) {
    setCap(); // Set capacity based on file content

    companyId = new int[capacity];
    companyName = new string[capacity];
    planeCount = new int[capacity];
    no_of_terminals = new int[capacity];

    loadData(); // Load existing data from the file

    recordlist = new RecordDB*[capacity];

    for(int i = 0; i < capacity; i++) {
        recordlist[i] = nullptr;
    }

    for(int i = 0; i < pointer; i++) {
        recordlist[i] = new RecordDB("Data_Dependancy/Company_Records/" + companyName[i] + "_records.csv"); // Initialize each record database with their won unique file name based on the company name
    }
    
    flightList = new FlightDB*[capacity];
    
    for(int i = 0; i < capacity; i++) {
        flightList[i] = nullptr;
    }

    for(int i = 0; i < pointer; i++) {
        flightList[i] = new FlightDB("Data_Dependancy/Company_Flights/" + companyName[i] + "_flights.csv", no_of_terminals[i]); // Initialize each flight database with their won unique file name based on the company name and capacity based on the number of terminals
    }

    planeList = new PlaneDB*[capacity];

    for(int i = 0; i < capacity; i++) {
        planeList[i] = nullptr;
    }

    for(int i = 0; i < pointer; i++) {
        planeList[i] = new PlaneDB("Data_Dependancy/Company_Planes/" + companyName[i] + "_planes.csv"); // Initialize each plane database with their won unique file name based on the company name
    }
}

void Company::setCap() {
    Database::setCap();
    capacity += 10; // Add extra space for company-specific records
    cout << "Company capacity set to: " << capacity << endl;
}

void Company::loadData() {
    // Implement file reading logic to populate the company database
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
        companyId[index] = stoi(data);

        getline(ss, data, ',');
        companyName[index] = data;

        getline(ss, data, ',');
        planeCount[index] = stoi(data);

        getline(ss, data, ',');
        no_of_terminals[index] = stoi(data);
        
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

void Company::saveData() {
    ofstream file("Data_Dependancy/temp.csv");
    if (!file.is_open()) {
        cerr << "Error opening file for writing: " << fileName << endl;
        return;
    }
    for (int i = 0; i < pointer; i++) {
        file << companyId[i] << ","
             << companyName[i] << ","
             << planeCount[i] << ","
             << no_of_terminals[i] << endl;
    }
    file.close();
    remove(fileName.c_str()); // Remove old file
    rename("Data_Dependancy/temp.csv", fileName.c_str()); // Replace old file with new file
    cout << "Data saved successfully to " << fileName << endl;
}

void Company::addRecord() {
    if (pointer >= capacity) {
        cout << "Company database is full. Cannot add more records. Try again later!" << endl;
        return;
    }
    
    companyId[pointer] = pointer + 1; // Assign a new company ID based on the current pointer

    cout << "Enter Company Name: ";
    getline(cin, companyName[pointer]);
    cout << "Enter Number of Planes: ";
    cin >> planeCount[pointer];
    cout << "Enter Number of Terminals: ";
    cin >> no_of_terminals[pointer];
    cin.ignore(); // Clear the input buffer
    // Initialize a new record database for this company
    recordlist[pointer] = new RecordDB("Data_Dependancy/Company_Records/" + companyName[pointer] + "_records.csv");
    
    cout << "Company record added successfully." << endl;
    pointer++; // Increment pointer for new record
}
void Company::displayRecords() {
    cout << "\n========== CURRENT Companies ==========" << endl;
    cout << "S.No.\tCompany Name\tNumber of Planes\tNumber of Terminals" << endl;
    for (int i = 0; i < pointer; i++) {
        cout << i + 1 << "\t" << companyName[i] << "\t\t" << planeCount[i] << "\t\t\t" << no_of_terminals[i] << endl;
    }
    cout << "\n=====================================\n" << endl;
}
void Company::displayPastRecords(int index) {
    index--;
    cout << "\n--- Past Flight Records for Company: " << companyName[index] << " ---" << endl;
    recordlist[index]->displayRecords(); // Display records for the specified company's record database
}
void Company::displayFlightSchedule(int index) {
    index--;
    cout << "\n--- Flight Schedule for Company: " << companyName[index] << " ---" << endl;
    flightList[index]->displayRecords(); // Display flight records for the specified company's flight database
}
void Company::displayPlaneRecords(int index) {
    index--;
    cout << "\n--- Plane Records for Company: " << companyName[index] << " ---" << endl;
    planeList[index]->displayRecords(); // Display plane records for the specified company
}

void Company::tweakPastRecords(int index) {
    index --; // Adjust index for 0-based array
    if (index < 0 || index >= pointer) {
        cout << "Invalid company index." << endl;
        return;
    }
    int choice;

    do {
        cout << "\n========== RECORD MENU ==========\n";
        cout << "Company: " << companyName[index] << endl;
        cout << "\t1. Display Records\n";
        cout << "\t2. Add Record\n";
        cout << "\t3. Update Record\n";
        cout << "\t4. Delete Record\n";
        cout << "\t5. Save Records\n";
        cout << "\t0. Return\n";
        
        cout << "Enter choice: ";

        cin >> choice;
        cin.ignore();
        switch(choice)
        {
            case 1:
                recordlist[index]->displayRecords();
                break;

            case 2:
                recordlist[index]->addRecord();
                break;

            case 3:
                cout << "Enter the record number to update: ";
                cin >> choice;
                cin.ignore();
                recordlist[index]->updateRecord(choice);
                break;

            case 4:
                cout << "Enter the record number to delete: ";
                cin >> choice;
                cin.ignore();
                recordlist[index]->deleteRecord(choice);
                break;

            case 5:
                recordlist[index]->saveData();
                break;

            case 0:
                cout << "Returning..." << endl;
                break;

            default:
                cout << "Invalid choice." << endl;
        }
    } while(choice != 0);

}

void Company::tweakFlightSchedule(int index) {
    index --; // Adjust index for 0-based array
    if (index < 0 || index >= pointer) {
        cout << "Invalid company index." << endl;
        return;
    }
    int choice;

    do {
        cout << "\n========== FLIGHT SCHEDULE MENU ==========\n";
        cout << "Company: " << companyName[index] << endl;
        cout << "\t1. Display Schedule\n";
        cout << "\t2. Add Flight\n";
        cout << "\t3. Update Flight\n";
        cout << "\t4. Delete Flight\n";
        cout << "\t5. Save Records\n";
        cout << "\t0. Return\n";
        
        cout << "Enter choice: ";

        cin >> choice;
        cin.ignore();
        switch(choice)
        {
            case 1:
                flightList[index]->displayRecords();
                break;

            case 2:
                flightList[index]->addRecord();
                break;

            case 3:
                cout << "Enter the flight number to update: ";
                cin >> choice;
                cin.ignore();
                flightList[index]->updateRecord(choice);
                break;

            case 4:
                cout << "Enter the flight number to delete: ";
                cin >> choice;
                cin.ignore();
                flightList[index]->deleteRecord(choice);
                break;

            case 5:
                flightList[index]->saveData();
                break;

            case 0:
                cout << "Returning..." << endl;
                break;

            default:
                cout << "Invalid choice." << endl;
        } 
    } while (choice != 0);
}

void Company::tweakPlaneRecords(int index) {
    index --; // Adjust index for 0-based array
    if (index < 0 || index >= pointer) {
        cout << "Invalid company index." << endl;
        return;
    }
    int choice;

    do {
        cout << "\n========== Plane Database MENU ==========\n";
        cout << "Company: " << companyName[index] << endl;
        cout << "\t1. Display Database\n";
        cout << "\t2. Add Plane\n";
        cout << "\t3. Update Plane\n";
        cout << "\t4. Delete Plane\n";
        cout << "\t5. Save Records\n";
        cout << "\t0. Return\n";
        
        cout << "Enter choice: ";

        cin >> choice;
        cin.ignore();

        switch(choice)
        {
            case 1:
                planeList[index]->displayRecords();
                break;

            case 2:
                planeList[index]->addRecord();
                planeCount[index]++; // Increment plane count for this company
                break;

            case 3:
                cout << "Enter the plane number to update: ";
                cin >> choice;
                cin.ignore();
                planeList[index]->updateRecord(choice);
                break;

            case 4:
                cout << "Enter the plane number to delete: ";
                cin >> choice;
                cin.ignore();
                planeList[index]->deleteRecord(choice);
                planeCount[index]--; // Decrement plane count for this company
                break;

            case 5:
                planeList[index]->saveData();
                break;

            case 0:
                cout << "Returning..." << endl;
                break;

            default:
                cout << "Invalid choice." << endl;
        }
    } while (choice != 0);
}

void Company::updateRecord(int index) {
    index--; // Adjust index for 0-based array
    if (index < 0 || index >= pointer) {
        cout << "Invalid record index." << endl;
        return;
    }
    cout << "Enter new Company Name: ";
    getline(cin, companyName[index]);
    cout << "Enter new Number of Planes: ";
    cin >> planeCount[index];
    cout << "Enter new Number of Terminals: ";
    cin >> no_of_terminals[index];
    cin.ignore(); // Clear the input buffer after reading numeric input
    cout << "Company record updated successfully." << endl;
}

void Company::deleteRecord(int index) {
    index--; // Adjust index for 0-based array
    if (index < 0 || index >= pointer) {
        cout << "Invalid record index." << endl;
        return;
    }
    for(int i = index; i < pointer - 1; i++) {
        companyId[i] = companyId[i + 1];
        companyName[i] = companyName[i + 1];
        planeCount[i] = planeCount[i + 1];
        no_of_terminals[i] = no_of_terminals[i + 1];
    }
    pointer--; // Decrement pointer to reflect deleted record
    cout << "Record deleted successfully." << endl;
}

void Company::addTerminal(int index) {
    index--; // Adjust index for 0-based array
    if (index < 0 || index >= pointer) {
        cout << "Invalid company index." << endl;
        return;
    }
    no_of_terminals[index]++;
    cout << "Terminal successfully incremented." << endl;
}