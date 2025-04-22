import Sentiment from "sentiment";
import nlp from "compromise";

const sentiment = new Sentiment();

export function analyzeEmotion(text: string) {
  const doc = nlp(text);
  const keywords = [
    ...doc.nouns().out("array"),
    ...doc.adjectives().out("array"),
  ];

  const result = sentiment.analyze(text);
  const score = result.score;
  const comparative = result.comparative;

  return {
    score,
    keywords,
    comparative,
    timestamp: new Date().toISOString(),
  };
}
