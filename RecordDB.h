#ifndef RECORDDB_H
#define RECORDDB_H

#include "Database.h"
#include <string>

class RecordDB : public Database {
    protected:
        std::string* airport;
        std::string* destination;
        std::string* modelno;
        float* distance;
        float* fuelConsumed;
        std::string* status;

    public:
        RecordDB(std::string fname);
        ~RecordDB() override;
        void setCap() override;
        void loadData() override;
        void saveData() override;
        void addRecord() override;
        void displayRecords() override;
        void updateRecord(int index) override;
        void deleteRecord(int index) override;
        int getPointer() { return pointer; }

        std::string getAirport(int i) { return (i >= 0 && i < pointer) ? airport[i] : ""; }
        std::string getDestination(int i) { return (i >= 0 && i < pointer) ? destination[i] : ""; }
        std::string getModelNo(int i) { return (i >= 0 && i < pointer) ? modelno[i] : ""; }
        float getDistance(int i) { return (i >= 0 && i < pointer) ? distance[i] : 0.0f; }
        float getFuelConsumed(int i) { return (i >= 0 && i < pointer) ? fuelConsumed[i] : 0.0f; }
        std::string getStatus(int i) { return (i >= 0 && i < pointer) ? status[i] : ""; }
};

#endif