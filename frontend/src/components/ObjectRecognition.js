import React from 'react';

import './ObjectRecognition.css';

/**
 * ObjectRecognition component that displays the recognized objects and their confidence scores
 *
 * This component:
 * 1. Renders a list of recognized objects
 * 2. Shows confidence scores for each object
 * 3. Provides visual indicators for confidence levels
 */
const ObjectRecognition = ({objects = []}) => {
    // Helper function to get color based on confidence score
    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8) return 'high-confidence';
        if (confidence >= 0.5) return 'medium-confidence';

        return 'low-confidence';
    };

    // Helper functions to format confidence as percentage
    const formatConfidence = (confidence) => {
        return `${(confidence * 100).toFixed(1)}%`;
    };

    return (
        <div className="recognition-container">
            {objects.length === 0 ? (
                <div className="no-objects">
                    <p>No objects recognized yet.</p>
                    <p className="instruction">Point your camera at an object and press "Start Recognition".</p>
                </div>
            ) : (
                <>
                    <ul className="objects-list">
                        {objects.map((obj, index) => (
                            <li key={index} className="object-item">
                                <div className="object-name">{obj.name}</div>
                                <div className={`object-confidence ${getConfidenceColor(obj.confidence)}`}>
                                    <div
                                        className="confidence-bar"
                                        style={{width: `${obj.confidence * 100}%`}}
                                    />
                                    <span className="confidence-text">{formatConfidence(obj.confidence)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="recognition-info">
                        <p>
                            <strong>{objects.length}</strong> {objects.length === 1 ? 'object' : 'objects'} recognized
                        </p>
                        <p className="confidence-legend">
                            Confidence levels:
                            <span className="legend-item high-confidence">High</span>
                            <span className="legend-item medium-confidence">Medium</span>
                            <span className="legend-item low-confidence">Low</span>
                        </p>
                    </div>
                </>
            )}

            <div className="recognition-explanation">
                <h3>How it works</h3>
                <p>
                    This application uses computer vision to recognize objects in real-time.
                    The webcam captures images that are sent to a machine learning model
                    trained to identify common objects.
                </p>
                <p>
                    The confidence score indicates how certain the model is about its prediction.
                    Higher confidence means the model is more certain about the object identification.
                </p>
            </div>
        </div>
    );
};

export default ObjectRecognition;
