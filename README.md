# Real-time Object Recognition with React and Python

This project is a single-page web application that uses a webcam to recognize objects in real-time. It demonstrates how to integrate computer vision capabilities into a web application using React for the frontend and Python for the backend.

## Project Overview

The application allows users to:
1. Access their webcam directly from the browser
2. Capture images in real-time
3. Send these images to a Python backend for object recognition
4. Display the recognized objects with their confidence scores

## Technologies Used

### Frontend
- React 18
- react-webcam for camera access
- Axios for API communication
- Modern CSS with responsive design

### Backend
- Flask for the API server
- PyTorch and torchvision for object recognition
- Pre-trained Faster R-CNN model
- PIL for image processing

## Project Structure

```
project/
├── frontend/               # React frontend
│   ├── public/             # Static files
│   │   └── index.html      # HTML entry point
│   ├── src/                # React source code
│   │   ├── components/     # React components
│   │   │   ├── WebcamCapture.js     # Webcam component
│   │   │   ├── WebcamCapture.css    # Webcam styles
│   │   │   ├── ObjectRecognition.js # Results display component
│   │   │   └── ObjectRecognition.css # Results styles
│   │   ├── App.js          # Main App component
│   │   ├── App.css         # App styles
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Global styles
│   └── package.json        # Frontend dependencies
│
├── backend/                # Python backend
│   ├── app.py              # Flask application
│   ├── object_recognition.py # Object recognition module
│   └── requirements.txt    # Python dependencies
│
└── README.md               # Project documentation
```

## Setup Instructions

### Prerequisites
- Node.js and npm
- Python 3.8 or higher
- Webcam

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. The application will be available at http://localhost:3000

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Start the Flask server:
   ```
   python app.py
   ```

5. The API will be available at http://localhost:3006

## How It Works

### Object Recognition Process
1. The webcam captures images at regular intervals
2. Images are converted to base64 format and sent to the backend
3. The backend decodes the images and passes them to the pre-trained model
4. The model identifies objects in the image and returns their names and confidence scores
5. Results are sent back to the frontend and displayed to the user

### Machine Learning Model
The application uses a pre-trained Faster R-CNN model with a ResNet-50 backbone from torchvision. This model is trained on the COCO dataset, which can recognize 80 common object categories.

## Educational Concepts

This project demonstrates several important concepts in modern web development and machine learning:

1. **React Hooks**: Using useState, useEffect, useRef, and useCallback for state management and side effects
2. **Webcam Integration**: Accessing device cameras through the browser
3. **API Communication**: Sending and receiving data between frontend and backend
4. **Computer Vision**: Using pre-trained models for object recognition
5. **Base64 Image Encoding**: Converting between image formats for web transmission
6. **Responsive Design**: Creating a UI that works on different screen sizes

## Extending the Project

Here are some ways you could extend this project:
- Add the ability to save and share recognition results
- Implement object tracking across video frames
- Add support for custom object detection models
- Implement server-side caching to improve performance
- Add user authentication and result history

## Troubleshooting

### Camera Access Issues
- Make sure your browser has permission to access the camera
- Try using a different browser if you encounter issues
- Check that no other application is using the camera

### Backend Connection Issues
- Ensure the backend server is running
- Check that the API URL in the frontend matches the backend port (should be 3006)
- Look for CORS errors in the browser console
- Check the browser console for debugging logs that show the request flow
- If you click "Start Recognition" and nothing happens:
  1. Open your browser's developer tools (F12 or right-click > Inspect)
  2. Go to the Console tab to see if there are any error messages
  3. Look for logs like "toggleCapture called", "startCapturing called", etc.
  4. If you don't see these logs, there might be a JavaScript error preventing the button click handler from working
  5. If you see the logs but no API requests in the Network tab, check if the webcam is properly initialized

### Using Logs for Troubleshooting

This application has comprehensive logging to help diagnose issues:

#### Frontend Logs
The frontend logs detailed information to the browser console:
- Button click events ("toggleCapture called")
- Webcam initialization status
- Image capture attempts and results
- API requests and responses
- Detailed error information for webcam issues
- Component lifecycle events

To view these logs:
1. Open your browser's developer tools (F12 or right-click > Inspect)
2. Go to the Console tab
3. Look for logs with timestamps to trace the flow of events

The application uses a custom logger utility (`frontend/src/utils/logger.js`) that adds timestamps and log levels to all messages. This makes it easier to trace the sequence of events and identify issues. Log messages look like:

```
[2023-06-15T12:34:56.789Z] [INFO] toggleCapture called: {"isCapturing":false}
```

You can filter logs by level (INFO, ERROR, etc.) in the browser console to focus on specific types of messages.

#### Backend Logs
The backend logs detailed information to the console where you started the server:
- API endpoint calls
- Image processing steps
- Object recognition process details
- Detailed error information

To view these logs:
1. Look at the terminal/console where you started the Python server
2. The logs include timestamps and severity levels (INFO, ERROR)
3. For more detailed logs, you can modify the logging level in app.py and object_recognition.py

The logs can help identify where the process is failing:
- If you see frontend logs but no backend logs, there might be a network connectivity issue
- If you see backend logs but recognition fails, check the object_recognition.py logs for details
- If the webcam isn't initializing, check the frontend logs for webcam error details

#### Testing Backend Connectivity
If you're experiencing issues with the backend connection, you can use the provided test page to verify connectivity:

1. Make sure your backend server is running
2. Open the file `backend/test_connection.html` in your browser
3. Click the "Test Health Endpoint" button to check if the backend is responding
4. Click the "Test Connection Endpoint" button to verify the connection

If these tests fail, it indicates a problem with the backend server or network connectivity. Check:
- That the backend server is running on port 3006
- That there are no firewall or network issues blocking the connection
- That the backend logs show the server starting successfully

If the tests succeed but the main application still doesn't work, the issue might be with:
- The webcam initialization
- The image capture process
- The API request from the React application

#### Testing Webcam Capture and Image Sending
To isolate issues with the webcam capture or image sending process:

1. Open the file `frontend/test_webcam.html` in your browser
2. Click "Start Webcam" to initialize the camera
3. Click "Capture Image" to take a snapshot
4. Click "Send Image to Backend" to send the image to the recognition endpoint

This test bypasses the React application and directly tests the core functionality. If this test works but the main application doesn't, the issue is likely in the React application's state management or event handling.

### Dependency Installation Issues
- If you encounter issues with PyTorch installation, make sure you're using Python 3.8 or higher
- The project now requires PyTorch 2.2.0 or higher, which may not be available for all Python versions
- If you see errors about torch not being found, try installing it separately:
  ```
  pip install torch>=2.2.0 torchvision>=0.17.0
  ```
- If you're using an M1/M2 Mac, you may need to install PyTorch with specific options:
  ```
  pip install torch>=2.2.0 torchvision>=0.17.0 --extra-index-url https://download.pytorch.org/whl/cpu
  ```

## License

This project is open source and available for educational purposes.
