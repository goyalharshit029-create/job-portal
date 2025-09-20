import fetch from 'node-fetch';

export const detectAI = async (req, res) => {
    const { resumeText } = req.body;

    if (!resumeText || resumeText.trim() === "") {
        return res.status(400).json({ error: "Resume text is required" });
    }

    try {
        // Use environment variable for Hugging Face API key
        const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;
        if (!HUGGING_FACE_API_KEY) {
            return res.status(500).json({ error: "Hugging Face API key is not set" });
        }

        const response = await fetch(
            "https://api-inference.huggingface.co/models/openai-community/roberta-base-openai-detector",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HUGGING_FACE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ inputs: resumeText }),
            }
        );

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Hugging Face API error: ${text}`);
        }

        const data = await response.json();
        const flattenedData = Array.isArray(data[0]) ? data[0] : data;

        const top = flattenedData.reduce((a, b) => (a.score > b.score ? a : b));

        // Map possible labels to AI / Human
        const labelMap = {
            "AI": "AI",
            "Human": "Human",
            "LABEL_0": "Human",
            "LABEL_1": "AI",
            "NEUTRAL": "Neutral"
        };
        const mappedLabel = labelMap[top.label] || "Neutral";

        // Adjusted thresholds
        let result = "Neutral";
        if (mappedLabel === "AI") {
            if (top.score >= 0.6) result = "Likely AI";
            else if (top.score >= 0.5) result = "Possibly AI";
            else result = "Neutral";
        } else if (mappedLabel === "Human") {
            if (top.score >= 0.6) result = "Likely Human";
            else if (top.score >= 0.5) result = "Possibly Human";
            else result = "Neutral";
        }

        res.json({
            result,
            confidence: (top.score * 100).toFixed(2) + "%",
            fullData: flattenedData
        });

    } catch (err) {
        console.error("AI detection error:", err);
        res.status(500).json({
            error: "AI detection failed",
            details: err.message
        });
    }
};
