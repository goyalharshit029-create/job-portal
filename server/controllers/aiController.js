import fetch from "node-fetch";

export const detectAI = async (req, res) => {
    const { resumeText } = req.body;

    if (!resumeText || resumeText.trim() === "") {
        return res.status(400).json({ error: "Resume text is required" });
    }

    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/openai-community/roberta-base-openai-detector",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.HF_API_KEY}`,
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

        // Flatten nested array if returned
        const flattenedData = Array.isArray(data[0]) ? data[0] : data;

        // Get top prediction by score
        const top = flattenedData.reduce((a, b) => (a.score > b.score ? a : b));

        // Map labels to Human/AI/Neutral with threshold
        let result = "Neutral";
        const threshold = 0.6; // 60%
        if (top.label === "ENTAILMENT" && top.score >= threshold) result = "Human";
        else if (top.label === "CONTRADICTION" && top.score >= threshold) result = "AI";

        res.json({
            result,
            confidence: (top.score * 100).toFixed(2) + "%",
            fullData: flattenedData
        });

    } catch (err) {
        console.error("Hugging Face AI detection error:", err);
        res.status(500).json({
            error: "AI detection failed",
            details: err.message
        });
    }
};
