#ifndef COMPANY_H
#define COMPANY_H

#include "Database.h"
#include "PlaneDB.h"
#include "FlightDB.h"
#include "RecordDB.h"
#include <string>

class Company : public Database {
    private:
        int* companyId;
        std::string* companyName;

        int* planeCount = nullptr;
        int* no_of_terminals;
        PlaneDB** planeList;
        FlightDB** flightList;
        RecordDB** recordlist;

    public:
        Company(std::string fname);
        ~Company() override;
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