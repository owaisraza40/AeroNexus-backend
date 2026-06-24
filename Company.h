#ifndef COMPANY_H
#define COMPANY_H

#include "Database.h"
#include "PlaneDB.h"
#include "FlightDB.h"
#include "RecordDB.h"
#include <string>
using namespace std;

class Company : public Database {
    private:
        int* companyId;
        string* companyName;

        // Dynamic list of PlaneDB objects for this company
        int* planeCount = 0;
        int* no_of_terminals;
        PlaneDB** planeList;
        FlightDB** flightList;
        

        // Record database for this company
        RecordDB** recordlist;

    public:
        Company(string fname);
        void setCap() override;
        void loadData() override;
        void saveData() override;
        void addRecord() override;
        void addTerminal(int index);
        void displayRecords() override;
        void displayPastRecords(int index);
        void displayPlaneRecords(int index);
        void displayFlightSchedule(int index);
        void tweakPastRecords(int index);
        void tweakFlightSchedule(int index);
        void tweakPlaneRecords(int index);
        void updateRecord(int index) override;
        void deleteRecord(int index) override;
};

#endif