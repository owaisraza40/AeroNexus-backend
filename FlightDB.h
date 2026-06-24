#ifndef FLIGHTDB_H
#define FLIGHTDB_H

#include "Database.h"
#include <string>
using namespace std;

class FlightDB : public Database{
    protected:
        string* airport;        // Starting airport
        string* destination;    // Destination airport

        string* modelno;     // Plane model number used in this flight

        float* distance;        // Flight distance
        
        string* status;         // Scheduled only
    public:
        FlightDB(string fname, int cap);
        void loadData() override;
        void saveData() override;
        void addRecord() override;
        void displayRecords() override;
        void updateRecord(int index) override;
        void deleteRecord(int index) override;
};

#endif