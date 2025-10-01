"""
Flask application for object recognition API.

This module sets up a Flask server that provides an API endpoint for object recognition.
It receives images from the frontend, processes them using a pre-trained model,
and returns the recognized objects with their confidence scores.
"""

import os
import base64
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import logging

# Import the object recognition module
from object_recognition import ObjectRecognizer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Initialize the object recognizer
recognizer = ObjectRecognizer()


@app.route('/api/recognize', methods=['POST'])
def recognize_objects():
    """
    API endpoint for object recognition.

    Receives an image as a base64 string, processes it using the object recognition model,
    and returns the recognized objects with their confidence scores.

    Returns:
        JSON response with recognized objects or error message
    """
    logger.info("Recognition endpoint called")
    try:
        # Get the image data from the request
        data = request.json
        logger.info("Request received with data")

        if not data or 'image' not in data:
            logger.error("No image data provided in request")
            return jsonify({'error': 'No image data provided'}), 400

        # Extract the base64 image data (remove the data URL prefix if present)
        image_data = data['image']
        logger.info("Image data received")

        if image_data.startswith('data:image'):
            # Extract the base64 part from the data URL
            image_data = image_data.split(',')[1]
            logger.info("Extracted base64 data from data URL")

        # Decode the base64 image
        try:
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            logger.info(f"Image decoded successfully: {image.size}")
        except Exception as e:
            logger.error(f"Error decoding image: {str(e)}")
            return jsonify({'error': f'Error decoding image: {str(e)}'}), 400

        # Perform object recognition
        logger.info("Starting object recognition")
        objects = recognizer.recognize(image)
        logger.info(f"Recognition complete, found {len(objects)} objects")

        # Return the results
        return jsonify({'objects': objects})

    except Exception as e:
        logger.error(f"Error during object recognition: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify the API is running.

    Returns:
        JSON response with status information
    """
    logger.info("Health check endpoint called")
    return jsonify({
        'status': 'healthy',
        'message': 'Object recognition API is running'
    })


@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """
    Simple test endpoint to verify connectivity.

    Returns:
        JSON response with test message
    """
    logger.info("Test endpoint called")
    return jsonify({
        'message': 'Backend connection successful',
        'status': 'ok'
    })


if __name__ == '__main__':
    # Get port from environment variable or use default
    port = int(os.environ.get('PORT', 3006))

    # Run the Flask app
    app.run(host='0.0.0.0', port=port, debug=True)
