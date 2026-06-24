FROM gcc:14

WORKDIR /app

COPY . .

RUN g++ -std=c++17 \
    server.cpp \
    Database.cpp \
    RecordDB.cpp \
    User.cpp \
    -o server \
    -pthread

EXPOSE 8080

CMD ["./server"]
