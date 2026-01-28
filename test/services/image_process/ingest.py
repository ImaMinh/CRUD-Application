import numpy as np
import matplotlib.pyplot as plt
import io
from PIL import Image
import cv2

def load_ndarray(image_bytes: bytes):
    # 1. create an array from buffer-like obj (bytes)
    np_array = np.frombuffer(image_bytes, np.uint8)
    
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    
    if image is None:
        raise ValueError("Error: Could not decode image. The bytes might be corrupted.")
    
    return image

def convert_cv2_to_bytes(image: np.ndarray, fmt='.jpg') -> bytes:
    """
    Encodes an OpenCV image back into bytes (JPEG/PNG) for the API.
    """
    # IMWRITE_JPEG_QUALITY at 70 drops file size massively but keeps text readable
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 70]
    
    # 1. Encode the image into a memory buffer (like saving to disk, but in RAM)
    # The result is a tuple: (success_flag, encoded_data)
    success, encoded_image = cv2.imencode(fmt, image, encode_param)
    
    if not success:
        raise ValueError("Could not encode image to bytes.")
    
    # 2. Convert the buffer to standard Python bytes
    return encoded_image.tobytes()