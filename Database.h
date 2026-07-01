#ifndef DATABASE_H
#define DATABASE_H

#include <string>

class Database{
    protected:
        std::string fileName;
        int pointer;
        int capacity;

    public:
        Database(std::string fname);
        virtual ~Database() {}
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