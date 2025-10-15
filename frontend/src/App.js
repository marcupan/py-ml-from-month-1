import React, {useState} from 'react';

import WebcamCapture from './components/WebcamCapture';
import ObjectRecognition from './components/ObjectRecognition';
import logger from './utils/logger';

import './App.css';

/**
 * Main App component that orchestrates the object recognition application
 *
 * This component:
 * 1. Manages the state of recognized objects
 * 2. Renders the webcam capture component
 * 3. Displays the recognition results
 */
function App() {
    // State to store the recognized objects
    const [recognizedObjects, setRecognizedObjects] = useState([]);
    // State to track if recognition is in progress
    const [isRecognizing, setIsRecognizing] = useState(false);
    // State to store any error messages
    const [error, setError] = useState(null);
    // State to track if webcam is capturing
    const [isCapturing, setIsCapturing] = useState(false);

    console.log("App.js: isCapturing: ", isCapturing);

    /**
     * Handler for when new objects are recognized
     * @param {Array} objects - Array of recognized objects with their confidence scores
     */
    const handleObjectsRecognized = (objects) => {
        setRecognizedObjects(objects);
        setIsRecognizing(false);
    };

    /**
     * Handler for when a recognition process starts
     */
    const handleRecognitionStart = () => {
        setIsRecognizing(true);
        setError(null);
    };

    /**
     * Handler for when an error occurs during recognition
     * @param {Error} err - The error that occurred
     */
    const handleError = (err) => {
        setError(err.message);
        setIsRecognizing(false);
    };

    /**
     * Handler for starting the capture process
     */
    const handleStartCapture = () => {
        logger.info('App: Starting capture');
        setIsCapturing(true);
    };

    /**
     * Handler for stopping the capture process
     */
    const handleStopCapture = () => {
        logger.info('App: Stopping capture');
        setIsCapturing(false);
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>Real-time Object Recognition</h1>
                <p className="app-description">
                    Show objects to your webcam and see if the application can recognize them.
                </p>
            </header>

            <main className="app-main">
                <section className="webcam-section">
                    <h2>Webcam Feed</h2>
                    <WebcamCapture
                        onObjectsRecognized={handleObjectsRecognized}
                        onRecognitionStart={handleRecognitionStart}
                        onError={handleError}
                        isCapturing={isCapturing}
                        onStartCapture={handleStartCapture}
                        onStopCapture={handleStopCapture}
                    />
                </section>

                <section className="results-section">
                    <h2>Recognition Results</h2>
                    {error && <div className="error-message">{error}</div>}
                    {isRecognizing ? (
                        <div className="recognizing-message">Recognizing objects...</div>
                    ) : (
                        <ObjectRecognition objects={recognizedObjects}/>
                    )}
                </section>
            </main>

            <footer className="app-footer">
                <p>
                    This application uses a pre-trained model to recognize common objects in real-time.
                </p>
            </footer>
        </div>
    );
}

export default App;
