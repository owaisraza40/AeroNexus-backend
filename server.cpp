#define _WIN32_WINNT 0x0A00
#include "httplib.h"
#include "json.hpp"
#include "picosha2.h"
#include "RecordDB.h"
#include "User.h"
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <cstdlib>
#include <mutex>
#include <unordered_map>
#include <random>
#include <algorithm>

using namespace std;
using json = nlohmann::json;

mutex db_mutex;
unordered_map<string, User> sessions;

string generateToken() {
    static random_device rd;
    static mt19937 gen(rd());
    static uniform_int_distribution<> dis(0, 15);
    const char* v = "0123456789abcdef";
    string res;
    for (int i = 0; i < 32; i++) res += v[dis(gen)];
    return res;
}

void setCORS(const httplib::Request& req, httplib::Response& res) {
    string origin = req.get_header_value("Origin");
    if (origin.empty()) origin = "*";
    res.set_header("Access-Control-Allow-Origin", origin);
    res.set_header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set_header("Access-Control-Allow-Credentials", "true");
}

string urlDecode(string str) {
    string result;
    for (int i = 0; i < (int)str.size(); i++) {
        if (str[i] == '+') result += ' ';
        else if (str[i] == '%' && i + 2 < (int)str.size()) {
            try {
                int val = stoi(str.substr(i+1, 2), nullptr, 16);
                result += (char)val;
            } catch (...) {}
            i += 2;
        } else result += str[i];
    }
    return result;
}

string parse(const string& body, const string& key) {
    string search = key + "=";
    auto pos = body.find(search);
    while (pos != string::npos) {
        if (pos == 0 || body[pos - 1] == '&') {
            pos += search.size();
            auto end = body.find('&', pos);
            string val = (end == string::npos) ? body.substr(pos) : body.substr(pos, end - pos);
            return urlDecode(val);
        }
        pos = body.find(search, pos + 1);
    }
    return "";
}

string sanitizeCSV(string val) {
    val.erase(remove(val.begin(), val.end(), ','), val.end());
    val.erase(remove(val.begin(), val.end(), '\n'), val.end());
    val.erase(remove(val.begin(), val.end(), '\r'), val.end());
    return val;
}

string sanitizeFilename(string name) {
    string out;
    for (char c : name) {
        if (isalnum(c) || c == ' ' || c == '-' || c == '_') out += c;
    }
    return out;
}

User* getAuthUser(const httplib::Request& req) {
    string auth = req.get_header_value("Authorization");
    if (auth.substr(0, 7) == "Bearer ") {
        string token = auth.substr(7);
        if (sessions.count(token)) return &sessions[token];
    }
    return nullptr;
}

bool authCheck(const httplib::Request& req, httplib::Response& res, bool requireAdmin = false) {
    User* u = getAuthUser(req);
    if (!u) {
        json j = {{"success", false}, {"message", "Unauthorized"}};
        res.status = 401;
        res.set_content(j.dump(), "application/json");
        return false;
    }
    if (requireAdmin && u->getType() != "admin") {
        json j = {{"success", false}, {"message", "Forbidden: Admins only"}};
        res.status = 403;
        res.set_content(j.dump(), "application/json");
        return false;
    }
    return true;
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
        try {
            if (stoi(id) == compId) { compName = name; break; }
        } catch(...) {}
    }
    compFile.close();
    return compName;
}

void jsonError(httplib::Response& res, const string& msg, int status = 400) {
    json j = {{"success", false}, {"message", msg}};
    res.status = status;
    res.set_content(j.dump(), "application/json");
}

int main() {
    httplib::Server svr;

    svr.Options(".*", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(req, res);
        res.set_content("", "text/plain");
    });

    svr.Post("/login", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(req, res);
        lock_guard<mutex> lock(db_mutex);
        string username = parse(req.body, "username");
        string password = parse(req.body, "password");
        if (username.empty() || password.empty()) return jsonError(res, "Missing credentials");
        
        string hashed_pass = picosha2::hash256_hex_string(password);
        
        ifstream file("Data_Dependancy/Users.csv");
        string line;
        User profile;
        bool found = false;
        while (getline(file, line)) {
            if (line.empty()) continue;
            if (profile.Login(line, username, hashed_pass)) {
                profile = profile.toUser(line);
                found = true;
                break;
            }
        }
        if (found) {
            string token = generateToken();
            sessions[token] = profile;
            json j = {
                {"success", true},
                {"token", token},
                {"username", profile.getUsername()},
                {"type", profile.getType()}
            };
            res.set_content(j.dump(), "application/json");
        } else {
            jsonError(res, "Invalid username or password");
        }
    });

    svr.Post("/signup", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(req, res);
        lock_guard<mutex> lock(db_mutex);
        string username = parse(req.body, "username");
        string password = parse(req.body, "password");
        if (username.empty() || password.empty()) return jsonError(res, "Missing credentials");
        
        username = sanitizeCSV(username);
        
        ifstream checkFile("Data_Dependancy/Users.csv");
        string line;
        int maxId = -1;
        while (getline(checkFile, line)) {
            if (line.empty()) continue;
            stringstream ss(line);
            string id, name;
            getline(ss, id, ',');
            getline(ss, name, ',');
            if (name == username) return jsonError(res, "Username already exists");
            try {
                int curId = stoi(id);
                if (curId > maxId) maxId = curId;
            } catch(...) {}
        }
        checkFile.close();
        
        int newId = maxId + 1;
        string hashed_pass = picosha2::hash256_hex_string(password);
        
        ofstream outFile("Data_Dependancy/Users.csv", ios::app);
        outFile << newId << "," << username << "," << hashed_pass << ",regular\n";
        outFile.close();
        
        json j = {{"success", true}, {"username", username}, {"type", "regular"}};
        res.set_content(j.dump(), "application/json");
    });

    svr.Get("/companies", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(req, res);
        if (!authCheck(req, res)) return;
        lock_guard<mutex> lock(db_mutex);
        
        ifstream file("Data_Dependancy/Companies.csv");
        json j = json::array();
        string line;
        while (getline(file, line)) {
            if (line.empty()) continue;
            stringstream ss(line);
            string id, name, planes, terminals;
            getline(ss, id, ',');
            getline(ss, name, ',');
            getline(ss, planes, ',');
            getline(ss, terminals, ',');

            int actualPlanes = 0;
            ifstream planeFile("Data_Dependancy/Company_Planes/" + sanitizeFilename(name) + "_planes.csv");
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

            try {
                j.push_back({
                    {"id", stoi(id)},
                    {"name", name},
                    {"planes", actualPlanes},
                    {"terminals", stoi(terminals)}
                });
            } catch(...) {}
        }
        res.set_content(j.dump(), "application/json");
    });

    svr.Post("/companies", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(req, res);
        if (!authCheck(req, res, true)) return;
        lock_guard<mutex> lock(db_mutex);
        
        string name = parse(req.body, "name");
        string planes = parse(req.body, "planes");
        string terminals = parse(req.body, "terminals");
        
        if (name.empty() || planes.empty() || terminals.empty()) return jsonError(res, "Missing required fields");
        name = sanitizeCSV(name);
        string safeName = sanitizeFilename(name);
        if (safeName.empty()) return jsonError(res, "Invalid company name");
        
        int p, t;
        try {
            p = stoi(planes);
            t = stoi(terminals);
            if (p < 0 || t < 0) return jsonError(res, "Values cannot be negative");
        } catch(...) { return jsonError(res, "Invalid numeric fields"); }
        
        int maxId = 0;
        string line;
        ifstream countFile("Data_Dependancy/Companies.csv");
        while (getline(countFile, line)) {
            if (line.empty()) continue;
            stringstream ss(line);
            string id, cname;
            getline(ss, id, ',');
            getline(ss, cname, ',');
            if (cname == name) return jsonError(res, "Company name already exists");
            try {
                int cid = stoi(id);
                if (cid > maxId) maxId = cid;
            } catch(...) {}
        }
        countFile.close();
        
        int newId = maxId + 1;
        ofstream outFile("Data_Dependancy/Companies.csv", ios::app);
        outFile << newId << "," << name << "," << p << "," << t << "\n";
        outFile.close();
        
        ofstream recordFile("Data_Dependancy/Company_Records/" + safeName + "_records.csv");
        ofstream planeFile("Data_Dependancy/Company_Planes/" + safeName + "_planes.csv");
        ofstream flightFile("Data_Dependancy/Company_Flights/" + safeName + "_flights.csv");
        
        json j = {{"success", true}};
        res.set_content(j.dump(), "application/json");
    });

    svr.Put(R"(/companies/(\d+))", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(req, res);
        if (!authCheck(req, res, true)) return;
        lock_guard<mutex> lock(db_mutex);
        
        int compId = stoi(req.matches[1]);
        string name = sanitizeCSV(parse(req.body, "name"));
        string planes = parse(req.body, "planes");
        string terminals = parse(req.body, "terminals");
        
        if (name.empty() || planes.empty() || terminals.empty()) return jsonError(res, "Missing required fields");
        string safeName = sanitizeFilename(name);
        if (safeName.empty()) return jsonError(res, "Invalid company name");
        
        int p, t;
        try {
            p = stoi(planes);
            t = stoi(terminals);
            if (p < 0 || t < 0) return jsonError(res, "Values cannot be negative");
        } catch(...) { return jsonError(res, "Invalid numeric fields"); }
        
        ifstream inFile("Data_Dependancy/Companies.csv");
        vector<string> lines;
        string line, oldName;
        bool duplicate = false;
        
        while (getline(inFile, line)) {
            if (line.empty()) continue;
            stringstream ss(line);
            string id, cname;
            getline(ss, id, ',');
            getline(ss, cname, ',');
            try {
                int cid = stoi(id);
                if (cid == compId) oldName = cname;
                else if (cname == name) duplicate = true;
            } catch(...) {}
        }
        inFile.clear();
        inFile.seekg(0);
        
        if (duplicate) return jsonError(res, "Company name already exists");
        if (oldName.empty()) return jsonError(res, "Company not found", 404);
        
        while (getline(inFile, line)) {
            if (line.empty()) continue;
            stringstream ss(line);
            string id;
            getline(ss, id, ',');
            try {
                if (stoi(id) == compId) {
                    lines.push_back(to_string(compId) + "," + name + "," + to_string(p) + "," + to_string(t));
                } else {
                    lines.push_back(line);
                }
            } catch(...) { lines.push_back(line); }
        }
        inFile.close();
        
        ofstream outFile("Data_Dependancy/Companies.csv");
        for (auto& l : lines) outFile << l << "\n";
        outFile.close();
        
        string oldSafe = sanitizeFilename(oldName);
        if (oldSafe != safeName) {
            rename(("Data_Dependancy/Company_Records/" + oldSafe + "_records.csv").c_str(), ("Data_Dependancy/Company_Records/" + safeName + "_records.csv").c_str());
            rename(("Data_Dependancy/Company_Planes/" + oldSafe + "_planes.csv").c_str(), ("Data_Dependancy/Company_Planes/" + safeName + "_planes.csv").c_str());
            rename(("Data_Dependancy/Company_Flights/" + oldSafe + "_flights.csv").c_str(), ("Data_Dependancy/Company_Flights/" + safeName + "_flights.csv").c_str());
        }
        
        json j = {{"success", true}};
        res.set_content(j.dump(), "application/json");
    });

    svr.Delete(R"(/companies/(\d+))", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(req, res);
        if (!authCheck(req, res, true)) return;
        lock_guard<mutex> lock(db_mutex);
        
        int delId = stoi(req.matches[1]);
        ifstream inFile("Data_Dependancy/Companies.csv");
        string line, oldName;
        vector<string> lines;
        
        while (getline(inFile, line)) {
            if (line.empty()) continue;
            stringstream ss(line);
            string id, cname;
            getline(ss, id, ',');
            getline(ss, cname, ',');
            try {
                if (stoi(id) == delId) oldName = cname;
                else lines.push_back(line);
            } catch(...) { lines.push_back(line); }
        }
        inFile.close();
        
        if (oldName.empty()) return jsonError(res, "Company not found", 404);
        
        ofstream outFile("Data_Dependancy/Companies.csv");
        for (auto& l : lines) outFile << l << "\n";
        outFile.close();
        
        string safeName = sanitizeFilename(oldName);
        remove(("Data_Dependancy/Company_Records/" + safeName + "_records.csv").c_str());
        remove(("Data_Dependancy/Company_Planes/" + safeName + "_planes.csv").c_str());
        remove(("Data_Dependancy/Company_Flights/" + safeName + "_flights.csv").c_str());
        
        json j = {{"success", true}};
        res.set_content(j.dump(), "application/json");
    });

    svr.Get(R"(/companies/(\d+)/records)", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(req, res);
        if (!authCheck(req, res)) return;
        lock_guard<mutex> lock(db_mutex);
        
        string compName = getCompanyName(stoi(req.matches[1]));
        if (compName.empty()) return jsonError(res, "Company not found", 404);
        
        RecordDB db("Data_Dependancy/Company_Records/" + sanitizeFilename(compName) + "_records.csv");
        json j = json::array();
        for (int i = 0; i < db.getPointer(); i++) {
            string a = db.getAirport(i);
            if (a.empty()) break; 
            j.push_back({
                {"airport", db.getAirport(i)},
                {"destination", db.getDestination(i)},
                {"modelno", db.getModelNo(i)},
                {"distance", db.getDistance(i)},
                {"fuelConsumed", db.getFuelConsumed(i)},
                {"status", db.getStatus(i)}
            });
        }
        res.set_content(j.dump(), "application/json");
    });

    svr.Post(R"(/companies/(\d+)/records)", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(req, res);
        if (!authCheck(req, res, true)) return;
        lock_guard<mutex> lock(db_mutex);
        
        string compName = getCompanyName(stoi(req.matches[1]));
        if (compName.empty()) return jsonError(res, "Company not found", 404);
        
        string airport = sanitizeCSV(parse(req.body, "airport"));
        string destination = sanitizeCSV(parse(req.body, "destination"));
        string modelno = sanitizeCSV(parse(req.body, "modelno"));
        string distance = parse(req.body, "distance");
        string fuelConsumed = parse(req.body, "fuelConsumed");
        string status = sanitizeCSV(parse(req.body, "status"));
        
        if (airport.empty() || destination.empty() || modelno.empty() || distance.empty() || fuelConsumed.empty() || status.empty()) 
            return jsonError(res, "Missing required fields");
            
        try {
            if (stof(distance) < 0 || stof(fuelConsumed) < 0) return jsonError(res, "Values cannot be negative");
        } catch(...) { return jsonError(res, "Invalid numeric fields"); }
        
        ofstream outFile("Data_Dependancy/Company_Records/" + sanitizeFilename(compName) + "_records.csv", ios::app);
        outFile << airport << "," << destination << "," << modelno << "," << distance << "," << fuelConsumed << "," << status << "\n";
        outFile.close();
        
        json j = {{"success", true}};
        res.set_content(j.dump(), "application/json");
    });

    svr.Put(R"(/companies/(\d+)/records/(\d+))", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(req, res);
        if (!authCheck(req, res, true)) return;
        lock_guard<mutex> lock(db_mutex);
        
        string compName = getCompanyName(stoi(req.matches[1]));
        if (compName.empty()) return jsonError(res, "Company not found", 404);
        int recIndex = stoi(req.matches[2]);
        
        string airport = sanitizeCSV(parse(req.body, "airport"));
        string destination = sanitizeCSV(parse(req.body, "destination"));
        string modelno = sanitizeCSV(parse(req.body, "modelno"));
        string distance = parse(req.body, "distance");
        string fuelConsumed = parse(req.body, "fuelConsumed");
        string status = sanitizeCSV(parse(req.body, "status"));
        
        if (airport.empty() || destination.empty() || modelno.empty() || distance.empty() || fuelConsumed.empty() || status.empty()) 
            return jsonError(res, "Missing required fields");
            
        try {
            if (stof(distance) < 0 || stof(fuelConsumed) < 0) return jsonError(res, "Values cannot be negative");
        } catch(...) { return jsonError(res, "Invalid numeric fields"); }
        
        string path = "Data_Dependancy/Company_Records/" + sanitizeFilename(compName) + "_records.csv";
        ifstream inFile(path);
        vector<string> lines;
        string line;
        int idx = 0;
        bool found = false;
        while (getline(inFile, line)) {
            if (line.empty()) continue;
            if (idx == recIndex) {
                lines.push_back(airport + "," + destination + "," + modelno + "," + distance + "," + fuelConsumed + "," + status);
                found = true;
            } else {
                lines.push_back(line);
            }
            idx++;
        }
        inFile.close();
        
        if (!found) return jsonError(res, "Record not found", 404);
        
        ofstream outFile(path);
        for (auto& l : lines) outFile << l << "\n";
        outFile.close();
        json j = {{"success", true}};
        res.set_content(j.dump(), "application/json");
    });

    svr.Delete(R"(/companies/(\d+)/records/(\d+))", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(req, res);
        if (!authCheck(req, res, true)) return;
        lock_guard<mutex> lock(db_mutex);
        
        string compName = getCompanyName(stoi(req.matches[1]));
        if (compName.empty()) return jsonError(res, "Company not found", 404);
        int recIndex = stoi(req.matches[2]);
        
        string path = "Data_Dependancy/Company_Records/" + sanitizeFilename(compName) + "_records.csv";
        ifstream inFile(path);
        vector<string> lines;
        string line;
        int idx = 0;
        bool found = false;
        while (getline(inFile, line)) {
            if (line.empty()) continue;
            if (idx != recIndex) lines.push_back(line);
            else found = true;
            idx++;
        }
        inFile.close();
        
        if (!found) return jsonError(res, "Record not found", 404);
        
        ofstream outFile(path);
        for (auto& l : lines) outFile << l << "\n";
        outFile.close();
        json j = {{"success", true}};
        res.set_content(j.dump(), "application/json");
    });

    svr.Get(R"(/companies/(\d+)/planes)", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(req, res);
        if (!authCheck(req, res)) return;
        lock_guard<mutex> lock(db_mutex);
        
        string compName = getCompanyName(stoi(req.matches[1]));
        if (compName.empty()) return jsonError(res, "Company not found", 404);
        
        ifstream file("Data_Dependancy/Company_Planes/" + sanitizeFilename(compName) + "_planes.csv");
        json j = json::array();
        string line;
        while (getline(file, line)) {
            if (line.empty()) continue;
            stringstream ss(line);
            string modelNo, fuelCapacity, status;
            getline(ss, modelNo, ',');
            getline(ss, fuelCapacity, ',');
            getline(ss, status, ',');
            if (modelNo.empty() || fuelCapacity.empty()) continue;
            try {
                j.push_back({
                    {"modelNo", modelNo},
                    {"fuelCapacity", stof(fuelCapacity)},
                    {"status", status}
                });
            } catch(...) {}
        }
        res.set_content(j.dump(), "application/json");
    });

    svr.Post(R"(/companies/(\d+)/planes)", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(req, res);
        if (!authCheck(req, res, true)) return;
        lock_guard<mutex> lock(db_mutex);
        
        string compName = getCompanyName(stoi(req.matches[1]));
        if (compName.empty()) return jsonError(res, "Company not found", 404);
        
        string modelNo = sanitizeCSV(parse(req.body, "modelNo"));
        string fuelCapacity = parse(req.body, "fuelCapacity");
        string status = sanitizeCSV(parse(req.body, "status"));
        
        if (modelNo.empty() || fuelCapacity.empty() || status.empty()) return jsonError(res, "Missing required fields");
        try {
            if (stof(fuelCapacity) < 0) return jsonError(res, "Values cannot be negative");
        } catch(...) { return jsonError(res, "Invalid numeric fields"); }
        
        ofstream file("Data_Dependancy/Company_Planes/" + sanitizeFilename(compName) + "_planes.csv", ios::app);
        file << modelNo << "," << fuelCapacity << "," << status << "\n";
        file.close();
        json j = {{"success", true}};
        res.set_content(j.dump(), "application/json");
    });

    svr.Put(R"(/companies/(\d+)/planes/(\d+))", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(req, res);
        if (!authCheck(req, res, true)) return;
        lock_guard<mutex> lock(db_mutex);
        
        string compName = getCompanyName(stoi(req.matches[1]));
        if (compName.empty()) return jsonError(res, "Company not found", 404);
        int index = stoi(req.matches[2]);
        
        string modelNo = sanitizeCSV(parse(req.body, "modelNo"));
        string fuelCapacity = parse(req.body, "fuelCapacity");
        string status = sanitizeCSV(parse(req.body, "status"));
        
        if (modelNo.empty() || fuelCapacity.empty() || status.empty()) return jsonError(res, "Missing required fields");
        try {
            if (stof(fuelCapacity) < 0) return jsonError(res, "Values cannot be negative");
        } catch(...) { return jsonError(res, "Invalid numeric fields"); }
        
        string path = "Data_Dependancy/Company_Planes/" + sanitizeFilename(compName) + "_planes.csv";
        ifstream inFile(path);
        vector<string> lines;
        string line;
        int idx = 0;
        bool found = false;
        while (getline(inFile, line)) {
            if (line.empty()) continue;
            if (idx == index) {
                lines.push_back(modelNo + "," + fuelCapacity + "," + status);
                found = true;
            } else {
                lines.push_back(line);
            }
            idx++;
        }
        inFile.close();
        
        if (!found) return jsonError(res, "Record not found", 404);
        
        ofstream outFile(path);
        for (auto& l : lines) outFile << l << "\n";
        outFile.close();
        json j = {{"success", true}};
        res.set_content(j.dump(), "application/json");
    });

    svr.Delete(R"(/companies/(\d+)/planes/(\d+))", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(req, res);
        if (!authCheck(req, res, true)) return;
        lock_guard<mutex> lock(db_mutex);
        
        string compName = getCompanyName(stoi(req.matches[1]));
        if (compName.empty()) return jsonError(res, "Company not found", 404);
        int index = stoi(req.matches[2]);
        
        string path = "Data_Dependancy/Company_Planes/" + sanitizeFilename(compName) + "_planes.csv";
        ifstream inFile(path);
        vector<string> lines;
        string line;
        int idx = 0;
        bool found = false;
        while (getline(inFile, line)) {
            if (line.empty()) continue;
            if (idx != index) lines.push_back(line);
            else found = true;
            idx++;
        }
        inFile.close();
        
        if (!found) return jsonError(res, "Record not found", 404);
        
        ofstream outFile(path);
        for (auto& l : lines) outFile << l << "\n";
        outFile.close();
        json j = {{"success", true}};
        res.set_content(j.dump(), "application/json");
    });

    svr.Get(R"(/companies/(\d+)/flights)", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(req, res);
        if (!authCheck(req, res)) return;
        lock_guard<mutex> lock(db_mutex);
        
        string compName = getCompanyName(stoi(req.matches[1]));
        if (compName.empty()) return jsonError(res, "Company not found", 404);
        
        ifstream file("Data_Dependancy/Company_Flights/" + sanitizeFilename(compName) + "_flights.csv");
        json j = json::array();
        string line;
        while (getline(file, line)) {
            if (line.empty()) continue;
            stringstream ss(line);
            string airport, destination, modelno, distance, status;
            getline(ss, airport, ',');
            getline(ss, destination, ',');
            getline(ss, modelno, ',');
            getline(ss, distance, ',');
            getline(ss, status, ',');
            if (airport.empty() || distance.empty()) continue;
            try {
                j.push_back({
                    {"airport", airport},
                    {"destination", destination},
                    {"modelno", modelno},
                    {"distance", stof(distance)},
                    {"status", status}
                });
            } catch(...) {}
        }
        res.set_content(j.dump(), "application/json");
    });

    svr.Post(R"(/companies/(\d+)/flights)", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(req, res);
        if (!authCheck(req, res, true)) return;
        lock_guard<mutex> lock(db_mutex);
        
        string compName = getCompanyName(stoi(req.matches[1]));
        if (compName.empty()) return jsonError(res, "Company not found", 404);
        
        string airport = sanitizeCSV(parse(req.body, "airport"));
        string destination = sanitizeCSV(parse(req.body, "destination"));
        string modelno = sanitizeCSV(parse(req.body, "modelno"));
        string distance = parse(req.body, "distance");
        string status = sanitizeCSV(parse(req.body, "status"));
        
        if (airport.empty() || destination.empty() || modelno.empty() || distance.empty() || status.empty()) return jsonError(res, "Missing required fields");
        try {
            if (stof(distance) < 0) return jsonError(res, "Values cannot be negative");
        } catch(...) { return jsonError(res, "Invalid numeric fields"); }
        
        ofstream file("Data_Dependancy/Company_Flights/" + sanitizeFilename(compName) + "_flights.csv", ios::app);
        file << airport << "," << destination << "," << modelno << "," << distance << "," << status << "\n";
        file.close();
        json j = {{"success", true}};
        res.set_content(j.dump(), "application/json");
    });

    svr.Put(R"(/companies/(\d+)/flights/(\d+))", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(req, res);
        if (!authCheck(req, res, true)) return;
        lock_guard<mutex> lock(db_mutex);
        
        string compName = getCompanyName(stoi(req.matches[1]));
        if (compName.empty()) return jsonError(res, "Company not found", 404);
        int index = stoi(req.matches[2]);
        
        string airport = sanitizeCSV(parse(req.body, "airport"));
        string destination = sanitizeCSV(parse(req.body, "destination"));
        string modelno = sanitizeCSV(parse(req.body, "modelno"));
        string distance = parse(req.body, "distance");
        string status = sanitizeCSV(parse(req.body, "status"));
        
        if (airport.empty() || destination.empty() || modelno.empty() || distance.empty() || status.empty()) return jsonError(res, "Missing required fields");
        try {
            if (stof(distance) < 0) return jsonError(res, "Values cannot be negative");
        } catch(...) { return jsonError(res, "Invalid numeric fields"); }
        
        string path = "Data_Dependancy/Company_Flights/" + sanitizeFilename(compName) + "_flights.csv";
        ifstream inFile(path);
        vector<string> lines;
        string line;
        int idx = 0;
        bool found = false;
        while (getline(inFile, line)) {
            if (line.empty()) continue;
            if (idx == index) {
                lines.push_back(airport + "," + destination + "," + modelno + "," + distance + "," + status);
                found = true;
            } else {
                lines.push_back(line);
            }
            idx++;
        }
        inFile.close();
        
        if (!found) return jsonError(res, "Record not found", 404);
        
        ofstream outFile(path);
        for (auto& l : lines) outFile << l << "\n";
        outFile.close();
        json j = {{"success", true}};
        res.set_content(j.dump(), "application/json");
    });

    svr.Delete(R"(/companies/(\d+)/flights/(\d+))", [](const httplib::Request& req, httplib::Response& res) {
        setCORS(req, res);
        if (!authCheck(req, res, true)) return;
        lock_guard<mutex> lock(db_mutex);
        
        string compName = getCompanyName(stoi(req.matches[1]));
        if (compName.empty()) return jsonError(res, "Company not found", 404);
        int index = stoi(req.matches[2]);
        
        string path = "Data_Dependancy/Company_Flights/" + sanitizeFilename(compName) + "_flights.csv";
        ifstream inFile(path);
        vector<string> lines;
        string line;
        int idx = 0;
        bool found = false;
        while (getline(inFile, line)) {
            if (line.empty()) continue;
            if (idx != index) lines.push_back(line);
            else found = true;
            idx++;
        }
        inFile.close();
        
        if (!found) return jsonError(res, "Record not found", 404);
        
        ofstream outFile(path);
        for (auto& l : lines) outFile << l << "\n";
        outFile.close();
        json j = {{"success", true}};
        res.set_content(j.dump(), "application/json");
    });

    const char* portEnv = std::getenv("PORT");
    int port = portEnv ? std::stoi(portEnv) : 8080;

    cout << "AeroNexus Server running on port " << port << endl;
    svr.listen("0.0.0.0", port);
    return 0;
}