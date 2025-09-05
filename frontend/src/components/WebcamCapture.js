import React, {useRef, useCallback, useState, useEffect} from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import './WebcamCapture.css';
import logger from '../utils/logger';

/**
 * WebcamCapture component that handles webcam integration and object recognition
 *
 * This component:
 * 1. Renders a webcam feed
 * 2. Captures images at regular intervals
 * 3. Sends the captured images to the backend for object recognition
 * 4. Provides controls for starting/stopping recognition
 */
const WebcamCapture = ({
                           onObjectsRecognized,
                           onRecognitionStart,
                           onError,
                           isCapturing,
                           onStartCapture,
                           onStopCapture
                       }) => {
    const webcamRef = useRef(null);
    const [captureInterval, setCaptureInterval] = useState(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
      const isCapturingRef = useRef(isCapturing);

    // Backend API endpoint for object recognition
    const RECOGNITION_API_URL = 'http://127.0.0.1:3006/api/recognize';

    console.log("WebcamCapture.js: isCapturing: ", isCapturing);

    // Update ref whenever isCapturing changes
    useEffect(() => {
      isCapturingRef.current = isCapturing;
      logger.info('isCapturingRef updated', { isCapturing });
    }, [isCapturing]);

    /**
     * Captures an image from the webcam and sends it to the backend for recognition
     */
    const captureAndRecognize = useCallback(async () => {
        if (!webcamRef.current) {
            logger.info('captureAndRecognize called but webcamRef is not available');
            return;
        }

        // Use the ref to get the latest value of isCapturing
        const currentIsCapturing = isCapturingRef.current;
        logger.info('captureAndRecognize called', {isCapturing: currentIsCapturing});

        if (!currentIsCapturing) {
            logger.info('captureAndRecognize called but isCapturing is false, returning');
            return;
        }

        try {
            logger.info('Attempting to capture screenshot');
            // Capture image as base64 string
            logger.info('Webcam ref state', {
                defined: !!webcamRef.current,
                hasGetScreenshot: !!(webcamRef.current && webcamRef.current.getScreenshot),
                videoWidth: webcamRef.current ? webcamRef.current.video.videoWidth : 'N/A',
                videoHeight: webcamRef.current ? webcamRef.current.video.videoHeight : 'N/A',
                readyState: webcamRef.current ? webcamRef.current.video.readyState : 'N/A'
            });

            const imageSrc = webcamRef.current.getScreenshot();

            if (!imageSrc) {
                logger.warn('Failed to capture image from webcam');
                return;
            }
            logger.info('Screenshot captured successfully', {
                imageSize: imageSrc.length,
                imagePrefix: imageSrc.substring(0, 30) + '...'
            });

            // Notify parent that recognition has started
            onRecognitionStart();

            // Send image to backend for recognition
            logger.info('Sending image to backend', {url: RECOGNITION_API_URL});
            try {
                logger.info('Making API call to', RECOGNITION_API_URL);
                const response = await axios.post(RECOGNITION_API_URL, {
                    image: imageSrc
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                logger.info('Response received', {
                    status: response.status,
                    statusText: response.statusText
                });

                // Process recognition results
                if (response.data && response.data.objects) {
                    logger.info('Objects recognized', {
                        count: response.data.objects.length,
                        objects: response.data.objects
                    });
                    onObjectsRecognized(response.data.objects);
                } else {
                    logger.error('Invalid response format', response.data);
                    throw new Error('Invalid response from recognition service');
                }
            } catch (apiError) {
                logger.error('API call failed', apiError);
                logger.error('API error details', {
                    message: apiError.message,
                    code: apiError.code,
                    response: apiError.response ? {
                        status: apiError.response.status,
                        statusText: apiError.response.statusText,
                        data: apiError.response.data
                    } : 'No response',
                    request: apiError.request ? 'Request object exists' : 'No request object'
                });
                throw apiError;
            }
        } catch (error) {
            logger.error('Error during object recognition', error);
            onError(error);
        }
    }, [onObjectsRecognized, onRecognitionStart, onError]);

    /**
     * Starts the continuous capture and recognition process
     */
    const startCapturing = useCallback(() => {
        logger.info('startCapturing called');
        if (isCapturing) {
            logger.info('Already capturing, returning');
            return;
        }

        logger.info('Calling onStartCapture');
        onStartCapture();

        // Set up interval for continuous capture
        logger.info('Setting up capture interval', {intervalMs: 3000});
        const interval = setInterval(captureAndRecognize, 3000); // Capture every 3 seconds
        setCaptureInterval(interval);

        // Trigger first capture immediately
        logger.info('Triggering first capture');
        captureAndRecognize();
    }, [isCapturing, captureAndRecognize, onStartCapture]);

    /**
     * Stops the continuous capture and recognition process
     */
    const stopCapturing = useCallback(() => {
        logger.info('stopCapturing called');
        if (!isCapturing) {
            logger.info('Not currently capturing, nothing to stop');
            return;
        }

        logger.info('Calling onStopCapture');
        onStopCapture();

        // Clear the capture interval
        if (captureInterval) {
            logger.info('Clearing capture interval');
            clearInterval(captureInterval);
            setCaptureInterval(null);
        } else {
            logger.info('No capture interval to clear');
        }
        logger.info('Capture stopped successfully');
    }, [isCapturing, captureInterval, onStopCapture]);

    /**
     * Toggles the capture state
     */
    const toggleCapture = useCallback((event) => {
        logger.info('toggleCapture called', {
            isCapturing,
            eventType: event ? event.type : 'No event',
            target: event ? (event.target ? event.target.tagName : 'No target') : 'No event',
            isCameraReady
        });

        if (!isCameraReady) {
            logger.warn('Camera not ready, cannot toggle capture');
            return;
        }

        if (isCapturing) {
            logger.info('Stopping capture');
            stopCapturing();
        } else {
            logger.info('Starting capture');
            startCapturing();
        }
    }, [isCapturing, startCapturing, stopCapturing, isCameraReady]);

    /**
     * Handles webcam errors
     */
    const handleWebcamError = useCallback((error) => {
        logger.error('Webcam error', error);
        logger.error('Webcam error details', {
            name: error.name,
            message: error.message,
            constraints: error.constraints || 'No constraints info',
            stack: error.stack || 'No stack trace'
        });

        // Check for specific error types
        if (error.name === 'NotAllowedError' || error.message.includes('Permission denied')) {
            logger.error('Camera permission denied by user or system');
        } else if (error.name === 'NotFoundError' || error.message.includes('Could not find')) {
            logger.error('No camera device found');
        } else if (error.name === 'NotReadableError' || error.message.includes('Could not start video source')) {
            logger.error('Camera is in use by another application');
        }

        logger.info('Setting isCameraReady to false');
        setIsCameraReady(false);

        const userError = new Error('Failed to access webcam. Please make sure it is connected and you have granted permission.');
        logger.error('Notifying parent component of error', userError);
        onError(userError);
    }, [onError]);

    /**
     * Handles successful webcam initialization
     */
    const handleWebcamInit = useCallback(() => {
        logger.info('Webcam initialized successfully');
        logger.info('Setting isCameraReady to true');
        setIsCameraReady(true);
    }, []);

    // Clean up interval on component unmount
    useEffect(() => {
        logger.info('WebcamCapture component mounted');

        return () => {
            logger.info('WebcamCapture component unmounting');
            if (captureInterval) {
                logger.info('Cleaning up capture interval on unmount');
                clearInterval(captureInterval);
                setCaptureInterval(null);
            }
        };
    }, [captureInterval]);

    // Ensure isCapturing state is preserved across remounts
    useEffect(() => {
        return () => {
            // No need to call onStopCapture here as we want to preserve the isCapturing state
            // We only need to clean up the interval, which is done in the effect above
        };
    }, []);

    // Set up capture interval when component mounts if isCapturing is true
    useEffect(() => {
        if (isCapturing && !captureInterval && isCameraReady) {
            logger.info('Component mounted with isCapturing=true, setting up interval');
            const interval = setInterval(() => {
                // Use the ref to get the latest value inside the interval
                if (isCapturingRef.current) {
                    logger.info('Interval triggered, isCapturing is true, calling captureAndRecognize');
                    captureAndRecognize();
                } else {
                    logger.info('Interval triggered, but isCapturing is false, skipping captureAndRecognize');
                }
            }, 3000);
            setCaptureInterval(interval);

            // Trigger first capture immediately, but only if isCapturing is true
            if (isCapturing) {
                logger.info('Triggering first capture immediately, isCapturing is true');
                captureAndRecognize();
            }
        }
    }, [isCapturing, captureInterval, isCameraReady, captureAndRecognize]);

    // Webcam configuration
    const videoConstraints = {
        width: 640,
        height: 480,
        facingMode: "environment" // Use the environment-facing camera if available
    };

    return (
        <div className="webcam-container">
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onUserMedia={handleWebcamInit}
                onUserMediaError={handleWebcamError}
                className="webcam"
            />

            <div className="webcam-controls">
                <button
                    onClick={toggleCapture}
                    disabled={!isCameraReady}
                    className={`capture-button ${isCapturing ? 'capturing' : ''}`}
                >
                    {isCapturing ? 'Stop Recognition' : 'Start Recognition'}
                </button>

                {!isCameraReady && (
                    <p className="camera-status">
                        Waiting for camera access...
                    </p>
                )}
            </div>

            {isCapturing && (
                <div className="capture-indicator">
                    <div className="pulse-circle"></div>
                    <span>Recognizing...</span>
                </div>
            )}
        </div>
    );
};

export default WebcamCapture;
