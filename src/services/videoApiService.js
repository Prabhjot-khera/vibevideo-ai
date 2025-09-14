const API_BASE_URL = 'https://videov323-e45c00e08e30.herokuapp.com';

class VideoApiService {
  // Send a chat message to the API
  static async sendMessage(message) {
    try {
      
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `message=${encodeURIComponent(message)}`,
        timeout: 30000
      });


      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data
        };
      } else {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        return {
          success: false,
          error: `API Error: ${response.status} - ${errorText}`
        };
      }
    } catch (error) {
      console.error('Network error:', error);
      return {
        success: false,
        error: `Network error: ${error.message}`
      };
    }
  }

  // Process a file with a message
  static async processFile(file, message) {
    try {
      
      // Check file type and size
      const allowedTypes = ['audio/', 'video/', 'image/'];
      const isAllowedType = allowedTypes.some(type => file.type.startsWith(type));
      
      if (!isAllowedType) {
        return {
          success: false,
          error: `Unsupported file type: ${file.type}. Please upload audio, video, or image files.`
        };
      }
      
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        return {
          success: false,
          error: 'File too large. Please upload files smaller than 100MB.'
        };
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('message', message);

      const response = await fetch(`${API_BASE_URL}/process`, {
        method: 'POST',
        body: formData,
        timeout: 60000 // 60 seconds for file processing
      });


      if (response.ok) {
        // Check if response is actually a file or JSON
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          // If it's JSON, the API might have returned an error or info
          const jsonData = await response.json();
          
          if (jsonData.error) {
            return {
              success: false,
              error: `API Error: ${jsonData.error}`
            };
          }
          
          // Check if JSON contains a URL or base64 data
          if (jsonData.url) {
            // API returned a URL to the processed file
            return {
              success: true,
              processedFile: {
                url: jsonData.url,
                type: jsonData.type || contentType || file.type,
                name: jsonData.name || `processed_${file.name}`
              },
              message: jsonData.message || 'File processed successfully!'
            };
          } else if (jsonData.base64 || jsonData.data) {
            // API returned base64 data
            return {
              success: true,
              processedFile: {
                base64: jsonData.base64 || jsonData.data,
                type: jsonData.type || contentType || file.type,
                name: jsonData.name || `processed_${file.name}`
              },
              message: jsonData.message || 'File processed successfully!'
            };
          } else {
            // If successful but no file, return success with message
            return {
              success: true,
              message: jsonData.message || 'File processed successfully!',
              data: jsonData
            };
          }
        } else {
          // It's a file, process it
          const processedFileBlob = await response.blob();
          
          console.log('Received file from backend:', {
            size: processedFileBlob.size,
            type: processedFileBlob.type,
            contentType: contentType,
            originalFileName: file.name,
            originalFileType: file.type
          });
          
          if (processedFileBlob.size === 0) {
            return {
              success: false,
              error: 'Received empty file from server. Processing may have failed.'
            };
          }
          
          // Determine file type based on content type or original file
          let fileType = file.type;
          
          // Since backend sends as application/octet-stream, we need to guess from filename
          // The backend might have changed the filename, so we need to check the response headers
          const contentDisposition = response.headers.get('content-disposition');
          let fileName = file.name?.toLowerCase() || '';
          
          // Try to extract filename from content-disposition header
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
              fileName = filenameMatch[1].replace(/['"]/g, '').toLowerCase();
              console.log('Extracted filename from content-disposition:', fileName);
            }
          }
          
          console.log('File name analysis:', {
            originalFileName: file.name,
            extractedFileName: fileName,
            contentDisposition: contentDisposition
          });
          
          if (fileName.endsWith('.m4a')) {
            fileType = 'audio/mp4';
          } else if (fileName.endsWith('.mp3')) {
            fileType = 'audio/mpeg';
          } else if (fileName.endsWith('.wav')) {
            fileType = 'audio/wav';
          } else if (fileName.endsWith('.ogg')) {
            fileType = 'audio/ogg';
          } else if (fileName.endsWith('.aac')) {
            fileType = 'audio/aac';
          } else if (fileName.endsWith('.flac')) {
            fileType = 'audio/flac';
          } else if (fileName.endsWith('.webm')) {
            fileType = 'audio/webm';
          } else if (fileName.endsWith('.mp4')) {
            fileType = 'video/mp4';
          } else if (fileName.endsWith('.mov')) {
            fileType = 'video/quicktime';
          } else if (fileName.endsWith('.avi')) {
            fileType = 'video/x-msvideo';
          } else if (fileName.endsWith('.webm')) {
            fileType = 'video/webm';
          } else if (fileName.endsWith('.mkv')) {
            fileType = 'video/x-matroska';
          } else if (contentType && (contentType.includes('audio/') || contentType.includes('video/') || contentType.includes('image/'))) {
            fileType = contentType;
          }
          
          console.log('File type detection:', {
            originalType: file.type,
            contentType,
            fileName,
            detectedType: fileType
          });
          
          
          // Ensure the blob has the correct MIME type
          const fixedBlob = fileType ? 
            new Blob([processedFileBlob], { type: fileType }) : 
            processedFileBlob;
          
          const processedFile = new File([fixedBlob], `processed_${file.name}`, {
            type: fileType
          });
          
          console.log('Created processed file:', {
            name: processedFile.name,
            type: processedFile.type,
            size: processedFile.size,
            isFile: processedFile instanceof File,
            isBlob: processedFile instanceof Blob
          });
          

          return {
            success: true,
            processedFile: processedFile,
            message: 'File processed successfully!'
          };
        }
      } else {
        const errorText = await response.text();
        console.error('File processing error:', errorText);
        
        // Try to parse as JSON for better error messages
        let errorMessage = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.detail) {
            errorMessage = errorJson.detail;
          }
        } catch (e) {
          // Not JSON, use raw text
        }
        
        return {
          success: false,
          error: `Processing error: ${response.status} - ${errorMessage}`
        };
      }
    } catch (error) {
      console.error('File processing network error:', error);
      return {
        success: false,
        error: `Processing error: ${error.message}`
      };
    }
  }

  // Check if API is available
  static async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Process multiple files for merging
  static async processMultipleFiles(files, command = 'merge', order = null) {
    try {
      console.log('Processing multiple files for merge:', {
        fileCount: files.length,
        command,
        order,
        fileNames: files.map(f => f.name)
      });

      // Try /merge endpoint first
      let response = await this.tryMergeEndpoint(files, order);
      
      // If /merge fails with 404, try /process with command=merge
      if (!response || response.status === 404) {
        console.log('Merge endpoint not available, trying /process with command=merge');
        response = await this.tryProcessMergeEndpoint(files, order);
      }

      if (!response) {
        return {
          success: false,
          error: 'Failed to process files - no valid endpoint found'
        };
      }

      if (response.status === 200) {
        const processedFileBlob = await response.blob();
        
        console.log('Received merged file from backend:', {
          size: processedFileBlob.size,
          type: processedFileBlob.type
        });

        if (processedFileBlob.size === 0) {
          return {
            success: false,
            error: 'Received empty file from server. Merge may have failed.'
          };
        }

        // Determine file type based on the input files
        const firstFile = files[0];
        let fileType = firstFile.type;
        
        // Since backend sends as application/octet-stream, guess from filename
        const contentDisposition = response.headers.get('content-disposition');
        let fileName = firstFile.name?.toLowerCase() || '';
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            fileName = filenameMatch[1].replace(/['"]/g, '').toLowerCase();
          }
        }

        // Check if any of the input files are video files
        const hasVideoFiles = files.some(file => 
          file.type?.startsWith('video/') || 
          /\.(mp4|mov|avi|webm|mkv)$/i.test(file.name)
        );
        
        const hasAudioFiles = files.some(file => 
          file.type?.startsWith('audio/') || 
          /\.(mp3|wav|m4a|ogg|aac)$/i.test(file.name)
        );

        // Determine output file type based on input files
        if (hasVideoFiles) {
          // If any input is video, output should be video
          if (fileName.endsWith('.mp4')) {
            fileType = 'video/mp4';
          } else if (fileName.endsWith('.mov')) {
            fileType = 'video/quicktime';
          } else if (fileName.endsWith('.avi')) {
            fileType = 'video/x-msvideo';
          } else if (fileName.endsWith('.webm')) {
            fileType = 'video/webm';
          } else {
            // Default to mp4 for video
            fileType = 'video/mp4';
          }
        } else if (hasAudioFiles) {
          // If only audio files, output should be audio
          if (fileName.endsWith('.m4a')) {
            fileType = 'audio/mp4';
          } else if (fileName.endsWith('.mp3')) {
            fileType = 'audio/mpeg';
          } else if (fileName.endsWith('.wav')) {
            fileType = 'audio/wav';
          } else {
            // Default to mp4 for audio
            fileType = 'audio/mp4';
          }
        } else {
          // Fallback to original logic
          if (fileName.endsWith('.m4a')) {
            fileType = 'audio/mp4';
          } else if (fileName.endsWith('.mp3')) {
            fileType = 'audio/mpeg';
          } else if (fileName.endsWith('.wav')) {
            fileType = 'audio/wav';
          } else if (fileName.endsWith('.mp4')) {
            fileType = 'video/mp4';
          } else if (fileName.endsWith('.mov')) {
            fileType = 'video/quicktime';
          }
        }

        // Generate appropriate filename based on file type
        let mergedFileName;
        if (hasVideoFiles) {
          const baseName = firstFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
          mergedFileName = `merged_${baseName}.mp4`; // Default to mp4 for video
        } else if (hasAudioFiles) {
          const baseName = firstFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
          mergedFileName = `merged_${baseName}.m4a`; // Default to m4a for audio
        } else {
          mergedFileName = `merged_${firstFile.name}`;
        }

        const processedFile = new File([processedFileBlob], mergedFileName, {
          type: fileType
        });

        console.log('Created merged file:', {
          name: processedFile.name,
          type: processedFile.type,
          size: processedFile.size
        });

        return {
          success: true,
          processedFile: processedFile,
          message: 'Files merged successfully!'
        };
      } else {
        const errorText = await response.text();
        console.error('Merge processing error:', errorText);
        return {
          success: false,
          error: `Merge failed: ${response.status} - ${errorText}`
        };
      }
    } catch (error) {
      console.error('Error processing multiple files:', error);
      return {
        success: false,
        error: `Error processing files: ${error.message}`
      };
    }
  }

  // Try the /merge endpoint
  static async tryMergeEndpoint(files, order) {
    try {
      const formData = new FormData();
      
      // Add files as 'files' field (multiple)
      files.forEach(file => {
        formData.append('files', file);
      });
      
      formData.append('message', 'merge');
      if (order) {
        formData.append('order', order);
      }

      console.log('Trying /merge endpoint');
      const response = await fetch(`${API_BASE_URL}/merge`, {
        method: 'POST',
        body: formData,
        timeout: 180000 // 3 minutes for merge operations
      });

      return response;
    } catch (error) {
      console.error('Error with /merge endpoint:', error);
      return null;
    }
  }

  // Try the /process endpoint with command=merge
  static async tryProcessMergeEndpoint(files, order) {
    try {
      const formData = new FormData();
      
      // Add files as 'file' field (multiple)
      files.forEach(file => {
        formData.append('file', file);
      });
      
      formData.append('command', 'merge');
      if (order) {
        formData.append('order', order);
      }

      console.log('Trying /process endpoint with command=merge');
      const response = await fetch(`${API_BASE_URL}/process`, {
        method: 'POST',
        body: formData,
        timeout: 180000 // 3 minutes for merge operations
      });

      return response;
    } catch (error) {
      console.error('Error with /process merge endpoint:', error);
      return null;
    }
  }
}

export default VideoApiService;
