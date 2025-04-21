import Sentiment from "sentiment";

const sentiment = new Sentiment();

const crisisKeywords = [
  "suicide",
  "kill myself",
  "end my life",
  "i want to die",
  "cutting",
  "self harm",
  "no way out",
  "hopeless",
  "worthless",
  "jump off",
  "overdose",
  "hurting myself",
];

export const checkForCrisis = (text: string): boolean => {
  const lower = text.toLowerCase();
  const sentimentScore = sentiment.analyze(lower).score;

  const keywordMatch = crisisKeywords.some((word) => lower.includes(word));
  const highNegative = sentimentScore < -4;

  return keywordMatch || highNegative;
};
