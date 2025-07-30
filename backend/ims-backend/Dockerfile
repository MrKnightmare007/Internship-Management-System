# Use an official Java 17 runtime as a base image
FROM openjdk:17-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven wrapper files and the pom file
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# --- ADD THIS LINE TO FIX THE PERMISSION ERROR ---
RUN chmod +x ./mvnw

# Copy your application's source code
COPY src ./src

# Build the application using the Maven wrapper
# This creates the .jar file
RUN ./mvnw package -DskipTests

# Tell Docker that the container will listen on port 8080
EXPOSE 8080

# The command to run when the container starts
ENTRYPOINT ["java","-jar","/app/target/ims-backend-0.0.1-SNAPSHOT.jar"]