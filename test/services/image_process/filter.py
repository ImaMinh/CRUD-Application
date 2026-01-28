import cv2
import numpy as np

def convert_to_grayscale(image: np.ndarray) -> np.ndarray:
    """
    Gray-scale the image
    
    :param image: np_array loaded img
    :type image: np.ndarray
    :return: Description
    :rtype: ndarray[_AnyShape, dtype[Any]]
    """
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

def denoise_image(gray_image: np.ndarray) -> np.ndarray:
    """
    Remove noise
    
    :param gray_image: gray-scaled image
    :type gray_image: np.ndarray
    :return: Description
    :rtype: ndarray[_AnyShape, dtype[Any]]
    """
    return cv2.medianBlur(gray_image, 3)

def binarize_image(denoised_image: np.ndarray) -> np.ndarray:
    """
    Converts to pure black and white using Adaptive Thresholding; critical for OCR accuracy.
    """
    
    binarized_image = cv2.adaptiveThreshold(
        denoised_image,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        11, # Block Size (Area to look at)
        2   # C (Constant to subtract)
    )
    
    return binarized_image