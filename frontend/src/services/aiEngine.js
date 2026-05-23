import client from '../api/client';

/**
 * runDiagnosis(imgElement, cropName, partName)
 *
 * Captures the pixels from the hidden HTML image element, draws them onto a canvas,
 * converts it into a JPEG blob, and uploads it via multipart form data to our Express /api/diagnose.
 *
 * Maps returned values directly onto the existing scanner state machine:
 *  - If identified is true: sets confidence 0.95, routing users to results view.
 *  - If identified is false: sets confidence 0.3, routing users to retake screen.
 *
 * @param {HTMLImageElement | File | Blob} imgElement
 * @param {string} cropName
 * @param {string} partName
 * @returns {Promise<any>}
 */
export async function runDiagnosis(imgElement, cropName, partName) {
  try {
    let fileBlob;
    if (imgElement instanceof File || imgElement instanceof Blob) {
      fileBlob = imgElement;
    } else {
      // Draw image to a canvas and convert to Blob
      const canvas = document.createElement('canvas');
      canvas.width = imgElement.naturalWidth || imgElement.width || 224;
      canvas.height = imgElement.naturalHeight || imgElement.height || 224;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgElement, 0, 0);
      
      fileBlob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
      });
    }

    const formData = new FormData();
    formData.append('image', fileBlob, 'scan.jpg');
    formData.append('crop', cropName);
    formData.append('part', partName);

    const response = await client.post('/api/diagnose', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data;
    if (!data.success) {
      throw new Error(data.message || 'Diagnosis failed');
    }

    const { diagnosis } = data;

    if (diagnosis.identified === false) {
      return {
        label: 'Unclear',
        confidence: 0.3, // forces existing scanner lowConfidence view routing
        cropName,
        partName,
        treatment: 'The image provided is unclear or does not appear to contain a valid crop. Please try uploading a clearer photo.',
        severity: 'None'
      };
    }

    // Format treatment guidance description text
    let treatmentStr = '';
    if (diagnosis.immediateAction) {
      treatmentStr += `Immediate Action: ${diagnosis.immediateAction}\n\n`;
    }
    if (diagnosis.treatment) {
      if (diagnosis.treatment.organic && diagnosis.treatment.organic.length > 0) {
        treatmentStr += `Organic: ${diagnosis.treatment.organic.join(', ')}\n\n`;
      }
      if (diagnosis.treatment.chemical && diagnosis.treatment.chemical.length > 0) {
        treatmentStr += `Chemical: ${diagnosis.treatment.chemical.join(', ')}\n\n`;
      }
      if (diagnosis.treatment.preventive && diagnosis.treatment.preventive.length > 0) {
        treatmentStr += `Preventive: ${diagnosis.treatment.preventive.join(', ')}\n\n`;
      }
    }
    if (diagnosis.symptoms && diagnosis.symptoms.length > 0) {
      treatmentStr += `Symptoms: ${diagnosis.symptoms.join(', ')}\n\n`;
    }
    if (diagnosis.causes) {
      treatmentStr += `Causes: ${diagnosis.causes}\n\n`;
    }
    if (diagnosis.estimatedYieldLoss) {
      treatmentStr += `Estimated Yield Loss: ${diagnosis.estimatedYieldLoss}`;
    }

    return {
      label: diagnosis.diseaseName || 'Healthy',
      confidence: 0.95, // above 50% threshold to route cleanly to success results view
      cropName,
      partName,
      treatment: treatmentStr,
      severity: diagnosis.severity || 'Medium'
    };

  } catch (err) {
    console.error('Diagnosis failed:', err);
    return { error: true, message: err.message || 'Diagnosis failed. Please try again.' };
  }
}

/**
 * Dummy warmup function to satisfy on-device TensorFlow dependencies.
 * Now that diagnosis runs on the server, this immediately resolves.
 * @returns {Promise<boolean>}
 */
export async function loadModel() {
  return true;
}

