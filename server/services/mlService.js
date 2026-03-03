const axios = require('axios');

exports.predictRisk = async (features) => {
  try {
    const response = await axios.post(
      "http://localhost:8000/predict-risk",
      features,
      {
        timeout: 5000 // 5 seconds max wait before failing fast gracefully
      }
    );
    
    return response.data.risk_score;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.warn("⚠️ FastAPI ML Service is not running at port 8000. Returning fallback average risk score.");
    } else {
      console.error("❌ Machine Learning Prediction Error:", error.message);
    }
    // Return a default mathematical safe value if the microservice drops
    return 50; 
  }
};
