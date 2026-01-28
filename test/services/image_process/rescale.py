import numpy as np
import cv2


def resize_image(image: np.ndarray, target_width: int = 1024):
    """
    Docstring for resize_image
    
    :param image: np.array
    :type image: np.ndarray
    :param target_width: target width to resize
    :type target_width: int
    """
    
    h, w = image.shape[:2]
    
    if w < target_width:
        scale_percent = target_width / w
        width = int(w * scale_percent)
        height = int(h * scale_percent)
        dim = (width, height)
        # Cubic interpolation is best for resizing text
        return cv2.resize(image, dim, interpolation=cv2.INTER_CUBIC)
    
    return image