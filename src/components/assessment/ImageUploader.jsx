import React, { useCallback } from 'react'
import { Upload, X } from 'lucide-react'

const ImageUploader = ({ images, onImagesChange }) => {
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files)
    const newImages = files.slice(0, 6 - images.length) // Max 6 images
    onImagesChange([...images, ...newImages])
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const handleDrop = useCallback((event) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    const newImages = files.slice(0, 6 - images.length)
    onImagesChange([...images, ...newImages])
  }, [images, onImagesChange])

  const handleDragOver = useCallback((event) => {
    event.preventDefault()
  }, [])

  return (
    <div>
      <div
        className={`upload-area ${images.length > 0 ? '' : 'drag-over'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('file-input').click()}
      >
        <div className="upload-icon">
          <Upload size={48} />
        </div>
        <div className="upload-text">
          Drop images here or click to upload
        </div>
        <div className="upload-hint">
          Upload up to 6 clear photos (JPEG, PNG) • Max 10MB per image
        </div>
      </div>

      <input
        id="file-input"
        type="file"
        multiple
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {images.length > 0 && (
        <div className="image-previews">
          {images.map((image, index) => (
            <div key={index} className="image-preview">
              <img 
                src={URL.createObjectURL(image)} 
                alt={`Upload ${index + 1}`}
              />
              <button 
                className="remove-image"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(index)
                }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageUploader