#ifndef USER_H
#define USER_H

#include <string>
using namespace std;

class User {
    protected:
        inline static int no_users = 0; // Static variable to keep track of the number of users created
        int userID = 0; // Static variable to keep track of user IDs/Make Unique IDs
        string username;
        string password;
        string type; // admin or regular
    public:
        void initializeUser();
        void setTypeAdmin();
        void setTypeRegular();
        void setUsername(string name) { username = name; }
        void setPassword(string pass) { password = pass; }
        string getUsername();
        string getPassword();
        string getType();
        string toCSV();
        bool Login(string line, string inputUsername, string inputPassword);
        User toUser(string y);
};

#endif