#ifndef FLIGHTDB_H
#define FLIGHTDB_H

#include "Database.h"
#include <string>

class FlightDB : public Database{
    protected:
        std::string* airport;
        std::string* destination;
        std::string* modelno;
        float* distance;
        std::string* status;
    public:
        FlightDB(std::string fname, int cap);
        ~FlightDB() override;
        void loadData() override;
        void saveData() override;
        void addRecord() override;
        void displayRecords() override;
        void updateRecord(int index) override;
        void deleteRecord(int index) override;
};

#endif