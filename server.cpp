#define _WIN32_WINNT 0x0A00
#include "httplib.h"
#include "RecordDB.h"
#include "User.h"
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <cstdlib>
using namespace std;

void setCORS(httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type");
}

string urlDecode(string str) {
    string result;
    for (int i = 0; i < (int)str.size(); i++) {
        if (str[i] == '+') result += ' ';
        else if (str[i] == '%' && i + 2 < (int)str.size()) {
            int val = stoi(str.substr(i+1, 2), nullptr, 16);
            result += (char)val;
            i += 2;
        } else result += str[i];
    }
    return result;
}

string parse(const string& body, const string& key) {
    auto pos = body.find(key + "=");
    if (pos == string::npos) return "";
    pos += key.size() + 1;
    auto end = body.find('&', pos);
    string val = (end == string::npos) ? body.substr(pos) : body.substr(pos, end - pos);
    return urlDecode(val);
}

string getCompanyName(int compId) {
    ifstream compFile("Data_Dependancy/Companies.csv");
    string line, compName;
    while (getline(compFile, line)) {
        if (line.empty()) continue;
        stringstream ss(line);
        string id, name;
        getline(ss, id, ',');
        getline(ss, name, ',');
        if (stoi(id) == compId) { compName = name; break; }
    }
    compFile.close();
    return compName;
}

int main() {
    httplib::Server svr;

    svr.Options(".*", [](const httplib::Request&, httplib::Response& res) {
        setCORS(res);
        res.set_content("", "text/plain");
    });

    svr.Post("/login", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(res);
        string username = parse(req.body, "username");
        string password = parse(req.body, "password");
        ifstream file("Data_Dependancy/Users.csv");
        string line;
        User profile;
        while (getline(file, line)) {
            if (line.empty()) continue;
            if (profile.Login(line, username, password)) {
                profile = profile.toUser(line);
                res.set_content("{\"success\":true,\"username\":\"" + profile.getUsername() + "\",\"type\":\"" + profile.getType() + "\"}", "application/json");
                return;
            }
        }
        res.set_content("{\"success\":false,\"message\":\"Invalid username or password\"}", "application/json");
    });

    svr.Post("/signup", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(res);
        string username = parse(req.body, "username");
        string password = parse(req.body, "password");
        ifstream checkFile("Data_Dependancy/Users.csv");
        string line;
        while (getline(checkFile, line)) {
            if (line.empty()) continue;
            stringstream ss(line);
            string id, name;
            getline(ss, id, ',');
            getline(ss, name, ',');
            if (name == username) {
                res.set_content("{\"success\":false,\"message\":\"Username already exists\"}", "application/json");
                return;
            }
        }
        checkFile.close();
        int userCount = 0;
        ifstream countFile("Data_Dependancy/Users.csv");
        while (getline(countFile, line)) { if (!line.empty()) userCount++; }
        countFile.close();
        ofstream outFile("Data_Dependancy/Users.csv", ios::app);
        outFile << userCount << "," << username << "," << password << ",regular" << endl;
        outFile.close();
        res.set_content("{\"success\":true,\"username\":\"" + username + "\",\"type\":\"regular\"}", "application/json");
    });

    svr.Get("/companies", [](const httplib::Request&, httplib::Response& res) {
        setCORS(res);
        ifstream file("Data_Dependancy/Companies.csv");
        string json = "[";
        string line;
        bool first = true;
        while (getline(file, line)) {
            if (line.empty()) continue;
            stringstream ss(line);
            string id, name, planes, terminals;
            getline(ss, id, ',');
            getline(ss, name, ',');
            getline(ss, planes, ',');
            getline(ss, terminals, ',');

            int actualPlanes = 0;
            ifstream planeFile("Data_Dependancy/Company_Planes/" + name + "_planes.csv");
            string planeLine;
            while (getline(planeFile, planeLine)) {
                if (planeLine.empty()) continue;
                stringstream ps(planeLine);
                string modelNo, fuelCapacity;
                getline(ps, modelNo, ',');
                getline(ps, fuelCapacity, ',');
                if (!modelNo.empty() && !fuelCapacity.empty())
                    actualPlanes++;
            }
            planeFile.close();

            if (!first) json += ",";
            json += "{\"id\":" + id + ",\"name\":\"" + name + "\",\"planes\":" + to_string(actualPlanes) + ",\"terminals\":" + terminals + "}";
            first = false;
        }
        json += "]";
        res.set_content(json, "application/json");
    });

    svr.Post("/companies", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(res);
        string name = parse(req.body, "name");
        string planes = parse(req.body, "planes");
        string terminals = parse(req.body, "terminals");
        int count = 0;
        string line;
        ifstream countFile("Data_Dependancy/Companies.csv");
        while (getline(countFile, line)) { if (!line.empty()) count++; }
        countFile.close();
        ofstream outFile("Data_Dependancy/Companies.csv", ios::app);
        outFile << (count + 1) << "," << name << "," << planes << "," << terminals << endl;
        outFile.close();
        ofstream recordFile("Data_Dependancy/Company_Records/" + name + "_records.csv");
        recordFile.close();
        ofstream planeFile("Data_Dependancy/Company_Planes/" + name + "_planes.csv");
        planeFile.close();
        ofstream flightFile("Data_Dependancy/Company_Flights/" + name + "_flights.csv");
        flightFile.close();
        res.set_content("{\"success\":true}", "application/json");
    });

    svr.Put("/companies/(\\d+)", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(res);
        int compId = stoi(req.matches[1]);
        string name = parse(req.body, "name");
        string planes = parse(req.body, "planes");
        string terminals = parse(req.body, "terminals");
        ifstream inFile("Data_Dependancy/Companies.csv");
        vector<string> lines;
        string line;
        while (getline(inFile, line)) {
            if (line.empty()) continue;
            stringstream ss(line);
            string id;
            getline(ss, id, ',');
            if (stoi(id) == compId)
                lines.push_back(to_string(compId) + "," + name + "," + planes + "," + terminals);
            else
                lines.push_back(line);
        }
        inFile.close();
        ofstream outFile("Data_Dependancy/Companies.csv");
        for (auto& l : lines) outFile << l << endl;
        outFile.close();
        res.set_content("{\"success\":true}", "application/json");
    });

    svr.Delete("/companies/(\\d+)", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(res);
        int delId = stoi(req.matches[1]);
        ifstream inFile("Data_Dependancy/Companies.csv");
        string line;
        vector<string> lines;
        while (getline(inFile, line)) {
            if (line.empty()) continue;
            stringstream ss(line);
            string id;
            getline(ss, id, ',');
            if (stoi(id) == delId) continue;
            lines.push_back(line);
        }
        inFile.close();
        ofstream outFile("Data_Dependancy/Companies.csv");
        for (auto& l : lines) outFile << l << endl;
        outFile.close();
        res.set_content("{\"success\":true}", "application/json");
    });

    svr.Get("/companies/(\\d+)/records", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(res);
        string compName = getCompanyName(stoi(req.matches[1]));
        RecordDB db("Data_Dependancy/Company_Records/" + compName + "_records.csv");
        string json = "[";
        bool first = true;
        for (int i = 0; i < db.getPointer(); i++) {
            if (!first) json += ",";
            json += "{\"airport\":\"" + db.getAirport(i) + "\",";
            json += "\"destination\":\"" + db.getDestination(i) + "\",";
            json += "\"modelno\":\"" + db.getModelNo(i) + "\",";
            json += "\"distance\":" + to_string(db.getDistance(i)) + ",";
            json += "\"fuelConsumed\":" + to_string(db.getFuelConsumed(i)) + ",";
            json += "\"status\":\"" + db.getStatus(i) + "\"}";
            first = false;
        }
        json += "]";
        res.set_content(json, "application/json");
    });

    svr.Post("/companies/(\\d+)/records", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(res);
        string compName = getCompanyName(stoi(req.matches[1]));
        string airport = parse(req.body, "airport");
        string destination = parse(req.body, "destination");
        string modelno = parse(req.body, "modelno");
        string distance = parse(req.body, "distance");
        string fuelConsumed = parse(req.body, "fuelConsumed");
        string status = parse(req.body, "status");
        ofstream outFile("Data_Dependancy/Company_Records/" + compName + "_records.csv", ios::app);
        outFile << airport << "," << destination << "," << modelno << "," << distance << "," << fuelConsumed << "," << status << endl;
        outFile.close();
        res.set_content("{\"success\":true}", "application/json");
    });

    svr.Put("/companies/(\\d+)/records/(\\d+)", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(res);
        string compName = getCompanyName(stoi(req.matches[1]));
        int recIndex = stoi(req.matches[2]);
        string airport = parse(req.body, "airport");
        string destination = parse(req.body, "destination");
        string modelno = parse(req.body, "modelno");
        string distance = parse(req.body, "distance");
        string fuelConsumed = parse(req.body, "fuelConsumed");
        string status = parse(req.body, "status");
        string path = "Data_Dependancy/Company_Records/" + compName + "_records.csv";
        ifstream inFile(path);
        vector<string> lines;
        string line;
        int idx = 0;
        while (getline(inFile, line)) {
            if (line.empty()) continue;
            if (idx == recIndex)
                lines.push_back(airport + "," + destination + "," + modelno + "," + distance + "," + fuelConsumed + "," + status);
            else
                lines.push_back(line);
            idx++;
        }
        inFile.close();
        ofstream outFile(path);
        for (auto& l : lines) outFile << l << endl;
        outFile.close();
        res.set_content("{\"success\":true}", "application/json");
    });

    svr.Delete("/companies/(\\d+)/records/(\\d+)", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(res);
        string compName = getCompanyName(stoi(req.matches[1]));
        int recIndex = stoi(req.matches[2]);
        string path = "Data_Dependancy/Company_Records/" + compName + "_records.csv";
        ifstream inFile(path);
        vector<string> lines;
        string line;
        int idx = 0;
        while (getline(inFile, line)) {
            if (line.empty()) continue;
            if (idx != recIndex) lines.push_back(line);
            idx++;
        }
        inFile.close();
        ofstream outFile(path);
        for (auto& l : lines) outFile << l << endl;
        outFile.close();
        res.set_content("{\"success\":true}", "application/json");
    });

    svr.Get("/companies/(\\d+)/planes", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(res);
        string compName = getCompanyName(stoi(req.matches[1]));
        ifstream file("Data_Dependancy/Company_Planes/" + compName + "_planes.csv");
        string json = "[";
        string line;
        bool first = true;
        while (getline(file, line)) {
            if (line.empty()) continue;
            stringstream ss(line);
            string modelNo, fuelCapacity, status;
            getline(ss, modelNo, ',');
            getline(ss, fuelCapacity, ',');
            getline(ss, status, ',');
            if (modelNo.empty() || fuelCapacity.empty()) continue;
            if (!first) json += ",";
            json += "{\"modelNo\":\"" + modelNo + "\",\"fuelCapacity\":" + fuelCapacity + ",\"status\":\"" + status + "\"}";
            first = false;
        }
        json += "]";
        res.set_content(json, "application/json");
    });

    svr.Post("/companies/(\\d+)/planes", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(res);
        string compName = getCompanyName(stoi(req.matches[1]));
        string modelNo = parse(req.body, "modelNo");
        string fuelCapacity = parse(req.body, "fuelCapacity");
        string status = parse(req.body, "status");
        ofstream file("Data_Dependancy/Company_Planes/" + compName + "_planes.csv", ios::app);
        file << modelNo << "," << fuelCapacity << "," << status << endl;
        file.close();
        res.set_content("{\"success\":true}", "application/json");
    });

    svr.Get("/companies/(\\d+)/flights", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(res);
        string compName = getCompanyName(stoi(req.matches[1]));
        ifstream file("Data_Dependancy/Company_Flights/" + compName + "_flights.csv");
        string json = "[";
        string line;
        bool first = true;
        while (getline(file, line)) {
            if (line.empty()) continue;
            stringstream ss(line);
            string airport, destination, modelno, distance, status;
            getline(ss, airport, ',');
            getline(ss, destination, ',');
            getline(ss, modelno, ',');
            getline(ss, distance, ',');
            getline(ss, status, ',');
            if (!first) json += ",";
            json += "{\"airport\":\"" + airport + "\",\"destination\":\"" + destination + "\",\"modelno\":\"" + modelno + "\",\"distance\":" + distance + ",\"status\":\"" + status + "\"}";
            first = false;
        }
        json += "]";
        res.set_content(json, "application/json");
    });

    svr.Post("/companies/(\\d+)/flights", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(res);
        string compName = getCompanyName(stoi(req.matches[1]));
        string airport = parse(req.body, "airport");
        string destination = parse(req.body, "destination");
        string modelno = parse(req.body, "modelno");
        string distance = parse(req.body, "distance");
        string status = parse(req.body, "status");
        ofstream file("Data_Dependancy/Company_Flights/" + compName + "_flights.csv", ios::app);
        file << airport << "," << destination << "," << modelno << "," << distance << "," << status << endl;
        file.close();
        res.set_content("{\"success\":true}", "application/json");
    });
    svr.Put("/companies/(\\d+)/planes/(\\d+)", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(res);
        string compName = getCompanyName(stoi(req.matches[1]));
        int index = stoi(req.matches[2]);
        string modelNo = parse(req.body, "modelNo");
        string fuelCapacity = parse(req.body, "fuelCapacity");
        string status = parse(req.body, "status");
        string path = "Data_Dependancy/Company_Planes/" + compName + "_planes.csv";
        ifstream inFile(path);
        vector<string> lines;
        string line;
        int idx = 0;
        while (getline(inFile, line)) {
            if (line.empty()) continue;
            if (idx == index)
                lines.push_back(modelNo + "," + fuelCapacity + "," + status);
            else
                lines.push_back(line);
            idx++;
        }
        inFile.close();
        ofstream outFile(path);
        for (auto& l : lines) outFile << l << endl;
        outFile.close();
        res.set_content("{\"success\":true}", "application/json");
    });

    svr.Delete("/companies/(\\d+)/planes/(\\d+)", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(res);
        string compName = getCompanyName(stoi(req.matches[1]));
        int index = stoi(req.matches[2]);
        string path = "Data_Dependancy/Company_Planes/" + compName + "_planes.csv";
        ifstream inFile(path);
        vector<string> lines;
        string line;
        int idx = 0;
        while (getline(inFile, line)) {
            if (line.empty()) continue;
            if (idx != index) lines.push_back(line);
            idx++;
        }
        inFile.close();
        ofstream outFile(path);
        for (auto& l : lines) outFile << l << endl;
        outFile.close();
        res.set_content("{\"success\":true}", "application/json");
    });

    svr.Put("/companies/(\\d+)/flights/(\\d+)", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(res);
        string compName = getCompanyName(stoi(req.matches[1]));
        int index = stoi(req.matches[2]);
        string airport = parse(req.body, "airport");
        string destination = parse(req.body, "destination");
        string modelno = parse(req.body, "modelno");
        string distance = parse(req.body, "distance");
        string status = parse(req.body, "status");
        string path = "Data_Dependancy/Company_Flights/" + compName + "_flights.csv";
        ifstream inFile(path);
        vector<string> lines;
        string line;
        int idx = 0;
        while (getline(inFile, line)) {
            if (line.empty()) continue;
            if (idx == index)
                lines.push_back(airport + "," + destination + "," + modelno + "," + distance + "," + status);
            else
                lines.push_back(line);
            idx++;
        }
        inFile.close();
        ofstream outFile(path);
        for (auto& l : lines) outFile << l << endl;
        outFile.close();
        res.set_content("{\"success\":true}", "application/json");
    });

    svr.Delete("/companies/(\\d+)/flights/(\\d+)", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(res);
        string compName = getCompanyName(stoi(req.matches[1]));
        int index = stoi(req.matches[2]);
        string path = "Data_Dependancy/Company_Flights/" + compName + "_flights.csv";
        ifstream inFile(path);
        vector<string> lines;
        string line;
        int idx = 0;
        while (getline(inFile, line)) {
            if (line.empty()) continue;
            if (idx != index) lines.push_back(line);
            idx++;
        }
        inFile.close();
        ofstream outFile(path);
        for (auto& l : lines) outFile << l << endl;
        outFile.close();
        res.set_content("{\"success\":true}", "application/json");
    });
    const char* portEnv = std::getenv("PORT");
    int port = portEnv ? std::stoi(portEnv) : 8080;

        cout << "AeroNexus Server running on port " << port << endl;

        svr.listen("0.0.0.0", port);
        return 0;
}