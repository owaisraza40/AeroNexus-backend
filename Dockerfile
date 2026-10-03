# Build stage
FROM gcc:14 AS builder

WORKDIR /app

COPY . .

RUN g++ -O2 -std=c++17 \
    server.cpp \
    Database.cpp \
    RecordDB.cpp \
    User.cpp \
    Company.cpp \
    FlightDB.cpp \
    PlaneDB.cpp \
    -o server \
    -pthread

# Production minimal runtime stage
FROM debian:bookworm-slim

WORKDIR /app

# Install standard C++ runtime libraries
RUN apt-get update && apt-get install -y --no-install-recommends libstdc++6 ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy compiled executable and database directory
COPY --from=builder /app/server /app/server
COPY --from=builder /app/Data_Dependancy /app/Data_Dependancy

ENV PORT=8080
EXPOSE 8080

CMD ["./server"]
