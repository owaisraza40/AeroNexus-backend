#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include "RecordDB.h"
#include "User.h"
#include "Company.h"

using namespace std;

int main() {
    User profile;
    string fileName = "Data_Dependancy/Users.csv";
    bool login = false;

    int choice;
    do {
        cout << "1. ========== Login ==========" << endl;
        cout << "2. ========== Sign Up ========" << endl;
        cout << "Enter your choice: ";
        cin >> choice;
        cin.ignore(); // Clear the input buffer

        
        if (choice == 1) {
            string inputUsername, inputPassword;
            cout << "Enter Username: ";
            getline(cin, inputUsername);
            cout << "Enter Password: ";
            getline(cin, inputPassword);

            ifstream file(fileName);
            if (!file.is_open()) {
                cerr << "Error Connecting to the DataBase: " << fileName << endl;
                break;
            }
            string line;
            string data;
            
            while (getline(file, line)) {
                if (profile.Login(line, inputUsername, inputPassword)) {
                    profile = profile.toUser(line); // Convert the line to a User object and store in profile
                    cout << "Login successful! Welcome, " << profile.getUsername() << "!" << endl;
                    login = true;
                    break;
                }
            }
            if (!login) {
                cout << "This User name and password combination does not exist." << endl;
                cout << "Please try again or Sign Up to create a new account." << endl;
            }
            file.close();
        } else if (choice == 2) {
            profile.initializeUser(); // Create a new user profile
            cout << "User created successfully! Automatic Login Successful." << endl;
            login = true;
            ofstream file(fileName);
            if (!file.is_open()) {
                cerr << "Error Connecting to the DataBase: Login info was not saved to DataBase!" << fileName << endl;
            } else {
                file << profile.toCSV() << endl;
                file.close();
            }

        } else {
            cout << "Invalid choice. Please enter 1 for Login or 2 for Sign Up." << endl;
        }
    } while((choice != 1 && choice != 2) || (!login)); // Loop until valid input is received or Login is successful


    // After successful login

    Company companies("Data_Dependancy/Companies.csv");

    do
    {
        cout << "\n========== CompanyDB Menu ==========\n";
        cout << "1. Display Companies\n";
        cout << "2. Add Company\n";
        cout << "3. Save Companies\n";
        cout << "4. Reload Companies\n";
        cout << "5. Display Company's Flight Schedule\n";
        cout << "6. Display Company's Plane Records\n";
        cout << "7. Display Company's Past Records\n";
        cout << "8. Tweak a Company's Flight Schedule\n";
        cout << "9. Tweak a Company's Plane Records\n";
        cout << "10. Tweak a Company's Past Records\n";
        cout << "0. Exit\n";
        cout << "Enter your choice: ";

        cin >> choice;
        cin.ignore();

        switch(choice)
        {
            case 1:
                companies.displayRecords();
                break;

            case 2:
                companies.addRecord();
                break;

            case 3:
                companies.saveData();
                break;

            case 4:
                companies.loadData();
                break;

            case 5:
            {
                

                cout << "\nEnter Company Index: ";
                cin >> choice;
                cin.ignore();

                companies.displayFlightSchedule(choice); // Display flight schedule for the specified company index

                break;
            }
            case 6:
            {
                cout << "\nEnter Company Index: ";
                cin >> choice;
                cin.ignore();

                companies.displayPlaneRecords(choice); // Display plane records for the specified company index

                break;
            }
            case 7:
            {
                cout << "\nEnter Company Index: ";
                cin >> choice;
                cin.ignore();

                companies.displayPastRecords(choice); // Display past records for the specified company index

                break;
            }
            case 8:
            {
                cout << "\nSelect Company Index: ";
                cin >> choice;
                cin.ignore();

                companies.tweakFlightSchedule(choice);

                break;
            }
            case 9:
            {
                cout << "\nSelect Company Index: ";
                cin >> choice;
                cin.ignore();

                companies.tweakPlaneRecords(choice);

                break;
            }
            case 10:
            {
                cout << "\nSelect Company Index: ";
                cin >> choice;
                cin.ignore();

                companies.tweakPastRecords(choice);

                break;
            }

            case 0:
                cout << "Exiting program..." << endl;
                break;

            default:
                cout << "Invalid choice." << endl;
        }

    } while(choice != 0);

    return 0;
}