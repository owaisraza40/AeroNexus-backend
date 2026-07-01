#ifndef PLANEDB_H
#define PLANEDB_H

#include "Database.h"
#include <string>

class PlaneDB : public Database{
    private:
        std::string* modelNo;
        float* fuelCapacity;
        std::string* status;

    public:
        PlaneDB(std::string fname);
        ~PlaneDB() override;
        void loadData() override;
        void saveData() override;
        void setCap() override;
        void addRecord() override;
        void displayRecords() override;
        void updateRecord(int index) override;
        void deleteRecord(int index) override;
};

#endif