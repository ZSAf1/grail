import React, { useState } from 'react';

function Scanner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setLoading(true);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(',')[1];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.REACT_APP_GEMINI_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': process.env.REACT_APP_GEMINI_KEY
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: `You are a fashion expert and authenticator. Analyse this clothing item or outfit image and return ONLY a JSON object with no extra text, no markdown, no backticks. The JSON should have these fields:
                  {
                    "brand": "detected brand or Unknown",
                    "item": "item name e.g. oversized blazer",
                    "category": "tops/bottoms/shoes/outerwear/bags/accessories",
                    "color": "main color",
                    "condition": "excellent/good/fair based on appearance",
                    "estimated_retail": "estimated retail price range e.g. £50-£80",
                    "estimated_resale": "estimated resale value e.g. £20-£35",
                    "authenticity": "Likely authentic / Cannot verify / Likely counterfeit",
                    "notes": "one sentence of useful fashion insight about this item"
                  }`
                },
                {
                  inline_data: {
                    mime_type: file.type,
                    data: base64
                  }
                }
              ]
            }]
          })
        }
      );

      const data = await response.json();
      console.log('gemini response', data);

      try {
        const text = data.candidates[0].content.parts[0].text;
        const clean = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);
        setResult(parsed);
      } catch (err) {
        console.log('parse error', err);
        console.log('raw response', JSON.stringify(data));
        setResult({ error: 'Could not read the image. Try a clearer photo.' });
      }

      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="scanner">
      <div className="scanner-title">scanner</div>

      <label className="scan-area" style={{ cursor: 'pointer' }}>
        <div className="scan-corner tl"></div>
        <div className="scan-corner tr"></div>
        <div className="scan-corner bl"></div>
        <div className="scan-corner br"></div>
        {previewUrl ? (
          <img src={previewUrl} alt="scanned" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
        ) : (
          <>
            <div className="scan-icon">⊹</div>
            <p className="scan-text">tap to upload a photo of any garment or outfit</p>
          </>
        )}
        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
      </label>

      {loading && (
        <div className="loading">analysing your item...</div>
      )}

      {result && !result.error && (
        <div className="scan-result">
          <div className="scan-result-top">
            <div>
              <div className="scan-brand">{result.brand}</div>
              <div className="scan-name">{result.item}</div>
            </div>
            <div className="verified-pill">{result.authenticity}</div>
          </div>
          <div className="scan-row">
            <span className="scan-key">category</span>
            <span className="scan-val">{result.category}</span>
          </div>
          <div className="scan-row">
            <span className="scan-key">colour</span>
            <span className="scan-val">{result.color}</span>
          </div>
          <div className="scan-row">
            <span className="scan-key">condition</span>
            <span className="scan-val">{result.condition}</span>
          </div>
          <div className="scan-row">
            <span className="scan-key">retail price</span>
            <span className="scan-val">{result.estimated_retail}</span>
          </div>
          <div className="scan-row">
            <span className="scan-key">resale value</span>
            <span className="scan-val">{result.estimated_resale}</span>
          </div>
          <div className="scan-row">
            <span className="scan-key">notes</span>
            <span className="scan-val" style={{ maxWidth: '60%', textAlign: 'right' }}>{result.notes}</span>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="loading">{result.error}</div>
      )}

      <div style={{ marginBottom: '120px' }}></div>
    </div>
  );
}

export default Scanner;