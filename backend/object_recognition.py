"""
Object recognition module using PyTorch and a pre-trained model.

This module provides a class for recognizing objects in images using
a pre-trained deep learning model from torchvision.
"""

import torch
import torchvision
from torchvision import transforms
from PIL import Image
import logging
import io
import base64

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ObjectRecognizer:
    """
    Class for recognizing objects in images using a pre-trained model.

    This class loads a pre-trained model from torchvision and provides
    methods for recognizing objects in images.
    """

    def __init__(self, model_name='resnet50', device=None):
        """
        Initialize the object recognizer with a pre-trained model.

        Args:
            model_name (str): Name of the pre-trained model to use.
                              Default is 'resnet50'.
            device (str): Device to run the model on ('cpu' or 'cuda').
                          If None, will use CUDA if available.
        """
        # Determine the device to use
        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = torch.device(device)

        logger.info(f"Using device: {self.device}")

        # Load the pre-trained model
        try:
            # For PyTorch 2.2.0+, use weights parameter instead of pretrained
            self.model = torchvision.models.detection.fasterrcnn_resnet50_fpn(
                weights=torchvision.models.detection.FasterRCNN_ResNet50_FPN_Weights.DEFAULT
            )
            self.model.eval()  # Set the model to evaluation mode
            self.model.to(self.device)
            logger.info(f"Loaded model: {model_name}")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise

        # Load the class labels (COCO dataset)
        self.categories = [
            '__background__', 'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus',
            'train', 'truck', 'boat', 'traffic light', 'fire hydrant', 'N/A', 'stop sign',
            'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow',
            'elephant', 'bear', 'zebra', 'giraffe', 'N/A', 'backpack', 'umbrella', 'N/A', 'N/A',
            'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
            'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
            'bottle', 'N/A', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl',
            'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza',
            'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed', 'N/A', 'dining table',
            'N/A', 'N/A', 'toilet', 'N/A', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone',
            'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'N/A', 'book',
            'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
        ]

        # Define the image transformation
        self.transform = transforms.Compose([
            transforms.ToTensor(),
        ])

    def recognize(self, image, threshold=0.5, max_objects=10):
        """
        Recognize objects in an image.

        Args:
            image (PIL.Image): The input image.
            threshold (float): Confidence threshold for object detection.
                              Default is 0.5.
            max_objects (int): Maximum number of objects to return.
                              Default is 10.

        Returns:
            list: List of dictionaries containing recognized objects with their
                 names and confidence scores.
        """
        try:
            logger.info(f"Starting recognition on image of size: {image.size}")

            # Transform the image
            logger.info("Transforming image to tensor")
            img_tensor = self.transform(image)
            img_tensor = img_tensor.unsqueeze(0)  # Add batch dimension
            img_tensor = img_tensor.to(self.device)
            logger.info(f"Image tensor shape: {img_tensor.shape}")

            # Perform inference
            logger.info("Running inference with model")
            with torch.no_grad():
                predictions = self.model(img_tensor)
            logger.info("Inference completed")

            # Process the predictions
            pred = predictions[0]
            boxes = pred['boxes'].cpu().numpy()
            scores = pred['scores'].cpu().numpy()
            labels = pred['labels'].cpu().numpy()
            logger.info(f"Raw predictions: {len(boxes)} bounding boxes detected")

            # Filter predictions by threshold and get top objects
            filtered_indices = scores >= threshold
            boxes = boxes[filtered_indices]
            scores = scores[filtered_indices]
            labels = labels[filtered_indices]
            logger.info(f"After threshold filtering ({threshold}): {len(boxes)} boxes remain")

            # Limit to max_objects
            if len(scores) > max_objects:
                top_indices = scores.argsort()[-max_objects:][::-1]
                boxes = boxes[top_indices]
                scores = scores[top_indices]
                labels = labels[top_indices]
                logger.info(f"Limited to top {max_objects} objects")

            # Create the result list
            objects = []
            for i in range(len(scores)):
                label_id = labels[i]
                if 0 <= label_id < len(self.categories):
                    category = self.categories[label_id]
                    if category != 'N/A' and category != '__background__':
                        objects.append({
                            'name': category,
                            'confidence': float(scores[i])
                        })
                        logger.info(f"Detected object: {category} with confidence {float(scores[i]):.4f}")

            logger.info(f"Recognized {len(objects)} objects")
            return objects

        except Exception as e:
            logger.error(f"Error during object recognition: {str(e)}")
            raise

    def recognize_base64(self, base64_image, threshold=0.5, max_objects=10):
        """
        Recognize objects in a base64-encoded image.

        Args:
            base64_image (str): Base64-encoded image string.
            threshold (float): Confidence threshold for object detection.
            max_objects (int): Maximum number of objects to return.

        Returns:
            list: List of dictionaries containing recognized objects with their
                 names and confidence scores.
        """
        try:
            logger.info("Starting base64 image recognition")

            # Log the length of the base64 string to help diagnose issues
            base64_length = len(base64_image)
            logger.info(f"Base64 image string length: {base64_length}")

            # Decode the base64 image
            logger.info("Decoding base64 image")
            try:
                image_data = base64.b64decode(base64_image)
                logger.info(f"Decoded image data size: {len(image_data)} bytes")
            except Exception as decode_error:
                logger.error(f"Failed to decode base64 image: {str(decode_error)}")
                raise

            # Open the image
            try:
                image = Image.open(io.BytesIO(image_data))
                logger.info(f"Opened image with format: {image.format}, mode: {image.mode}, size: {image.size}")
            except Exception as image_error:
                logger.error(f"Failed to open image from decoded data: {str(image_error)}")
                raise

            # Recognize objects in the image
            logger.info("Calling recognize method on decoded image")
            result = self.recognize(image, threshold, max_objects)
            logger.info("Base64 image recognition completed")
            return result

        except Exception as e:
            logger.error(f"Error processing base64 image: {str(e)}")
            raise


# Example usage
if __name__ == "__main__":
    # Create an instance of the object recognizer
    recognizer = ObjectRecognizer()

    # Load an example image
    image_path = "example.jpg"
    try:
        image = Image.open(image_path)

        # Recognize objects in the image
        objects = recognizer.recognize(image)

        # Print the results
        print("Recognized objects:")
        for obj in objects:
            print(f"- {obj['name']} ({obj['confidence']:.2f})")

    except FileNotFoundError:
        print(f"Example image not found: {image_path}")
        print("This is just an example. In the actual application, images will be received from the frontend.")
