
from test.services.image_process.ingest import load_ndarray, convert_cv2_to_bytes

from test.services.image_process.rescale import resize_image

from test.services.image_process.filter import convert_to_grayscale, denoise_image, binarize_image

def process_image(image_bytes: bytes) -> bytes:
    """
    Main function to run process pipeline
    
    :param image_bytes: Description
    :type image_bytes: bytes
    """
    
    # 1. convert image to np array
    image = load_ndarray(image_bytes)
    
    # 2. scale image
    scaled_image = resize_image(image)
    
    # 3. gray-scale the image
    gray_scaled_image = convert_to_grayscale(scaled_image)
    
    # 4. denoise the image
    denoised_image = denoise_image(gray_scaled_image)
    
    # 5. binarize the image 
    binary_image = binarize_image(denoised_image)
    
    # 6. convert the processed img back to bytes
    processed_bytes = convert_cv2_to_bytes(binary_image)
    
    return processed_bytes