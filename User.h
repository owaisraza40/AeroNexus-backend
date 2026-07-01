#ifndef USER_H
#define USER_H

#include <string>

class User {
    protected:
        inline static int no_users = 0;
        int userID = 0;
        std::string username;
        std::string password;
        std::string type;
    public:
        void initializeUser();
        void setTypeAdmin();
        void setTypeRegular();
        void setUsername(std::string name) { username = name; }
        void setPassword(std::string pass) { password = pass; }
        std::string getUsername();
        std::string getPassword();
        std::string getType();
        std::string toCSV();
        bool Login(std::string line, std::string inputUsername, std::string inputPassword);
        User toUser(std::string y);
};

#endif