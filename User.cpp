#include "User.h"

#include <iostream>
#include <fstream>
#include <sstream>
#include <string>

void User::initializeUser() {
    string x, y;
    cout << "Making New User..." << endl;
    cout << "Enter User Name: ";
    getline(cin, username);
        while ((x != y) || ((x == "") && (y == ""))) {
            cout << "Enter Password: ";
            getline(cin, x);
            cout << "Re-enter Password: ";
            getline(cin, y);
            if (x != y) {
            cout << "Passwords do not match! Try again." << endl;
        }
    password = x;
    userID = no_users++;
    setTypeRegular(); // Set user type to regular by default
    }
}
void User::setTypeAdmin() {
    type = "admin";
}
void User::setTypeRegular() {
    type = "regular";
}
string User::getUsername() {
    return username;
}
string User::getPassword() {
    return password;
}
string User::getType() {
    return type;
}
string User::toCSV() {
    return to_string(userID) + "," + username + "," + password + "," + type;
}
bool User::Login(string line, string inputUsername, string inputPassword) {
    stringstream ss(line);
    string data1, data2;
    getline(ss, data1, ',');
    getline(ss, data1, ',');
    getline(ss, data2, ',');
    return (data1 == inputUsername) && (data2 == inputPassword);
}
User User::toUser(string y) {
    User x;
    string data;
    if (y == ""){
        return x; // return default/Empty User if line is empty
    }
    stringstream ss(y);
    getline(ss, data, ',');
    x.userID = stoi(data);
    getline(ss, data, ',');
    x.username = data;
    getline(ss, data, ',');
    x.password = data;
    getline(ss, data, ',');
    x.type = data;
    return x;
}
