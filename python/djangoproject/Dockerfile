# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set environment variables for Python and ensure that Python outputs everything that's printed inside
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

# Set the working directory in the container
WORKDIR /app

# Copy only the requirements.txt file into the container at /app/djangoproject
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy the rest of the application code into the container at /app/djangoproject
COPY . .

# Expose the port Django will run on
EXPOSE 8000


