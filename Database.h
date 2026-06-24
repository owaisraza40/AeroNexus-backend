#ifndef DATABASE_H
#define DATABASE_H

#include <string>
using namespace std;

class Database{
    protected:
        // CSV file handling info
        string fileName;          // Main CSV file name
        int pointer;           // Current number of records in the database
        int capacity;             // Maximum allocated size

    public:
        Database(string fname);
        virtual void loadData() = 0;
        virtual void saveData() = 0;
        virtual void addRecord() = 0;
        virtual void displayRecords() = 0;
        virtual void updateRecord(int index) = 0;
        virtual void deleteRecord(int index) = 0;
        void removeEmptyLines();
        virtual void setCap();
};

#endif