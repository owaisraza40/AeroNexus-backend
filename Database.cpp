#include "Database.h"
#include <iostream>
#include <fstream>
using namespace std;

Database::Database(string fname){
    fileName = fname;
    capacity = 0;
    pointer = 0;
}
void Database::setCap() {
    string line;
    int cap = 0;
    ifstream file(fileName);
    if (!file.is_open()) {
        cout << fileName
             << " not found. Creating new file..."
             << endl;

        ofstream createFile(fileName);
        createFile.close();

        capacity = 100;
        pointer = 0;
        return;
    }
    while (getline(file, line)) {
        if (line != "") {
            cap++;
        }
    }
    pointer = cap; // Set pointer to the number of records read

    file.close();
    capacity = cap; 
    cout << "File Read!" << endl;
}

void Database::removeEmptyLines() {
    string line;
    ifstream file(fileName);
    if (!file.is_open()) {
        cout << "Error: Could not open file " << fileName << endl;
        return;
    }
    string tempName = fileName + ".tmp";
    ofstream tempFile(tempName);
    while (getline(file, line)) {
        if (line != "") {
            tempFile << line << endl;
        }
    }
    file.close();
    tempFile.close();
    remove(fileName.c_str());
    rename(tempName.c_str(), fileName.c_str());
    setCap(); // Reset capacity after removing empty lines
}
